import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db/schema";
import type { UserSettings } from "@/lib/models";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  let settings = db.prepare("SELECT * FROM user_settings WHERE user_id = ?").get(user.id) as UserSettings | undefined;

  if (!settings) {
    db.prepare("INSERT INTO user_settings (user_id) VALUES (?)").run(user.id);
    settings = db.prepare("SELECT * FROM user_settings WHERE user_id = ?").get(user.id) as UserSettings | undefined;
  }

  return NextResponse.json({ settings, user });
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const db = getDb();

  // Ensure row exists
  db.prepare("INSERT OR IGNORE INTO user_settings (user_id) VALUES (?)").run(user.id);

  const allowed = ["notify_new_quotes", "notify_review_completed", "notify_new_messages", "onboarded"];
  const updates: string[] = [];
  const values: (number)[] = [];

  for (const key of allowed) {
    if (key in body) {
      updates.push(`${key} = ?`);
      values.push(body[key] ? 1 : 0);
    }
  }

  if (updates.length > 0) {
    values.push(user.id);
    db.prepare(`UPDATE user_settings SET ${updates.join(", ")} WHERE user_id = ?`).run(...values);
  }

  const settings = db.prepare("SELECT * FROM user_settings WHERE user_id = ?").get(user.id);
  return NextResponse.json({ settings });
}

export async function DELETE(_req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();

  const deleteAccount = db.transaction(() => {
    // Delete in dependency order
    db.prepare("DELETE FROM conversation_reads WHERE user_id = ?").run(user.id);
    db.prepare("DELETE FROM notifications WHERE user_id = ?").run(user.id);
    db.prepare("DELETE FROM user_settings WHERE user_id = ?").run(user.id);
    db.prepare("DELETE FROM messages WHERE sender_id = ?").run(user.id);
    db.prepare("DELETE FROM reviewer_ratings WHERE user_id = ?").run(user.id);
    db.prepare("DELETE FROM attachments WHERE uploaded_by = ?").run(user.id);

    // Delete reviews authored by this user
    db.prepare("DELETE FROM reviews WHERE reviewer_id = ?").run(user.id);
    db.prepare("DELETE FROM quotes WHERE reviewer_id = ?").run(user.id);
    db.prepare("DELETE FROM reviewer_profiles WHERE user_id = ?").run(user.id);

    // Delete review requests owned by this user (and their dependent data)
    const ownedRequests = db.prepare("SELECT id FROM review_requests WHERE user_id = ?").all(user.id) as { id: number }[];
    for (const req of ownedRequests) {
      db.prepare("DELETE FROM messages WHERE request_id = ?").run(req.id);
      db.prepare("DELETE FROM attachments WHERE request_id = ?").run(req.id);
      db.prepare("DELETE FROM conversation_reads WHERE request_id = ?").run(req.id);
      db.prepare("DELETE FROM reviews WHERE request_id = ?").run(req.id);
      db.prepare("DELETE FROM quotes WHERE request_id = ?").run(req.id);
    }
    db.prepare("DELETE FROM review_requests WHERE user_id = ?").run(user.id);

    // Finally delete the user
    db.prepare("DELETE FROM users WHERE id = ?").run(user.id);
  });

  deleteAccount();

  return NextResponse.json({ success: true, message: "Account deleted" });
}
