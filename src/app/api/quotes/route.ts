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
    const requestIdNum = Number(request_id);
    if (!Number.isInteger(requestIdNum) || requestIdNum <= 0) {
      return NextResponse.json({ error: "Invalid request ID" }, { status: 400 });
    }

    if (typeof price !== "number" || price <= 0) {
      return NextResponse.json({ error: "Price must be a positive number" }, { status: 400 });
    }
    if (typeof turnaround_hours !== "number" || turnaround_hours <= 0) {
      return NextResponse.json({ error: "Turnaround hours must be a positive number" }, { status: 400 });
    }

    const db = getDb();
    const openRequest = db.prepare("SELECT id, title, user_id FROM review_requests WHERE id = ? AND status = 'open'").get(requestIdNum) as { id: number; title: string; user_id: number } | undefined;
    if (!openRequest) {
      return NextResponse.json({ error: "Request not found or not open" }, { status: 400 });
    }

    const existing = db.prepare("SELECT id FROM quotes WHERE request_id = ? AND reviewer_id = ?").get(requestIdNum, user.id);
    if (existing) {
      return NextResponse.json({ error: "You already submitted a quote for this request" }, { status: 409 });
    }
    const alreadyAccepted = db.prepare("SELECT id FROM quotes WHERE request_id = ? AND status = 'accepted'").get(requestIdNum);
    if (alreadyAccepted) {
      return NextResponse.json({ error: "A quote has already been accepted for this request" }, { status: 409 });
    }

    let result;
    try {
      result = db.prepare(
        "INSERT INTO quotes (request_id, reviewer_id, price, turnaround_hours, note, estimated_delivery_days) VALUES (?, ?, ?, ?, ?, ?)"
      ).run(requestIdNum, user.id, price, turnaround_hours, note || null, estimated_delivery_days || null);
    } catch (insertErr) {
      const message = insertErr instanceof Error ? insertErr.message : "";
      if (message.includes("idx_quotes_one_accepted_per_request")) {
        return NextResponse.json({ error: "A quote has already been accepted for this request" }, { status: 409 });
      }
      throw insertErr;
    }

    // Notifications — non-critical
    try {
      db.prepare(
        "INSERT INTO notifications (user_id, type, title, body, link) VALUES (?, ?, ?, ?, ?)"
      ).run(openRequest.user_id, "quote_received", `New quote on "${openRequest.title}"`, `${user.name} submitted a quote for $${price}`, `/requests/${requestIdNum}`);

      const owner = db.prepare("SELECT email FROM users WHERE id = ?").get(openRequest.user_id) as { email: string } | undefined;
      if (owner?.email) {
        sendQuoteReceivedEmail(owner.email, openRequest.title, user.name, price);
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
