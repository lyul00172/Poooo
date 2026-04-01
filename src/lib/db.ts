import Database from 'better-sqlite3';
import path from 'path';

// Use a file at the project root for local development
const dbPath = path.resolve(process.cwd(), 'comments.sqlite');
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
