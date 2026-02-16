import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  const requests = db.prepare(`
    SELECT r.*, u.name as user_name
    FROM review_requests r
    JOIN users u ON r.user_id = u.id
    WHERE r.user_id = ?
    ORDER BY r.created_at DESC
  `).all(user.id);

  return NextResponse.json(requests.map((r: any) => ({
    ...r,
    stack: JSON.parse(r.stack),
    concerns: JSON.parse(r.concerns),
  })));
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, repo_url, description, stack, concerns, concerns_freetext, budget_min, budget_max, category } = await req.json();

  if (!title || !repo_url || !description) {
    return NextResponse.json({ error: "Title, repo URL, and description are required" }, { status: 400 });
  }

  const db = getDb();
  const result = db.prepare(`
    INSERT INTO review_requests (user_id, title, repo_url, description, stack, concerns, concerns_freetext, budget_min, budget_max, category)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(user.id, title, repo_url, description, JSON.stringify(stack || []), JSON.stringify(concerns || []), concerns_freetext || "", budget_min || null, budget_max || null, category || "Full App Review");

  return NextResponse.json({ id: result.lastInsertRowid });
}
