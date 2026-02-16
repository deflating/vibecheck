import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { safeParseJson } from "@/lib/utils";
import type { ReviewerProfile } from "@/lib/models";

export async function GET() {
  try {
  const user = await getCurrentUser();
  if (!user || user.role !== "reviewer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const db = getDb();
  const profile = db.prepare("SELECT * FROM reviewer_profiles WHERE user_id = ?").get(user.id) as (ReviewerProfile & { expertise: string }) | undefined;
  const pendingQuotes = db.prepare("SELECT COUNT(*) as count FROM quotes WHERE reviewer_id = ? AND status = 'pending'").get(user.id) as { count: number };
  const acceptedQuotes = db.prepare("SELECT COUNT(*) as count FROM quotes WHERE reviewer_id = ? AND status = 'accepted'").get(user.id) as { count: number };
  const completedReviews = db.prepare("SELECT COUNT(*) as count FROM reviews WHERE reviewer_id = ? AND overall_score IS NOT NULL").get(user.id) as { count: number };
  const activeReviews = db.prepare(`
    SELECT rev.id, rr.title, rr.repo_url, q.turnaround_hours, q.created_at as accepted_at
    FROM reviews rev
    JOIN review_requests rr ON rev.request_id = rr.id
    JOIN quotes q ON rev.quote_id = q.id
    WHERE rev.reviewer_id = ? AND rev.overall_score IS NULL
  `).all(user.id);

  return NextResponse.json({
    profile: { ...profile, expertise: safeParseJson(profile?.expertise, []) },
    stats: {
      pending_quotes: pendingQuotes.count,
      accepted_quotes: acceptedQuotes.count,
      completed_reviews: completedReviews.count,
    },
    active_reviews: activeReviews,
  });
  } catch (err) {
    console.error("[API Error] GET /api/reviewer/stats:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
