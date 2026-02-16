import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db/schema";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const requestId = formData.get("request_id") as string | null;
    const reviewId = formData.get("review_id") as string | null;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (file.size > MAX_SIZE) return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });

    await mkdir(UPLOAD_DIR, { recursive: true });

    const ext = path.extname(file.name) || "";
    const filename = `${crypto.randomUUID()}${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(UPLOAD_DIR, filename), buffer);

    const db = getDb();
    const result = db.prepare(
      "INSERT INTO attachments (filename, original_name, size, mime_type, request_id, review_id, uploaded_by) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).run(filename, file.name, file.size, file.type || null, requestId ? Number(requestId) : null, reviewId ? Number(reviewId) : null, user.id);

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
    const requestId = searchParams.get("request_id");
    const reviewId = searchParams.get("review_id");

    const db = getDb();
    let attachments;
    if (requestId) {
      attachments = db.prepare("SELECT id, original_name, size, mime_type, created_at FROM attachments WHERE request_id = ?").all(Number(requestId));
    } else if (reviewId) {
      attachments = db.prepare("SELECT id, original_name, size, mime_type, created_at FROM attachments WHERE review_id = ?").all(Number(reviewId));
    } else {
      return NextResponse.json([]);
    }

    return NextResponse.json(attachments);
  } catch (err) {
    console.error("[API Error] GET /api/attachments:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
