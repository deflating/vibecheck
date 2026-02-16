import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { sendQuoteReceivedEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "reviewer") {
      return NextResponse.json({ error: "Only reviewers can submit quotes" }, { status: 403 });
    }

    let body;
    try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request body" }, { status: 400 }); }
    const { request_id, price, turnaround_hours, note, estimated_delivery_days } = body;

    if (!request_id || !price || !turnaround_hours) {
      return NextResponse.json({ error: "Request ID, price, and turnaround are required" }, { status: 400 });
    }

    if (typeof price !== "number" || price <= 0) {
      return NextResponse.json({ error: "Price must be a positive number" }, { status: 400 });
    }
    if (typeof turnaround_hours !== "number" || turnaround_hours <= 0) {
      return NextResponse.json({ error: "Turnaround hours must be a positive number" }, { status: 400 });
    }

    const db = getDb();

    const existing = db.prepare("SELECT id FROM quotes WHERE request_id = ? AND reviewer_id = ?").get(request_id, user.id);
    if (existing) {
      return NextResponse.json({ error: "You already submitted a quote for this request" }, { status: 409 });
    }

    const result = db.prepare(
      "INSERT INTO quotes (request_id, reviewer_id, price, turnaround_hours, note, estimated_delivery_days) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(request_id, user.id, price, turnaround_hours, note || null, estimated_delivery_days || null);

    // Notifications — non-critical
    try {
      const request = db.prepare("SELECT r.title, r.user_id FROM review_requests r WHERE r.id = ?").get(request_id) as { title: string; user_id: number } | undefined;
      if (request) {
        db.prepare(
          "INSERT INTO notifications (user_id, type, title, body, link) VALUES (?, ?, ?, ?, ?)"
        ).run(request.user_id, "quote_received", `New quote on "${request.title}"`, `${user.name} submitted a quote for $${price}`, `/requests/${request_id}`);

        const owner = db.prepare("SELECT email FROM users WHERE id = ?").get(request.user_id) as { email: string } | undefined;
        if (owner?.email) {
          sendQuoteReceivedEmail(owner.email, request.title, user.name, price);
        }
      }
    } catch (notifErr) {
      console.error("[Quotes] Notification failed:", notifErr);
    }

    return NextResponse.json({ id: result.lastInsertRowid });
  } catch (err) {
    console.error("[API Error] POST /api/quotes:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
