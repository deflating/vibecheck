import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { bio, expertise, hourly_rate, turnaround_hours, tagline } = await req.json();

  const db = getDb();

  // Switch role to reviewer
  db.prepare("UPDATE users SET role = 'reviewer', bio = ? WHERE id = ?").run(bio || null, user.id);

  // Create reviewer profile (upsert)
  const existing = db.prepare("SELECT user_id FROM reviewer_profiles WHERE user_id = ?").get(user.id);
  if (existing) {
    db.prepare(
      "UPDATE reviewer_profiles SET expertise = ?, hourly_rate = ?, turnaround_hours = ?, tagline = ? WHERE user_id = ?"
    ).run(JSON.stringify(expertise || []), hourly_rate || null, turnaround_hours || 48, tagline || null, user.id);
  } else {
    db.prepare(
      "INSERT INTO reviewer_profiles (user_id, expertise, hourly_rate, turnaround_hours, tagline) VALUES (?, ?, ?, ?, ?)"
    ).run(user.id, JSON.stringify(expertise || []), hourly_rate || null, turnaround_hours || 48, tagline || null);
  }

  return NextResponse.json({ success: true });
}
