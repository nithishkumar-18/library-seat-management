const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

function initDb() {
    const dbPath = './library.db';
    if (fs.existsSync(dbPath)) {
        try { fs.unlinkSync(dbPath); console.log("⚠️ Old database removed."); } 
        catch (err) { console.error(err); }
    }

    const db = new sqlite3.Database(dbPath, (err) => {
        if (err) console.error(err.message);
        else console.log('✅ Connected to SQLite database.');
    });

    db.serialize(() => {
        // Added 'phone' column
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT,
            role TEXT,
            gender TEXT,
            phone TEXT
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS seats (
            id INTEGER PRIMARY KEY,
            status TEXT DEFAULT 'available',
            booked_by INTEGER,
            gender_lock TEXT, 
            floor INTEGER DEFAULT 1,
            booked_at DATETIME,
            check_in_time DATETIME,
            check_out_time DATETIME,
            FOREIGN KEY(booked_by) REFERENCES users(id)
        )`, (err) => {
            if (err) return console.error(err);
            
            db.get("SELECT count(*) as count FROM seats", (err, row) => {
                if (row.count === 0) {
                    console.log("🌱 Seeding layout...");
                    const seats = [];
                    for (let i = 1; i <= 32; i++) seats.push([i, 'available', null, null, 1]);
                    for (let i = 33; i <= 44; i++) seats.push([i, 'available', null, null, 2]);
                    for (let i = 45; i <= 54; i++) seats.push([i, 'available', null, null, 3]);

                    const stmt = db.prepare("INSERT INTO seats VALUES (?, ?, ?, ?, ?, NULL, NULL, NULL)");
                    seats.forEach(s => stmt.run(s));
                    stmt.finalize();
                }
            });
        });
    });
    return db;
}

module.exports = initDb();