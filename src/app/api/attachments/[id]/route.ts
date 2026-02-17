import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db/schema";
import { readFile } from "fs/promises";
import path from "path";
import type { Attachment } from "@/lib/models";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  const attachment = db.prepare("SELECT * FROM attachments WHERE id = ?").get(Number(id)) as Attachment | undefined;
  if (!attachment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Verify access: user must own the request or be the reviewer
  if (attachment.request_id) {
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
    `).get(attachment.request_id) as { owner_id: number; accepted_reviewer_id: number | null; review_reviewer_id: number | null } | undefined;
    if (!access || (access.owner_id !== user.id && access.accepted_reviewer_id !== user.id && access.review_reviewer_id !== user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }
  if (attachment.review_id) {
    const access = db.prepare(`
      SELECT rr.user_id as owner_id, rev.reviewer_id
      FROM reviews rev
      JOIN review_requests rr ON rr.id = rev.request_id
      WHERE rev.id = ?
    `).get(attachment.review_id) as { owner_id: number; reviewer_id: number | null } | undefined;
    if (!access || (access.owner_id !== user.id && access.reviewer_id !== user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  // Sanitize filename for Content-Disposition header to prevent header injection
  const safeName = attachment.original_name
    .replace(/["\\\r\n]/g, "_")
    .slice(0, 255);

  const buffer = await readFile(path.join(UPLOAD_DIR, attachment.filename));
  return new NextResponse(buffer, {
    headers: {
      // Always serve as application/octet-stream to prevent browser rendering of HTML/SVG
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${safeName}"`,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
