import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { sendQuoteAcceptedEmail } from "@/lib/email";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string; quoteId: string }> }) {
  const { id, quoteId } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();

  const request = db.prepare("SELECT * FROM review_requests WHERE id = ? AND user_id = ?").get(Number(id), user.id);
  if (!request) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const quote = db.prepare("SELECT * FROM quotes WHERE id = ? AND request_id = ?").get(Number(quoteId), Number(id)) as any;
  if (!quote) return NextResponse.json({ error: "Quote not found" }, { status: 404 });

  db.prepare("UPDATE quotes SET status = 'accepted' WHERE id = ?").run(Number(quoteId));
  db.prepare("UPDATE quotes SET status = 'rejected' WHERE request_id = ? AND id != ?").run(Number(id), Number(quoteId));

  // Don't create review shell yet — wait for payment
  // Don't change request status yet either

  // Notify the reviewer their quote was accepted
  const reqInfo = db.prepare("SELECT title FROM review_requests WHERE id = ?").get(Number(id)) as any;
  const reviewer = db.prepare("SELECT email FROM users WHERE id = ?").get(quote.reviewer_id) as any;
  if (reqInfo) {
    db.prepare(
      "INSERT INTO notifications (user_id, type, title, body, link) VALUES (?, ?, ?, ?, ?)"
    ).run(quote.reviewer_id, "quote_accepted", `Quote accepted for "${reqInfo.title}"`, "Awaiting payment before review can begin", `/reviewer/review/${Number(id)}`);

    if (reviewer?.email) {
      sendQuoteAcceptedEmail(reviewer.email, reqInfo.title);
    }
  }

  return NextResponse.json({ success: true, redirect: `/requests/${id}/pay` });
}
