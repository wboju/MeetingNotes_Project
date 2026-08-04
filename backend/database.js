const Database = require("better-sqlite3");
const db = new Database("meetings.db");

db.exec(`
    CREATE TABLE IF NOT EXISTS meetings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    location TEXT NOT NULL,
    attendees TEXT NOT NULL,
    transcript TEXT,
    summary TEXT,
    action_items TEXT
    )    
`);

// Seed data - only inserts if tabvle is empty
const count = db.prepare(`SELECT COUNT (*) as count FROM meetings`).get();
if (count.count === 0) {
  const insert = db.prepare(`
        INSERT INTO meetings (title, date, start_time, end_time, location, attendees)
        VALUES (?, ?, ?, ?, ?, ?)
    `);

  insert.run(
    "Product Sync",
    "2026-07-28",
    "09:00",
    "09:30",
    "Zoom",
    JSON.stringify(["Alex Rivera", "Jamie Chen"]),
  );
  insert.run(
    "Design Review",
    "2026-07-28",
    "11:00",
    "12:00",
    "Conference Room B",
    JSON.stringify(["Priya Nair", "Sam Okafor", "Jamie Chen"]),
  );
  insert.run(
    "1:1 with Manager",
    "2026-07-29",
    "14:00",
    "14:30",
    "Google Meet",
    JSON.stringify(["Alex Rivera"]),
  );
  insert.run(
    "Sprint Planning",
    "2026-07-30",
    "10:00",
    "11:30",
    "Zoom",
    JSON.stringify(["Alex Rivera", "Jamie Chen", "Priya Nair", "Sam Okafor"]),
  );
}   

module.exports = db;