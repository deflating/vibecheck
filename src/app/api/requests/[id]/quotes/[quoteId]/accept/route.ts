import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";

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
  db.prepare("UPDATE review_requests SET status = 'in_progress' WHERE id = ?").run(Number(id));

  // Create the review shell
  db.prepare(`
    INSERT INTO reviews (request_id, reviewer_id, quote_id) VALUES (?, ?, ?)
  `).run(Number(id), quote.reviewer_id, Number(quoteId));

  // Notify the reviewer their quote was accepted
  const reqInfo = db.prepare("SELECT title FROM review_requests WHERE id = ?").get(Number(id)) as any;
  if (reqInfo) {
    db.prepare(
      "INSERT INTO notifications (user_id, type, title, body, link) VALUES (?, ?, ?, ?, ?)"
    ).run(quote.reviewer_id, "quote_accepted", `Quote accepted for "${reqInfo.title}"`, "You can now begin the review", `/reviewer/review/${Number(id)}`);
  }

  return NextResponse.json({ success: true });
}
