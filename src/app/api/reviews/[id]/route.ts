import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  const review = db.prepare(`
    SELECT rev.*, rr.title as request_title, rr.repo_url, rr.description as request_description,
           rr.stack, rr.concerns, u.name as requester_name
    FROM reviews rev
    JOIN review_requests rr ON rev.request_id = rr.id
    JOIN users u ON rr.user_id = u.id
    WHERE rev.id = ?
  `).get(Number(id)) as any;

  if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    ...review,
    stack: JSON.parse(review.stack),
    concerns: JSON.parse(review.concerns),
  });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || user.role !== "reviewer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const db = getDb();
  const review = db.prepare("SELECT * FROM reviews WHERE id = ? AND reviewer_id = ?").get(Number(id), user.id) as any;
  if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const {
    summary, security_score, security_notes, architecture_score, architecture_notes,
    performance_score, performance_notes, maintainability_score, maintainability_notes,
    overall_score, recommendations,
  } = body;

  db.prepare(`
    UPDATE reviews SET
      summary = ?, security_score = ?, security_notes = ?,
      architecture_score = ?, architecture_notes = ?,
      performance_score = ?, performance_notes = ?,
      maintainability_score = ?, maintainability_notes = ?,
      overall_score = ?, recommendations = ?
    WHERE id = ?
  `).run(
    summary, security_score, security_notes,
    architecture_score, architecture_notes,
    performance_score, performance_notes,
    maintainability_score, maintainability_notes,
    overall_score, recommendations || null, Number(id),
  );

  // If all scores are filled, mark request as completed and notify owner
  if (overall_score) {
    db.prepare("UPDATE review_requests SET status = 'completed' WHERE id = ?").run(review.request_id);
    const request = db.prepare("SELECT title, user_id FROM review_requests WHERE id = ?").get(review.request_id) as any;
    if (request) {
      db.prepare(
        "INSERT INTO notifications (user_id, type, title, body, link) VALUES (?, ?, ?, ?, ?)"
      ).run(request.user_id, "review_completed", `Review completed for "${request.title}"`, "Your code review is ready to view", `/requests/${review.request_id}`);
    }
  }

  return NextResponse.json({ success: true });
}
