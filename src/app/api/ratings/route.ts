import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";
import type { Review } from "@/lib/models";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let body;
    try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request body" }, { status: 400 }); }
    const { review_id, rating, comment } = body;

  if (!review_id || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
  }

  const db = getDb();

  // Verify the review exists and belongs to a request owned by this user
  const review = db.prepare(`
    SELECT r.*, rr.user_id as request_owner_id
    FROM reviews r
    JOIN review_requests rr ON rr.id = r.request_id
    WHERE r.id = ?
  `).get(review_id) as (Review & { request_owner_id: number }) | undefined;

  if (!review || review.request_owner_id !== user.id) {
    return NextResponse.json({ error: "Not authorized to rate this review" }, { status: 403 });
  }

  // Check if already rated
  const existing = db.prepare(`SELECT id FROM reviewer_ratings WHERE review_id = ? AND user_id = ?`).get(review_id, user.id);
  if (existing) {
    return NextResponse.json({ error: "Already rated" }, { status: 409 });
  }

  db.prepare(`INSERT INTO reviewer_ratings (review_id, user_id, rating, comment) VALUES (?, ?, ?, ?)`).run(review_id, user.id, rating, comment || null);

  // Update reviewer's aggregate rating
  const stats = db.prepare(`
    SELECT AVG(rr.rating) as avg_rating, COUNT(*) as count
    FROM reviewer_ratings rr
    JOIN reviews rv ON rv.id = rr.review_id
    WHERE rv.reviewer_id = ?
  `).get(review.reviewer_id) as { avg_rating: number; count: number };

  db.prepare(`UPDATE reviewer_profiles SET rating = ?, review_count = ? WHERE user_id = ?`)
    .run(Math.round(stats.avg_rating * 10) / 10, stats.count, review.reviewer_id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[API Error] POST /api/ratings:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const reviewId = searchParams.get("review_id");
    if (!reviewId) return NextResponse.json({ error: "Missing review_id" }, { status: 400 });

    const db = getDb();
    const rating = db.prepare(`
      SELECT rr.*, u.name as user_name
      FROM reviewer_ratings rr
      JOIN users u ON u.id = rr.user_id
      WHERE rr.review_id = ?
    `).all(Number(reviewId));

    return NextResponse.json(rating);
  } catch (err) {
    console.error("[API Error] GET /api/ratings:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
