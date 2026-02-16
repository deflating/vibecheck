import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db/schema";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = getDb();
    const user = db.prepare("SELECT role FROM users WHERE id = ?").get(Number(session.user.id)) as { role: string } | undefined;
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const newRole = user.role === "reviewer" ? "vibecoder" : "reviewer";

    if (newRole === "reviewer") {
      const profile = db.prepare("SELECT user_id FROM reviewer_profiles WHERE user_id = ?").get(Number(session.user.id));
      if (!profile) {
        return NextResponse.json({ error: "Complete reviewer onboarding first", redirect: "/reviewer/onboarding" }, { status: 400 });
      }
    }

    db.prepare("UPDATE users SET role = ? WHERE id = ?").run(newRole, Number(session.user.id));

    return NextResponse.json({ role: newRole });
  } catch (err) {
    console.error("[API Error] POST /api/auth/switch-role:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
