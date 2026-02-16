import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "reviewer") {
    return NextResponse.json({ error: "Only reviewers can submit quotes" }, { status: 403 });
  }

  const { request_id, price, turnaround_hours, note } = await req.json();

  if (!request_id || !price || !turnaround_hours) {
    return NextResponse.json({ error: "Request ID, price, and turnaround are required" }, { status: 400 });
  }

  const db = getDb();

  const existing = db.prepare("SELECT id FROM quotes WHERE request_id = ? AND reviewer_id = ?").get(request_id, user.id);
  if (existing) {
    return NextResponse.json({ error: "You already submitted a quote for this request" }, { status: 409 });
  }

  const result = db.prepare(
    "INSERT INTO quotes (request_id, reviewer_id, price, turnaround_hours, note) VALUES (?, ?, ?, ?, ?)"
  ).run(request_id, user.id, price, turnaround_hours, note || null);

  // Notify the request owner
  const request = db.prepare("SELECT r.title, r.user_id FROM review_requests r WHERE r.id = ?").get(request_id) as any;
  if (request) {
    db.prepare(
      "INSERT INTO notifications (user_id, type, title, body, link) VALUES (?, ?, ?, ?, ?)"
    ).run(request.user_id, "quote_received", `New quote on "${request.title}"`, `${user.name} submitted a quote for $${price}`, `/requests/${request_id}`);
  }

  return NextResponse.json({ id: result.lastInsertRowid });
}
