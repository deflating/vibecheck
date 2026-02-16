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

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  const request = db.prepare("SELECT * FROM review_requests WHERE id = ? AND user_id = ?").get(Number(id), user.id) as any;
  if (!request) return NextResponse.json({ error: "Not found or not owner" }, { status: 404 });

  const body = await req.json();

  // Cancel request
  if (body.status === "cancelled") {
    if (request.status !== "open" && request.status !== "in_progress") {
      return NextResponse.json({ error: "Cannot cancel this request" }, { status: 400 });
    }
    db.prepare("UPDATE review_requests SET status = 'cancelled' WHERE id = ?").run(Number(id));
    return NextResponse.json({ success: true });
  }

  // Edit request (only when open and no accepted quotes)
  if (request.status !== "open") {
    return NextResponse.json({ error: "Can only edit open requests" }, { status: 400 });
  }
  const acceptedQuote = db.prepare("SELECT id FROM quotes WHERE request_id = ? AND status = 'accepted'").get(Number(id));
  if (acceptedQuote) {
    return NextResponse.json({ error: "Cannot edit after a quote is accepted" }, { status: 400 });
  }

  const updates: string[] = [];
  const values: any[] = [];

  if (body.title !== undefined) { updates.push("title = ?"); values.push(body.title); }
  if (body.description !== undefined) { updates.push("description = ?"); values.push(body.description); }
  if (body.budget_min !== undefined) { updates.push("budget_min = ?"); values.push(body.budget_min); }
  if (body.budget_max !== undefined) { updates.push("budget_max = ?"); values.push(body.budget_max); }

  if (updates.length > 0) {
    values.push(Number(id));
    db.prepare(`UPDATE review_requests SET ${updates.join(", ")} WHERE id = ?`).run(...values);
  }

  return NextResponse.json({ success: true });
}
