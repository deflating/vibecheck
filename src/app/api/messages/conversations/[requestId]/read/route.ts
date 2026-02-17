import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db/schema";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ requestId: string }> }) {
  try {
    const { requestId } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const requestIdNum = Number(requestId);
    if (!Number.isInteger(requestIdNum) || requestIdNum <= 0) {
      return NextResponse.json({ error: "Invalid request id" }, { status: 400 });
    }

    const db = getDb();
    const access = db.prepare(`
      SELECT
        rr.user_id as owner_id,
        (
          SELECT q.reviewer_id
          FROM quotes q
          WHERE q.request_id = rr.id AND q.status = 'accepted'
          LIMIT 1
        ) as accepted_reviewer_id,
        (
          SELECT rev.reviewer_id
          FROM reviews rev
          WHERE rev.request_id = rr.id
          LIMIT 1
        ) as review_reviewer_id
      FROM review_requests rr
      WHERE rr.id = ?
    `).get(requestIdNum) as { owner_id: number; accepted_reviewer_id: number | null; review_reviewer_id: number | null } | undefined;
    if (!access || (access.owner_id !== user.id && access.accepted_reviewer_id !== user.id && access.review_reviewer_id !== user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    db.prepare(`
      INSERT INTO conversation_reads (user_id, request_id, last_read_at)
      VALUES (?, ?, datetime('now'))
      ON CONFLICT(user_id, request_id) DO UPDATE SET last_read_at = datetime('now')
    `).run(user.id, requestIdNum);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[API Error] POST /api/messages/conversations/[requestId]/read:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
