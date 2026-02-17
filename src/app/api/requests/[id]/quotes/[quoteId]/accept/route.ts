import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { sendQuoteAcceptedEmail } from "@/lib/email";

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string; quoteId: string }> }) {
  try {
    const { id, quoteId } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = getDb();
    const requestId = Number(id);
    const targetQuoteId = Number(quoteId);
    if (!Number.isInteger(requestId) || requestId <= 0 || !Number.isInteger(targetQuoteId) || targetQuoteId <= 0) {
      return NextResponse.json({ error: "Invalid request or quote id" }, { status: 400 });
    }

    const acceptQuote = db.transaction(() => {
      const request = db.prepare("SELECT status FROM review_requests WHERE id = ? AND user_id = ?").get(requestId, user.id) as { status: string } | undefined;
      if (!request) throw new ApiError(404, "Not found");
      if (request.status !== "open") {
        throw new ApiError(400, "Can only accept quotes on open requests");
      }

      const quote = db.prepare("SELECT id, reviewer_id, status FROM quotes WHERE id = ? AND request_id = ?").get(targetQuoteId, requestId) as { id: number; reviewer_id: number; status: string } | undefined;
      if (!quote) throw new ApiError(404, "Quote not found");

      const alreadyAccepted = db.prepare("SELECT id, reviewer_id FROM quotes WHERE request_id = ? AND status = 'accepted'").get(requestId) as { id: number; reviewer_id: number } | undefined;
      if (alreadyAccepted) {
        if (alreadyAccepted.id === targetQuoteId) {
          return { reviewerId: alreadyAccepted.reviewer_id, idempotent: true };
        }
        throw new ApiError(409, "A different quote has already been accepted");
      }

      if (quote.status !== "pending") {
        throw new ApiError(400, "Quote is no longer pending");
      }

      db.prepare("UPDATE quotes SET status = 'accepted' WHERE id = ?").run(targetQuoteId);
      db.prepare("UPDATE quotes SET status = 'rejected' WHERE request_id = ? AND id != ?").run(requestId, targetQuoteId);
      return { reviewerId: quote.reviewer_id, idempotent: false };
    });
    const accepted = acceptQuote();

    // Notifications — non-critical
    if (!accepted.idempotent) {
      try {
        const reqInfo = db.prepare("SELECT title FROM review_requests WHERE id = ?").get(requestId) as { title: string } | undefined;
        const reviewer = db.prepare("SELECT email FROM users WHERE id = ?").get(accepted.reviewerId) as { email: string } | undefined;
        if (reqInfo) {
          db.prepare(
            "INSERT INTO notifications (user_id, type, title, body, link) VALUES (?, ?, ?, ?, ?)"
          ).run(accepted.reviewerId, "quote_accepted", `Quote accepted for "${reqInfo.title}"`, "Awaiting payment before review can begin", `/reviewer/review/${requestId}`);

          if (reviewer?.email) {
            sendQuoteAcceptedEmail(reviewer.email, reqInfo.title);
          }
        }
      } catch (notifErr) {
        console.error("[Quote Accept] Notification failed:", notifErr);
      }
    }

    return NextResponse.json({ success: true, redirect: `/requests/${id}/pay` });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[API Error] POST /api/requests/[id]/quotes/[quoteId]/accept:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
