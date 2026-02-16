import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { safeParseJson } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");

  const db = getDb();

  if (username) {
    // Public profile lookup by username
    const row = db.prepare(`
      SELECT u.id, u.github_username, u.name, u.avatar_url, u.bio, u.created_at,
        rp.tagline, rp.expertise, rp.hourly_rate, rp.rating, rp.review_count,
        rp.turnaround_hours, rp.github_url, rp.portfolio_url, rp.linkedin_url,
        rp.twitter_url, rp.blog_url, rp.work_history, rp.featured_projects,
        rp.languages, rp.frameworks
      FROM users u
      JOIN reviewer_profiles rp ON rp.user_id = u.id
      WHERE u.github_username = ? AND u.role = 'reviewer'
    `).get(username) as (Record<string, unknown> & { expertise: string; work_history: string; featured_projects: string; languages: string; frameworks: string }) | undefined;

    if (!row) {
      return NextResponse.json({ error: "Reviewer not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...row,
      expertise: safeParseJson(row.expertise, []),
      work_history: safeParseJson(row.work_history, []),
      featured_projects: safeParseJson(row.featured_projects, []),
      languages: safeParseJson(row.languages, []),
      frameworks: safeParseJson(row.frameworks, []),
    });
  }

  // Authenticated user's own profile
  const user = await getCurrentUser();
  if (!user || user.role !== "reviewer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const profile = db.prepare(`
    SELECT rp.*, u.github_username, u.name, u.avatar_url, u.bio
    FROM reviewer_profiles rp
    JOIN users u ON u.id = rp.user_id
    WHERE rp.user_id = ?
  `).get(user.id) as (Record<string, unknown> & { expertise: string; work_history: string; featured_projects: string; languages: string; frameworks: string }) | undefined;

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...profile,
    expertise: safeParseJson(profile.expertise, []),
    work_history: safeParseJson(profile.work_history, []),
    featured_projects: safeParseJson(profile.featured_projects, []),
    languages: safeParseJson(profile.languages, []),
    frameworks: safeParseJson(profile.frameworks, []),
  });
}

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "reviewer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();

  const db = getDb();
  db.prepare(`
    UPDATE reviewer_profiles SET
      tagline = ?, expertise = ?, hourly_rate = ?, turnaround_hours = ?,
      portfolio_url = ?, linkedin_url = ?, twitter_url = ?, blog_url = ?,
      work_history = ?, featured_projects = ?, languages = ?, frameworks = ?
    WHERE user_id = ?
  `).run(
    body.tagline || null,
    JSON.stringify(body.expertise || []),
    body.hourly_rate || null,
    body.turnaround_hours || 48,
    body.portfolio_url || null,
    body.linkedin_url || null,
    body.twitter_url || null,
    body.blog_url || null,
    JSON.stringify(body.work_history || []),
    JSON.stringify(body.featured_projects || []),
    JSON.stringify(body.languages || []),
    JSON.stringify(body.frameworks || []),
    user.id
  );

  return NextResponse.json({ success: true });
}
