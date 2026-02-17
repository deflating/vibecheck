import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = getDb();
    const requestId = Number(id);
    if (!Number.isInteger(requestId) || requestId <= 0) {
      return NextResponse.json({ error: "Invalid request id" }, { status: 400 });
    }

    const processPayment = db.transaction(() => {
      const request = db.prepare("SELECT id FROM review_requests WHERE id = ? AND user_id = ?").get(requestId, user.id) as { id: number } | undefined;
      if (!request) throw new ApiError(404, "Not found");

      const quote = db.prepare("SELECT id, reviewer_id, paid FROM quotes WHERE request_id = ? AND status = 'accepted'").get(requestId) as { id: number; reviewer_id: number; paid: number } | undefined;
      if (!quote) throw new ApiError(400, "No accepted quote found");
      if (quote.paid) throw new ApiError(400, "Already paid");

      const existingReview = db.prepare("SELECT id FROM reviews WHERE request_id = ?").get(requestId);
      if (existingReview) throw new ApiError(409, "Review already created");

      const quoteUpdate = db.prepare("UPDATE quotes SET paid = 1 WHERE id = ? AND paid = 0").run(quote.id);
      if (quoteUpdate.changes === 0) throw new ApiError(409, "Quote already paid");

      db.prepare("UPDATE review_requests SET status = 'in_progress' WHERE id = ?").run(requestId);
      db.prepare(`
        INSERT INTO reviews (request_id, reviewer_id, quote_id) VALUES (?, ?, ?)
      `).run(requestId, quote.reviewer_id, quote.id);

      return quote.reviewer_id;
    });
    const reviewerId = processPayment();

    // Notify the reviewer — non-critical, don't let notification failure break payment
    try {
      const reqInfo = db.prepare("SELECT title FROM review_requests WHERE id = ?").get(requestId) as { title: string } | undefined;
      if (reqInfo) {
        db.prepare(
          "INSERT INTO notifications (user_id, type, title, body, link) VALUES (?, ?, ?, ?, ?)"
        ).run(reviewerId, "payment_received", `Payment received for "${reqInfo.title}"`, "You can now begin the review", `/reviewer/review/${requestId}`);
      }
    } catch (notifErr) {
      console.error("[Payment] Notification failed (payment succeeded):", notifErr);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[API Error] POST /api/requests/[id]/pay:", err);
    return NextResponse.json({ error: "Payment processing failed. Please try again." }, { status: 500 });
  }
}
