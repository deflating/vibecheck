import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { sendQuoteAcceptedEmail } from "@/lib/email";
import type { Quote } from "@/lib/models";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string; quoteId: string }> }) {
  try {
    const { id, quoteId } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = getDb();

    const request = db.prepare("SELECT * FROM review_requests WHERE id = ? AND user_id = ?").get(Number(id), user.id) as { status: string } | undefined;
    if (!request) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Prevent accepting quotes on non-open requests (race condition guard)
    if (request.status !== "open") {
      return NextResponse.json({ error: "Can only accept quotes on open requests" }, { status: 400 });
    }

    const quote = db.prepare("SELECT * FROM quotes WHERE id = ? AND request_id = ? AND status = 'pending'").get(Number(quoteId), Number(id)) as Quote | undefined;
    if (!quote) return NextResponse.json({ error: "Quote not found or already resolved" }, { status: 404 });

    const acceptQuote = db.transaction(() => {
      db.prepare("UPDATE quotes SET status = 'accepted' WHERE id = ?").run(Number(quoteId));
      db.prepare("UPDATE quotes SET status = 'rejected' WHERE request_id = ? AND id != ?").run(Number(id), Number(quoteId));
    });
    acceptQuote();

    // Notifications — non-critical
    try {
      const reqInfo = db.prepare("SELECT title FROM review_requests WHERE id = ?").get(Number(id)) as { title: string } | undefined;
      const reviewer = db.prepare("SELECT email FROM users WHERE id = ?").get(quote.reviewer_id) as { email: string } | undefined;
      if (reqInfo) {
        db.prepare(
          "INSERT INTO notifications (user_id, type, title, body, link) VALUES (?, ?, ?, ?, ?)"
        ).run(quote.reviewer_id, "quote_accepted", `Quote accepted for "${reqInfo.title}"`, "Awaiting payment before review can begin", `/reviewer/review/${Number(id)}`);

        if (reviewer?.email) {
          sendQuoteAcceptedEmail(reviewer.email, reqInfo.title);
        }
      }
    } catch (notifErr) {
      console.error("[Quote Accept] Notification failed:", notifErr);
    }

    return NextResponse.json({ success: true, redirect: `/requests/${id}/pay` });
  } catch (err) {
    console.error("[API Error] POST /api/requests/[id]/quotes/[quoteId]/accept:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
