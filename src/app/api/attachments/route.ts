import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db/schema";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

function parsePositiveInt(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function canAccessRequest(db: ReturnType<typeof getDb>, userId: number, requestId: number): boolean {
  const access = db.prepare(`
    SELECT
      rr.user_id as owner_id,
      (
        SELECT q.reviewer_id
        FROM quotes q
        WHERE q.request_id = rr.id AND q.status = 'accepted'
        LIMIT 1
      ) as accepted_reviewer_id,
      (
        SELECT rev.reviewer_id
        FROM reviews rev
        WHERE rev.request_id = rr.id
        LIMIT 1
      ) as review_reviewer_id
    FROM review_requests rr
    WHERE rr.id = ?
  `).get(requestId) as { owner_id: number; accepted_reviewer_id: number | null; review_reviewer_id: number | null } | undefined;

  if (!access) return false;
  return access.owner_id === userId || access.accepted_reviewer_id === userId || access.review_reviewer_id === userId;
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const requestId = parsePositiveInt(formData.get("request_id") as string | null);
    const reviewId = parsePositiveInt(formData.get("review_id") as string | null);

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (file.size > MAX_SIZE) return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
    if (!requestId && !reviewId) {
      return NextResponse.json({ error: "request_id or review_id is required" }, { status: 400 });
    }

    const db = getDb();

    if (requestId && !canAccessRequest(db, user.id, requestId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (reviewId) {
      const review = db.prepare(`
        SELECT rev.request_id, rr.user_id as owner_id, rev.reviewer_id
        FROM reviews rev
        JOIN review_requests rr ON rr.id = rev.request_id
        WHERE rev.id = ?
      `).get(reviewId) as { request_id: number; owner_id: number; reviewer_id: number } | undefined;

      if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });
      if (review.owner_id !== user.id && review.reviewer_id !== user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      if (requestId && review.request_id !== requestId) {
        return NextResponse.json({ error: "review_id does not belong to request_id" }, { status: 400 });
      }
    }

    await mkdir(UPLOAD_DIR, { recursive: true });

    const ext = path.extname(file.name) || "";
    const filename = `${crypto.randomUUID()}${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(UPLOAD_DIR, filename), buffer);

    const result = db.prepare(
      "INSERT INTO attachments (filename, original_name, size, mime_type, request_id, review_id, uploaded_by) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).run(filename, file.name, file.size, file.type || null, requestId, reviewId, user.id);

    return NextResponse.json({
      id: result.lastInsertRowid,
      filename,
      original_name: file.name,
      size: file.size,
    });
  } catch (err) {
    console.error("[API Error] POST /api/attachments:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const requestId = parsePositiveInt(searchParams.get("request_id"));
    const reviewId = parsePositiveInt(searchParams.get("review_id"));

    const db = getDb();
    let attachments;
    if (requestId) {
      if (!canAccessRequest(db, user.id, requestId)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      attachments = db.prepare("SELECT id, original_name, size, mime_type, created_at FROM attachments WHERE request_id = ?").all(requestId);
    } else if (reviewId) {
      const review = db.prepare(`
        SELECT rr.user_id as owner_id, rev.reviewer_id
        FROM reviews rev
        JOIN review_requests rr ON rr.id = rev.request_id
        WHERE rev.id = ?
      `).get(reviewId) as { owner_id: number; reviewer_id: number } | undefined;
      if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });
      if (review.owner_id !== user.id && review.reviewer_id !== user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      attachments = db.prepare("SELECT id, original_name, size, mime_type, created_at FROM attachments WHERE review_id = ?").all(reviewId);
    } else {
      return NextResponse.json([]);
    }

    return NextResponse.json(attachments);
  } catch (err) {
    console.error("[API Error] GET /api/attachments:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
