import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";
import type { ReviewRequest, Quote } from "@/lib/models";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = getDb();

    const request = db.prepare("SELECT * FROM review_requests WHERE id = ? AND user_id = ?").get(Number(id), user.id) as ReviewRequest | undefined;
    if (!request) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const quote = db.prepare("SELECT * FROM quotes WHERE request_id = ? AND status = 'accepted'").get(Number(id)) as Quote | undefined;
    if (!quote) return NextResponse.json({ error: "No accepted quote found" }, { status: 400 });
    if (quote.paid) return NextResponse.json({ error: "Already paid" }, { status: 400 });

    const processPayment = db.transaction(() => {
      db.prepare("UPDATE quotes SET paid = 1 WHERE id = ?").run(quote.id);
      db.prepare("UPDATE review_requests SET status = 'in_progress' WHERE id = ?").run(Number(id));
      db.prepare(`
        INSERT INTO reviews (request_id, reviewer_id, quote_id) VALUES (?, ?, ?)
      `).run(Number(id), quote.reviewer_id, quote.id);
    });
    processPayment();

    // Notify the reviewer — non-critical, don't let notification failure break payment
    try {
      const reqInfo = db.prepare("SELECT title FROM review_requests WHERE id = ?").get(Number(id)) as { title: string } | undefined;
      if (reqInfo) {
        db.prepare(
          "INSERT INTO notifications (user_id, type, title, body, link) VALUES (?, ?, ?, ?, ?)"
        ).run(quote.reviewer_id, "payment_received", `Payment received for "${reqInfo.title}"`, "You can now begin the review", `/reviewer/review/${Number(id)}`);
      }
    } catch (notifErr) {
      console.error("[Payment] Notification failed (payment succeeded):", notifErr);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[API Error] POST /api/requests/[id]/pay:", err);
    return NextResponse.json({ error: "Payment processing failed. Please try again." }, { status: 500 });
  }
}
