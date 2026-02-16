import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db/schema";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ requestId: string }> }) {
  try {
    const { requestId } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = getDb();
    db.prepare(`
      INSERT INTO conversation_reads (user_id, request_id, last_read_at)
      VALUES (?, ?, datetime('now'))
      ON CONFLICT(user_id, request_id) DO UPDATE SET last_read_at = datetime('now')
    `).run(user.id, Number(requestId));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[API Error] POST /api/messages/conversations/[requestId]/read:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
