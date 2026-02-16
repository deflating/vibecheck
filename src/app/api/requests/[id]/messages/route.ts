import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db/schema";
import { sendNewMessageEmail } from "@/lib/email";
import type { MessageWithSender } from "@/lib/models";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();

  // Verify user is party to this request
  const request = db.prepare(`
    SELECT rr.user_id as owner_id, rev.reviewer_id
    FROM review_requests rr
    LEFT JOIN reviews rev ON rev.request_id = rr.id
    WHERE rr.id = ?
  `).get(Number(id)) as { owner_id: number; reviewer_id: number | null } | undefined;
  if (!request || (request.owner_id !== user.id && request.reviewer_id !== user.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const messages = db.prepare(`
    SELECT m.*, u.name as sender_name, u.avatar_url as sender_avatar
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    WHERE m.request_id = ?
    ORDER BY m.created_at ASC
  `).all(Number(id)) as MessageWithSender[];

  return NextResponse.json(messages);
  } catch (err) {
    console.error("[API Error] GET /api/requests/[id]/messages:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { body } = await req.json();
  if (!body?.trim()) return NextResponse.json({ error: "Message required" }, { status: 400 });
  if (body.length > 10_000) return NextResponse.json({ error: "Message too long (max 10,000 characters)" }, { status: 400 });

  const db = getDb();

  // Verify user is party to this request
  const accessCheck = db.prepare(`
    SELECT rr.user_id as owner_id, rev.reviewer_id
    FROM review_requests rr
    LEFT JOIN reviews rev ON rev.request_id = rr.id
    WHERE rr.id = ?
  `).get(Number(id)) as { owner_id: number; reviewer_id: number | null } | undefined;
  if (!accessCheck || (accessCheck.owner_id !== user.id && accessCheck.reviewer_id !== user.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const result = db.prepare(
    "INSERT INTO messages (request_id, sender_id, body) VALUES (?, ?, ?)"
  ).run(Number(id), user.id, body.trim());

  // Notify the other person on this request
  const request = db.prepare(`
    SELECT rr.title, rr.user_id as owner_id, rev.reviewer_id
    FROM review_requests rr
    LEFT JOIN reviews rev ON rev.request_id = rr.id
    WHERE rr.id = ?
  `).get(Number(id)) as { title: string; owner_id: number; reviewer_id: number | null } | undefined;
  if (request) {
    const recipientId = user.id === request.owner_id ? request.reviewer_id : request.owner_id;
    if (recipientId) {
      db.prepare(
        "INSERT INTO notifications (user_id, type, title, body, link) VALUES (?, ?, ?, ?, ?)"
      ).run(recipientId, "new_message", `New message on "${request.title}"`, body.trim().slice(0, 100), `/requests/${id}`);

      const recipient = db.prepare("SELECT email FROM users WHERE id = ?").get(recipientId) as { email: string } | undefined;
      if (recipient?.email) {
        sendNewMessageEmail(recipient.email, request.title, user.name, body.trim().slice(0, 100));
      }
    }
  }

  return NextResponse.json({ id: result.lastInsertRowid });
  } catch (err) {
    console.error("[API Error] POST /api/requests/[id]/messages:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
