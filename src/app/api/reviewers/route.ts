import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/schema";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const expertise = searchParams.get("expertise") || "";
  const minRate = searchParams.get("minRate");
  const maxRate = searchParams.get("maxRate");
  const sort = searchParams.get("sort") || "rating";

  const db = getDb();

  let query = `
    SELECT u.id, u.github_username, u.name, u.avatar_url, u.bio, u.verified,
      rp.tagline, rp.expertise, rp.hourly_rate, rp.rating, rp.review_count,
      rp.turnaround_hours
    FROM users u
    JOIN reviewer_profiles rp ON rp.user_id = u.id
    WHERE u.role = 'reviewer'
  `;
  const params: any[] = [];

  if (search) {
    query += ` AND (u.name LIKE ? OR rp.tagline LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`);
  }

  if (expertise) {
    query += ` AND rp.expertise LIKE ?`;
    params.push(`%${expertise}%`);
  }

  if (minRate) {
    query += ` AND rp.hourly_rate >= ?`;
    params.push(Number(minRate));
  }

  if (maxRate) {
    query += ` AND rp.hourly_rate <= ?`;
    params.push(Number(maxRate));
  }

  const sortMap: Record<string, string> = {
    rating: "rp.rating DESC",
    reviews: "rp.review_count DESC",
    price_low: "rp.hourly_rate ASC",
    price_high: "rp.hourly_rate DESC",
  };
  query += ` ORDER BY ${sortMap[sort] || "rp.rating DESC"}`;

  const rows = db.prepare(query).all(...params) as any[];

  const reviewers = rows.map((r) => ({
    ...r,
    expertise: JSON.parse(r.expertise || "[]"),
  }));

  return NextResponse.json(reviewers);
}
