import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Use a persistent volume path in production (e.g., for Railway) 
// and a local file in development.
const isProd = process.env.NODE_ENV === 'production';
const dbDir = isProd ? '/app/data' : process.cwd();
const dbPath = path.resolve(dbDir, 'comments.sqlite');

// Ensure the data directory exists
if (isProd && !fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Initialize comments table
db.exec(`
  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    nickname TEXT NOT NULL,
    content TEXT NOT NULL,
    password TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

export default db;
