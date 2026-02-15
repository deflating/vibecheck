import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/schema";
import { hashPassword, createSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password, name, bio, expertise, hourly_rate, turnaround_hours, tagline } = await req.json();

  if (!email || !password || !name) {
    return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const db = getDb();
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const hash = await hashPassword(password);
  const result = db.prepare(
    "INSERT INTO users (email, password_hash, name, role, bio) VALUES (?, ?, ?, 'reviewer', ?)"
  ).run(email, hash, name, bio || null);

  const userId = Number(result.lastInsertRowid);

  db.prepare(
    "INSERT INTO reviewer_profiles (user_id, expertise, hourly_rate, turnaround_hours, tagline) VALUES (?, ?, ?, ?, ?)"
  ).run(userId, JSON.stringify(expertise || []), hourly_rate || null, turnaround_hours || 48, tagline || null);

  await createSession(userId);

  return NextResponse.json({ success: true });
}
