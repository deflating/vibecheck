import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "reviewer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { tagline, expertise, hourly_rate, turnaround_hours } = await req.json();

  const db = getDb();
  db.prepare(`
    UPDATE reviewer_profiles SET
      tagline = ?, expertise = ?, hourly_rate = ?, turnaround_hours = ?
    WHERE user_id = ?
  `).run(
    tagline || null,
    JSON.stringify(expertise || []),
    hourly_rate || null,
    turnaround_hours || 48,
    user.id
  );

  return NextResponse.json({ success: true });
}
