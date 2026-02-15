import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "vibecheck.db");

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    initSchema(db);
  }
  return db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      github_id TEXT UNIQUE NOT NULL,
      github_username TEXT NOT NULL,
      email TEXT NOT NULL DEFAULT '',
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('vibecoderr', 'reviewer')),
      avatar_url TEXT,
      bio TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS reviewer_profiles (
      user_id INTEGER PRIMARY KEY REFERENCES users(id),
      expertise TEXT NOT NULL DEFAULT '[]',
      hourly_rate INTEGER,
      rating REAL DEFAULT 0,
      review_count INTEGER DEFAULT 0,
      turnaround_hours INTEGER DEFAULT 48,
      tagline TEXT
    );

    CREATE TABLE IF NOT EXISTS review_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      title TEXT NOT NULL,
      repo_url TEXT NOT NULL,
      description TEXT NOT NULL,
      stack TEXT NOT NULL DEFAULT '[]',
      concerns TEXT NOT NULL DEFAULT '[]',
      budget_min INTEGER,
      budget_max INTEGER,
      status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS quotes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id INTEGER NOT NULL REFERENCES review_requests(id),
      reviewer_id INTEGER NOT NULL REFERENCES users(id),
      price INTEGER NOT NULL,
      turnaround_hours INTEGER NOT NULL,
      note TEXT,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id INTEGER NOT NULL REFERENCES review_requests(id),
      reviewer_id INTEGER NOT NULL REFERENCES users(id),
      quote_id INTEGER NOT NULL REFERENCES quotes(id),
      summary TEXT,
      security_score INTEGER CHECK (security_score BETWEEN 1 AND 10),
      security_notes TEXT,
      architecture_score INTEGER CHECK (architecture_score BETWEEN 1 AND 10),
      architecture_notes TEXT,
      performance_score INTEGER CHECK (performance_score BETWEEN 1 AND 10),
      performance_notes TEXT,
      maintainability_score INTEGER CHECK (maintainability_score BETWEEN 1 AND 10),
      maintainability_notes TEXT,
      overall_score INTEGER CHECK (overall_score BETWEEN 1 AND 10),
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS reviewer_ratings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      review_id INTEGER NOT NULL REFERENCES reviews(id),
      user_id INTEGER NOT NULL REFERENCES users(id),
      rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
      comment TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
}
