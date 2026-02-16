import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";
import type { ReviewRequestWithUser } from "@/lib/models";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  const { searchParams } = new URL(req.url);
  const stack = searchParams.get("stack");
  const category = searchParams.get("category");
  const minBudget = searchParams.get("min_budget");
  const maxBudget = searchParams.get("max_budget");

  let query = `
    SELECT r.*, u.name as user_name,
      (SELECT COUNT(*) FROM quotes q WHERE q.request_id = r.id) as quote_count
    FROM review_requests r
    JOIN users u ON r.user_id = u.id
    WHERE r.status = 'open'
  `;
  const params: (string | number)[] = [];

  if (stack) {
    query += ` AND r.stack LIKE ?`;
    params.push(`%${stack}%`);
  }
  if (category) {
    query += ` AND r.category = ?`;
    params.push(category);
  }
  if (minBudget) {
    query += ` AND r.budget_max >= ?`;
    params.push(Number(minBudget));
  }
  if (maxBudget) {
    query += ` AND r.budget_min <= ?`;
    params.push(Number(maxBudget));
  }

  query += ` ORDER BY r.created_at DESC`;

  const requests = db.prepare(query).all(...params);

  return NextResponse.json(requests.map((r) => {
    const row = r as ReviewRequestWithUser & { stack: string; concerns: string; quote_count: number };
    return {
      ...row,
      stack: JSON.parse(row.stack),
      concerns: JSON.parse(row.concerns),
    };
  }));
}
