import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/schema";
import { verifyPassword, createSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const db = getDb();
  const user = db.prepare("SELECT id, password_hash FROM users WHERE email = ?").get(email) as { id: number; password_hash: string } | undefined;

  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  await createSession(user.id);

  return NextResponse.json({ success: true });
}
