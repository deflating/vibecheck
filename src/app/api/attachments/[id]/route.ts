import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db/schema";
import { readFile } from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  const attachment = db.prepare("SELECT * FROM attachments WHERE id = ?").get(Number(id)) as any;
  if (!attachment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const buffer = await readFile(path.join(UPLOAD_DIR, attachment.filename));
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": attachment.mime_type || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${attachment.original_name}"`,
    },
  });
}
