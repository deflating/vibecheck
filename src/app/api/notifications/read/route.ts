import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db/schema";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let body;
    try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request body" }, { status: 400 }); }
    const { ids } = body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "ids required" }, { status: 400 });
    }

    const db = getDb();
    const placeholders = ids.map(() => "?").join(",");
    db.prepare(
      `UPDATE notifications SET read = 1 WHERE id IN (${placeholders}) AND user_id = ?`
    ).run(...ids, user.id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[API Error] POST /api/notifications/read:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
