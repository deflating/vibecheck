import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db/schema";

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = getDb();
    db.prepare("UPDATE notifications SET read = 1 WHERE user_id = ?").run(user.id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[API Error] POST /api/notifications/read-all:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
