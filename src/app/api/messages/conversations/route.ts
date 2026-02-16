import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db/schema";

export async function GET() {
  try {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();

  const conversations = db.prepare(`
    SELECT
      rr.id as request_id,
      rr.title,
      m.body as last_message,
      m.created_at as last_message_at,
      m.sender_id as last_sender_id,
      other_user.id as other_user_id,
      other_user.name as other_user_name,
      other_user.avatar_url as other_user_avatar,
      (
        SELECT COUNT(*) FROM messages m2
        WHERE m2.request_id = rr.id
        AND m2.sender_id != ?
        AND m2.created_at > COALESCE(
          (SELECT cr.last_read_at FROM conversation_reads cr WHERE cr.user_id = ? AND cr.request_id = rr.id),
          '1970-01-01'
        )
      ) as unread_count
    FROM review_requests rr
    INNER JOIN messages m ON m.request_id = rr.id
      AND m.id = (SELECT MAX(m3.id) FROM messages m3 WHERE m3.request_id = rr.id)
    LEFT JOIN reviews rev ON rev.request_id = rr.id
    INNER JOIN users other_user ON other_user.id = CASE
      WHEN rr.user_id = ? THEN COALESCE(rev.reviewer_id, m.sender_id)
      ELSE rr.user_id
    END
    WHERE rr.user_id = ? OR rev.reviewer_id = ?
    GROUP BY rr.id
    ORDER BY m.created_at DESC
  `).all(user.id, user.id, user.id, user.id, user.id);

  const totalUnread = (conversations as { unread_count: number }[]).reduce((sum, c) => sum + c.unread_count, 0);

  return NextResponse.json({ conversations, totalUnread });
  } catch (err) {
    console.error("[API Error] GET /api/messages/conversations:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
