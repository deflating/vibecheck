import { cookies } from "next/headers";
import { getDb } from "./db/schema";
import type { User } from "./models";
import bcrypt from "bcryptjs";

const SESSION_COOKIE = "vibecheck_session";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: number): Promise<void> {
  const token = `${userId}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const db = getDb();
  db.exec(`CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    created_at TEXT DEFAULT (datetime('now'))
  )`);
  db.prepare("INSERT INTO sessions (token, user_id) VALUES (?, ?)").run(token, userId);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const db = getDb();
  db.exec(`CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    created_at TEXT DEFAULT (datetime('now'))
  )`);
  const session = db.prepare("SELECT user_id FROM sessions WHERE token = ?").get(token) as { user_id: number } | undefined;
  if (!session) return null;

  const user = db.prepare("SELECT id, email, name, role, avatar_url, bio, created_at FROM users WHERE id = ?").get(session.user_id) as User | undefined;
  return user || null;
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    const db = getDb();
    db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
  }
  cookieStore.delete(SESSION_COOKIE);
}
