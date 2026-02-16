import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { safeParseJson } from "@/lib/utils";
import type { ReviewRequestWithUser } from "@/lib/models";

export async function GET() {
  try {
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

    return NextResponse.json(requests.map((r) => {
      const row = r as ReviewRequestWithUser & { stack: string; concerns: string };
      return {
        ...row,
        stack: safeParseJson(row.stack, []),
        concerns: safeParseJson(row.concerns, []),
      };
    }));
  } catch (err) {
    console.error("[API Error] GET /api/requests:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let body;
    try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request body" }, { status: 400 }); }
    const { title, repo_url, description, stack, concerns, concerns_freetext, budget_min, budget_max, category } = body;

    if (!title || !repo_url || !description) {
      return NextResponse.json({ error: "Title, repo URL, and description are required" }, { status: 400 });
    }
    if (title.length > 200) return NextResponse.json({ error: "Title too long (max 200)" }, { status: 400 });
    if (description.length > 5_000) return NextResponse.json({ error: "Description too long (max 5,000)" }, { status: 400 });
    if (repo_url.length > 500) return NextResponse.json({ error: "URL too long" }, { status: 400 });

    const db = getDb();
    const result = db.prepare(`
      INSERT INTO review_requests (user_id, title, repo_url, description, stack, concerns, concerns_freetext, budget_min, budget_max, category)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(user.id, title, repo_url, description, JSON.stringify(stack || []), JSON.stringify(concerns || []), concerns_freetext || "", budget_min || null, budget_max || null, category || "Full App Review");

    return NextResponse.json({ id: result.lastInsertRowid });
  } catch (err) {
    console.error("[API Error] POST /api/requests:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
