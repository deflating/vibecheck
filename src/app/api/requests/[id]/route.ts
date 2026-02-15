import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  const request = db.prepare(`
    SELECT r.*, u.name as user_name
    FROM review_requests r
    JOIN users u ON r.user_id = u.id
    WHERE r.id = ?
  `).get(Number(id)) as any;

  if (!request) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    ...request,
    stack: JSON.parse(request.stack),
    concerns: JSON.parse(request.concerns),
  });
}
