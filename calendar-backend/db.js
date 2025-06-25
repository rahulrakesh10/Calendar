const Database = require('better-sqlite3');
const path = require('path');

// Create or open the SQLite database file
const db = new Database(path.join(__dirname, 'calendar.db'));

// Ensure the events table exists
const createTable = `
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  date TEXT NOT NULL,
  time TEXT NOT NULL
);
`;
db.exec(createTable);

module.exports = db; 