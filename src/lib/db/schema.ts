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
    migrate(db);
  }
  return db;
}

// NOTE: Migrations run on every app start. There is no version tracking.
// This is acceptable for single-developer SQLite but should be replaced with
// a proper migration tool (e.g., drizzle-kit, prisma migrate) before team use.
function migrate(db: Database.Database) {
  // One-time typo fix from early schema. Safe to re-run (no-op if no matching rows).
  db.exec("UPDATE users SET role = 'vibecoder' WHERE role = 'vibecoderr'");

  // Add columns that may not exist yet
  const cols = db.prepare("PRAGMA table_info(reviews)").all() as { name: string }[];
  const colNames = cols.map(c => c.name);
  if (!colNames.includes("recommendations")) {
    db.exec("ALTER TABLE reviews ADD COLUMN recommendations TEXT");
  }

  // Enforce one review per request to make payment flow idempotent under concurrency.
  const duplicateReviews = db.prepare(`
    SELECT request_id
    FROM reviews
    GROUP BY request_id
    HAVING COUNT(*) > 1
  `).all() as { request_id: number }[];
  for (const row of duplicateReviews) {
    db.prepare(`
      DELETE FROM reviews
      WHERE request_id = ?
        AND id NOT IN (SELECT MIN(id) FROM reviews WHERE request_id = ?)
    `).run(row.request_id, row.request_id);
  }
  db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_request_unique ON reviews(request_id)");

  // Ensure only one accepted quote exists per request.
  const multiAcceptedRequests = db.prepare(`
    SELECT request_id
    FROM quotes
    WHERE status = 'accepted'
    GROUP BY request_id
    HAVING COUNT(*) > 1
  `).all() as { request_id: number }[];
  for (const row of multiAcceptedRequests) {
    const keep = db.prepare(`
      SELECT id
      FROM quotes
      WHERE request_id = ? AND status = 'accepted'
      ORDER BY paid DESC, id ASC
      LIMIT 1
    `).get(row.request_id) as { id: number } | undefined;
    if (keep) {
      db.prepare(`
        UPDATE quotes
        SET status = 'rejected'
        WHERE request_id = ? AND status = 'accepted' AND id != ?
      `).run(row.request_id, keep.id);
    }
  }
  db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_quotes_one_accepted_per_request ON quotes(request_id) WHERE status = 'accepted'");

  // Avoid duplicate ratings per user/review pair under concurrent requests.
  const duplicateRatings = db.prepare(`
    SELECT review_id, user_id
    FROM reviewer_ratings
    GROUP BY review_id, user_id
    HAVING COUNT(*) > 1
  `).all() as { review_id: number; user_id: number }[];
  for (const row of duplicateRatings) {
    db.prepare(`
      DELETE FROM reviewer_ratings
      WHERE review_id = ? AND user_id = ?
        AND id NOT IN (
          SELECT MIN(id) FROM reviewer_ratings WHERE review_id = ? AND user_id = ?
        )
    `).run(row.review_id, row.user_id, row.review_id, row.user_id);
  }
  db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_reviewer_ratings_review_user_unique ON reviewer_ratings(review_id, user_id)");

  // Messages table for chat
  db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id INTEGER NOT NULL REFERENCES review_requests(id),
      sender_id INTEGER NOT NULL REFERENCES users(id),
      body TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Expand reviewer_profiles with rich profile fields
  const rpCols = db.prepare("PRAGMA table_info(reviewer_profiles)").all() as { name: string }[];
  const rpColNames = rpCols.map(c => c.name);
  const newCols: [string, string][] = [
    ["github_url", "TEXT"],
    ["portfolio_url", "TEXT"],
    ["linkedin_url", "TEXT"],
    ["twitter_url", "TEXT"],
    ["blog_url", "TEXT"],
    ["work_history", "TEXT DEFAULT '[]'"],
    ["featured_projects", "TEXT DEFAULT '[]'"],
    ["languages", "TEXT DEFAULT '[]'"],
    ["frameworks", "TEXT DEFAULT '[]'"],
  ];
  for (const [col, type] of newCols) {
    if (!rpColNames.includes(col)) {
      db.exec(`ALTER TABLE reviewer_profiles ADD COLUMN ${col} ${type}`);
    }
  }

  // Conversation read tracking
  db.exec(`
    CREATE TABLE IF NOT EXISTS conversation_reads (
      user_id INTEGER NOT NULL REFERENCES users(id),
      request_id INTEGER NOT NULL REFERENCES review_requests(id),
      last_read_at TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (user_id, request_id)
    )
  `);

  // Add paid column to quotes
  const quoteCols = db.prepare("PRAGMA table_info(quotes)").all() as { name: string }[];
  const quoteColNames = quoteCols.map(c => c.name);
  if (!quoteColNames.includes("paid")) {
    db.exec("ALTER TABLE quotes ADD COLUMN paid INTEGER DEFAULT 0");
  }
  if (!quoteColNames.includes("estimated_delivery_days")) {
    db.exec("ALTER TABLE quotes ADD COLUMN estimated_delivery_days INTEGER");
  }

  // Add category column to review_requests
  const rrCols = db.prepare("PRAGMA table_info(review_requests)").all() as { name: string }[];
  const rrColNames = rrCols.map(c => c.name);
  if (!rrColNames.includes("category")) {
    db.exec("ALTER TABLE review_requests ADD COLUMN category TEXT DEFAULT 'Full App Review'");
  }

  // Add verified column to users
  const userCols = db.prepare("PRAGMA table_info(users)").all() as { name: string }[];
  const userColNames = userCols.map(c => c.name);
  if (!userColNames.includes("verified")) {
    db.exec("ALTER TABLE users ADD COLUMN verified INTEGER DEFAULT 0");
  }

  // User settings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_settings (
      user_id INTEGER PRIMARY KEY REFERENCES users(id),
      notify_new_quotes INTEGER DEFAULT 1,
      notify_review_completed INTEGER DEFAULT 1,
      notify_new_messages INTEGER DEFAULT 1,
      onboarded INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Notifications table
  db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT,
      link TEXT,
      read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Indexes for tables created in migrate
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_messages_request_id ON messages(request_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
  `);
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      github_id TEXT UNIQUE NOT NULL,
      github_username TEXT NOT NULL,
      email TEXT NOT NULL DEFAULT '',
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('vibecoder', 'reviewer')),
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
      concerns_freetext TEXT DEFAULT '',
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
      request_id INTEGER NOT NULL UNIQUE REFERENCES review_requests(id),
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
      recommendations TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS attachments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      size INTEGER NOT NULL,
      mime_type TEXT,
      request_id INTEGER REFERENCES review_requests(id),
      review_id INTEGER REFERENCES reviews(id),
      uploaded_by INTEGER NOT NULL REFERENCES users(id),
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS reviewer_ratings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      review_id INTEGER NOT NULL REFERENCES reviews(id),
      user_id INTEGER NOT NULL REFERENCES users(id),
      rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
      comment TEXT,
      UNIQUE(review_id, user_id),
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Indexes for query performance
    CREATE INDEX IF NOT EXISTS idx_review_requests_user_id ON review_requests(user_id);
    CREATE INDEX IF NOT EXISTS idx_review_requests_status ON review_requests(status);
    CREATE INDEX IF NOT EXISTS idx_quotes_request_id ON quotes(request_id);
    CREATE INDEX IF NOT EXISTS idx_quotes_reviewer_id ON quotes(reviewer_id);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_quotes_one_accepted_per_request ON quotes(request_id) WHERE status = 'accepted';
    CREATE INDEX IF NOT EXISTS idx_reviews_request_id ON reviews(request_id);
    CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);
    CREATE INDEX IF NOT EXISTS idx_attachments_request_id ON attachments(request_id);
    CREATE INDEX IF NOT EXISTS idx_attachments_review_id ON attachments(review_id);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_reviewer_ratings_review_user_unique ON reviewer_ratings(review_id, user_id);
  `);
}
