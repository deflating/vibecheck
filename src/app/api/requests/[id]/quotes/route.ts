import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  const quotes = db.prepare(`
    SELECT q.*, u.name as reviewer_name, u.avatar_url as reviewer_avatar, u.verified as reviewer_verified,
           rp.rating as reviewer_rating, rp.review_count as reviewer_review_count,
           rp.expertise as reviewer_expertise, rp.tagline as reviewer_tagline
    FROM quotes q
    JOIN users u ON q.reviewer_id = u.id
    JOIN reviewer_profiles rp ON q.reviewer_id = rp.user_id
    WHERE q.request_id = ?
    ORDER BY q.created_at ASC
  `).all(Number(id)) as (Record<string, unknown> & { reviewer_expertise: string })[];

  return NextResponse.json(quotes.map((q) => ({
    ...q,
    reviewer_expertise: JSON.parse(q.reviewer_expertise),
  })));
}
