import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { sendReviewCompletedEmail } from "@/lib/email";
import { safeParseJson } from "@/lib/utils";
import type { ReviewWithContext, Review } from "@/lib/models";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
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
    `).get(Number(id)) as (Omit<ReviewWithContext, "stack" | "concerns"> & { stack: string; concerns: string }) | undefined;

    if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const access = db.prepare(`
      SELECT rr.user_id as owner_id, rev.reviewer_id
      FROM reviews rev
      JOIN review_requests rr ON rr.id = rev.request_id
      WHERE rev.id = ?
    `).get(Number(id)) as { owner_id: number; reviewer_id: number } | undefined;
    if (!access || (access.owner_id !== user.id && access.reviewer_id !== user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      ...review,
      stack: safeParseJson(review.stack, []),
      concerns: safeParseJson(review.concerns, []),
    });
  } catch (err) {
    console.error("[API Error] GET /api/reviews/[id]:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user || user.role !== "reviewer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const db = getDb();
    const review = db.prepare("SELECT * FROM reviews WHERE id = ? AND reviewer_id = ?").get(Number(id), user.id) as Review | undefined;
    if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });

    let body;
    try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request body" }, { status: 400 }); }
    const {
      summary, security_score, security_notes, architecture_score, architecture_notes,
      performance_score, performance_notes, maintainability_score, maintainability_notes,
      overall_score, recommendations,
    } = body;

    const scoreFields = [security_score, architecture_score, performance_score, maintainability_score, overall_score];
    for (const score of scoreFields) {
      if (score !== null && score !== undefined && (typeof score !== "number" || score < 1 || score > 10)) {
        return NextResponse.json({ error: "Scores must be between 1 and 10" }, { status: 400 });
      }
    }

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

    // Completion notification — non-critical
    if (overall_score) {
      try {
        db.prepare("UPDATE review_requests SET status = 'completed' WHERE id = ?").run(review.request_id);
        const request = db.prepare("SELECT title, user_id FROM review_requests WHERE id = ?").get(review.request_id) as { title: string; user_id: number } | undefined;
        if (request) {
          db.prepare(
            "INSERT INTO notifications (user_id, type, title, body, link) VALUES (?, ?, ?, ?, ?)"
          ).run(request.user_id, "review_completed", `Review completed for "${request.title}"`, "Your code review is ready to view", `/requests/${review.request_id}`);

          const owner = db.prepare("SELECT email FROM users WHERE id = ?").get(request.user_id) as { email: string } | undefined;
          if (owner?.email) {
            sendReviewCompletedEmail(owner.email, request.title);
          }
        }
      } catch (notifErr) {
        console.error("[Reviews] Completion notification failed:", notifErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[API Error] PUT /api/reviews/[id]:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
