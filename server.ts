import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("library.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS seats (
    id TEXT PRIMARY KEY,
    floor INTEGER,
    type TEXT,
    clusterId TEXT,
    label TEXT,
    status TEXT,
    bookedBy TEXT,
    bookedAt TEXT,
    vacateBy TEXT,
    otp TEXT,
    entryTime TEXT,
    exitTime TEXT,
    checkInStatus TEXT,
    duration INTEGER
  );

  CREATE TABLE IF NOT EXISTS queries (
    id TEXT PRIMARY KEY,
    studentId TEXT,
    studentName TEXT,
    message TEXT,
    response TEXT,
    status TEXT,
    viewed INTEGER DEFAULT 0,
    createdAt TEXT
  );

  CREATE TABLE IF NOT EXISTS logs (
    id TEXT PRIMARY KEY,
    studentId TEXT,
    studentName TEXT,
    seatLabel TEXT,
    floor INTEGER,
    type TEXT,
    timestamp TEXT
  );

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT,
    password TEXT,
    role TEXT,
    gender TEXT,
    studentId TEXT,
    adminId TEXT
  );
`);

// Seed initial seats if empty
const seatCount = db.prepare("SELECT COUNT(*) as count FROM seats").get();
if (seatCount.count === 0) {
  const INITIAL_SEATS = [
    // Floor 1
    ...Array.from({ length: 12 }).flatMap((_, clusterIdx) => 
      Array.from({ length: 4 }).map((_, seatIdx) => ({
        id: `f1-c${clusterIdx + 1}-s${seatIdx + 1}`,
        floor: 1,
        type: 'TABLE_SEAT',
        clusterId: `T${clusterIdx + 1}`,
        label: `S${(clusterIdx * 4) + seatIdx + 1}`,
        status: clusterIdx < 6 ? 'RESERVED_MALE' : 'RESERVED_FEMALE',
      }))
    ),
    // Floor 2
    ...Array.from({ length: 12 }).flatMap((_, clusterIdx) => 
      Array.from({ length: 8 }).map((_, seatIdx) => ({
        id: `f2-c${clusterIdx + 1}-s${seatIdx + 1}`,
        floor: 2,
        type: 'TABLE_SEAT',
        clusterId: `T${clusterIdx + 1}`,
        label: `S${(clusterIdx * 8) + seatIdx + 1}`,
        status: 'AVAILABLE',
      }))
    ),
    // Floor 3
    ...Array.from({ length: 10 }).map((_, cabinIdx) => ({
      id: `f3-cab${cabinIdx + 1}`,
      floor: 3,
      type: 'CABIN',
      label: `C${cabinIdx + 1}`,
      status: 'AVAILABLE',
    })),
  ];

  const insertSeat = db.prepare(`
    INSERT INTO seats (id, floor, type, clusterId, label, status)
    VALUES (@id, @floor, @type, @clusterId, @label, @status)
  `);

  const transaction = db.transaction((seats) => {
    for (const seat of seats) insertSeat.run(seat);
  });
  transaction(INITIAL_SEATS);
}

// Seed initial admin if empty
const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get();
if (userCount.count === 0) {
  const adminPassword = await bcrypt.hash("admin123", 10);
  db.prepare(`
    INSERT INTO users (id, name, password, role, adminId)
    VALUES (?, ?, ?, ?, ?)
  `).run("ADMIN001", "System Admin", adminPassword, "ADMIN", "ADMIN001");
}

async function startServer() {
  const app = express();
  const PORT = 4000;

  app.use(express.json());

  // Auth Routes
  app.post("/api/auth/register", async (req, res) => {
    const { id, name, password, role, gender, studentId, adminId } = req.body;
    
    const existing = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
    if (existing) {
      return res.status(400).json({ error: "User ID already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    try {
      db.prepare(`
        INSERT INTO users (id, name, password, role, gender, studentId, adminId)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(id, name, hashedPassword, role, gender, studentId, adminId);
      
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Registration failed." });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { id, password, role } = req.body;
    
    const user = db.prepare("SELECT * FROM users WHERE id = ? AND role = ?").get(id, role);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // Don't send password back
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  // API Routes
  app.get("/api/seats", (req, res) => {
    const seats = db.prepare("SELECT * FROM seats").all();
    res.json(seats);
  });

  app.post("/api/seats/book", (req, res) => {
    const { seatId, userId, duration } = req.body;
    
    // Check if user already has a booking
    const existing = db.prepare("SELECT * FROM seats WHERE bookedBy = ?").get(userId);
    if (existing) {
      return res.status(400).json({ error: "You already have an active booking." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const vacateTime = new Date();
    vacateTime.setHours(vacateTime.getHours() + duration);

    const result = db.prepare(`
      UPDATE seats 
      SET status = 'OCCUPIED', 
          bookedBy = ?, 
          bookedAt = ?, 
          vacateBy = ?, 
          otp = ?, 
          checkInStatus = 'PENDING', 
          duration = ?
      WHERE id = ? AND status IN ('AVAILABLE', 'RESERVED_MALE', 'RESERVED_FEMALE')
    `).run(userId, new Date().toISOString(), vacateTime.toISOString(), otp, duration, seatId);

    if (result.changes === 0) {
      return res.status(400).json({ error: "Seat is no longer available." });
    }

    res.json({ success: true, otp });
  });

  app.post("/api/seats/vacate", (req, res) => {
    const { seatId, userId } = req.body;
    db.prepare(`
      UPDATE seats 
      SET status = 'AVAILABLE', 
          bookedBy = NULL, 
          bookedAt = NULL, 
          vacateBy = NULL, 
          otp = NULL, 
          checkInStatus = NULL, 
          entryTime = NULL, 
          exitTime = NULL,
          duration = NULL
      WHERE id = ? AND bookedBy = ?
    `).run(seatId, userId);
    res.json({ success: true });
  });

  app.post("/api/seats/verify", (req, res) => {
    const { otp } = req.body;
    const seat = db.prepare("SELECT * FROM seats WHERE otp = ?").get(otp);
    
    if (!seat) {
      return res.status(400).json({ error: "Invalid OTP." });
    }

    const timestamp = new Date().toISOString();
    let message = "";

    if (seat.checkInStatus === 'PENDING') {
      db.prepare(`
        UPDATE seats 
        SET checkInStatus = 'CHECKED_IN', entryTime = ? 
        WHERE id = ?
      `).run(timestamp, seat.id);
      
      db.prepare(`
        INSERT INTO logs (id, studentId, studentName, seatLabel, floor, type, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(Math.random().toString(36).substr(2, 9), seat.bookedBy, "Student", seat.label, seat.floor, 'ENTRY', timestamp);
      
      message = `Student ${seat.bookedBy} checked in successfully!`;
    } else if (seat.checkInStatus === 'CHECKED_IN') {
      db.prepare(`
        UPDATE seats 
        SET status = 'AVAILABLE', bookedBy = NULL, otp = NULL, checkInStatus = 'CHECKED_OUT', exitTime = ? 
        WHERE id = ?
      `).run(timestamp, seat.id);

      db.prepare(`
        INSERT INTO logs (id, studentId, studentName, seatLabel, floor, type, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(Math.random().toString(36).substr(2, 9), seat.bookedBy, "Student", seat.label, seat.floor, 'EXIT', timestamp);
      
      message = `Student ${seat.bookedBy} checked out successfully!`;
    }

    res.json({ success: true, message });
  });

  app.get("/api/queries", (req, res) => {
    const queries = db.prepare("SELECT * FROM queries ORDER BY createdAt DESC").all();
    res.json(queries);
  });

  app.post("/api/queries", (req, res) => {
    const { studentId, studentName, message } = req.body;
    const id = Math.random().toString(36).substr(2, 9);
    db.prepare(`
      INSERT INTO queries (id, studentId, studentName, message, status, createdAt)
      VALUES (?, ?, ?, ?, 'PENDING', ?)
    `).run(id, studentId, studentName, message, new Date().toISOString());
    res.json({ success: true });
  });

  app.post("/api/queries/respond", (req, res) => {
    const { queryId, response } = req.body;
    db.prepare(`
      UPDATE queries SET response = ?, status = 'RESOLVED' WHERE id = ?
    `).run(response, queryId);
    res.json({ success: true });
  });

  app.post("/api/queries/view", (req, res) => {
    const { studentId } = req.body;
    db.prepare("UPDATE queries SET viewed = 1 WHERE studentId = ? AND status = 'RESOLVED'").run(studentId);
    res.json({ success: true });
  });

  app.get("/api/logs", (req, res) => {
    const logs = db.prepare("SELECT * FROM logs ORDER BY timestamp DESC").all();
    res.json(logs);
  });

  app.get("/api/users/:id", (req, res) => {
    const user = db.prepare("SELECT id, name, role, gender, studentId, adminId FROM users WHERE id = ?").get(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
