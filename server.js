const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const db = require('./db');

const app = express();
app.use(express.json());
app.use(express.static('public'));

app.use(session({
    secret: 'library-sms-otp-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 }
}));

// --- TERMII SMS CONFIGURATION ---
const TERMII_API_KEY = "tsk_YSO87xDzd1p7LfgT4KNhMcPEis"; 
const TERMII_SENDER_ID = "Library"; // Ensure this is approved in your Termii account

const otpStorage = {}; 

// --- AUTH ---
app.post('/api/register', (req, res) => {
    const { username, password, role, gender, phone } = req.body;
    if (!username || !password || !phone) return res.status(400).json({ error: "All fields required" });
    
    const userGender = role === 'staff' ? 'other' : (gender || 'other');
    const hashed = bcrypt.hashSync(password, 10);
    
    db.run("INSERT INTO users (username, password, role, gender, phone) VALUES (?,?,?,?,?)",
        [username, hashed, role, userGender, phone], function(err) {
            if (err) return res.status(400).json({ error: "User exists" });
            res.json({ message: "Created" });
        });
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
        if (err || !user || !bcrypt.compareSync(password, user.password)) {
            return res.status(400).json({ error: "Invalid" });
        }
        req.session.user = { id: user.id, username: user.username, role: user.role, gender: user.gender, phone: user.phone };
        req.session.save(() => res.json({ user: req.session.user }));
    });
});

app.post('/api/logout', (req, res) => {
    req.session.destroy(() => res.json({ ok: true }));
});

app.get('/api/me', (req, res) => {
    res.json({ loggedIn: !!req.session.user, user: req.session.user });
});

app.get('/api/seats', (req, res) => {
    db.all("SELECT * FROM seats", [], (err, rows) => res.json(rows));
});

// --- SEND OTP SMS ---
app.post('/api/request-otp/:seatId', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: "Login required" });
    
    const userId = req.session.user.id;
    const phone = req.session.user.phone;
    const seatId = req.params.seatId;

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStorage[userId] = { code: otp, seatId: seatId, ts: Date.now() };

    const smsData = {
        to: phone, 
        from: TERMII_SENDER_ID, 
        sms: `Your Library Seat ${seatId} verification code is: ${otp}.`,
        type: "plain", 
        channel: "generic",
        api_key: TERMII_API_KEY
    };

    try {
        // FIXED: Updated URL to v3.api.termii.com
        const response = await axios.post('https://v3.api.termii.com/api/sms/send', smsData);
        console.log(`✅ SMS Sent to ${phone}.`, response.data.message_id);
        res.json({ message: "OTP Sent to your phone" });
    } catch (err) {
        console.error("❌ SMS Failed:", err.response?.data || err.message);
        
        // FALLBACK: If SMS fails, show OTP in server console so you can still test
        console.log(`\n========================================`);
        console.log(`⚠️ SMS FAILED - FALLBACK MODE`);
        console.log(`🔢 OTP CODE: ${otp}`);
        console.log(`========================================\n`);
        
        // We still return success to the frontend so you can enter the code from the console
        res.json({ message: "OTP generated (Check Server Console)" });
    }
});

// --- VERIFY OTP ---
app.post('/api/verify-book/:seatId', (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: "Login required" });
    
    const userId = req.session.user.id;
    const seatId = req.params.seatId;
    const userCode = req.body.code;
    const record = otpStorage[userId];

    if (!record) return res.status(400).json({ error: "No OTP requested" });
    if (record.code !== userCode) return res.status(400).json({ error: "Invalid OTP" });
    if (record.seatId !== seatId) return res.status(400).json({ error: "Seat mismatch" });
    if (Date.now() - record.ts > 300000) return res.status(400).json({ error: "OTP Expired" });

    db.get("SELECT id FROM seats WHERE booked_by = ?", [userId], (err, row) => {
        if (row) return res.status(400).json({ error: "You already have a booking" });

        db.get("SELECT * FROM seats WHERE id = ?", [seatId], (err, seat) => {
            if (!seat || seat.status !== 'available') return res.status(400).json({ error: "Seat unavailable" });

            db.run(
                "UPDATE seats SET status = 'occupied', booked_by = ?, booked_at = datetime('now') WHERE id = ?",
                [userId, seatId], 
                (err) => {
                    if (err) return res.status(500).json({ error: "DB Error" });
                    delete otpStorage[userId];
                    res.json({ message: "Seat Booked!" });
                }
            );
        });
    });
});

// --- ADMIN ---
app.get('/api/admin/bookings', (req, res) => {
    if (req.session.user?.role !== 'staff') return res.status(403).json({ error: "Admin only" });
    const sql = `SELECT s.id as seatId, s.floor, s.booked_at, u.username 
                 FROM seats s JOIN users u ON s.booked_by = u.id WHERE s.status = 'occupied'`;
    db.all(sql, [], (err, rows) => res.json(rows));
});

app.post('/api/admin/flush', (req, res) => {
    if (req.session.user?.role !== 'staff') return res.status(403).json({ error: "Admin only" });
    db.run("UPDATE seats SET status = 'available', booked_by = NULL", () => res.json({ ok: true }));
});

app.post('/api/cancel', (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: "Login" });
    db.run("UPDATE seats SET status = 'available', booked_by = NULL WHERE booked_by = ?", [req.session.user.id], () => res.json({ ok: true }));
});

app.listen(3000, () => console.log(`🚀 Server running on http://localhost:3000`));