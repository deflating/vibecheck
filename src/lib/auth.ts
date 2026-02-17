import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { getDb } from "./db/schema";
import type { User } from "./models";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      authorization: {
        params: { scope: "read:user user:email public_repo" },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== "github" || !profile) return false;

      const db = getDb();
      const githubId = String(profile.id);
      const existing = db.prepare("SELECT id FROM users WHERE github_id = ?").get(githubId) as { id: number } | undefined;

      if (!existing) {
        // Create new user — default role is vibecoder
        db.prepare(
          "INSERT INTO users (github_id, github_username, email, name, avatar_url, role) VALUES (?, ?, ?, ?, ?, ?)"
        ).run(
          githubId,
          profile.login as string,
          user.email || "",
          user.name || profile.login as string,
          user.image || null,
          "vibecoder"
        );
      } else {
        // Update profile info on each login
        db.prepare(
          "UPDATE users SET github_username = ?, email = ?, name = ?, avatar_url = ? WHERE github_id = ?"
        ).run(
          profile.login as string,
          user.email || "",
          user.name || profile.login as string,
          user.image || null,
          githubId
        );
      }

      return true;
    },
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.githubId = String(profile.id);
        token.githubAccessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.githubId) {
        const db = getDb();
        const dbUser = db.prepare(
          "SELECT id, github_id, github_username, email, name, role, avatar_url, bio, created_at FROM users WHERE github_id = ?"
        ).get(token.githubId as string) as User | undefined;

        if (dbUser) {
          session.user.id = String(dbUser.id);
          session.user.role = dbUser.role;
          session.user.githubUsername = dbUser.github_username;
          session.user.dbId = dbUser.id;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});

export async function getCurrentUser(): Promise<User | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const db = getDb();
  const user = db.prepare(
    "SELECT id, github_id, github_username, email, name, role, avatar_url, bio, created_at FROM users WHERE id = ?"
  ).get(Number(session.user.id)) as User | undefined;

  return user || null;
}


import { NextRequest, NextResponse } from "next/server";

type AuthenticatedHandler = (
  req: NextRequest,
  user: User,
  context: { params: Promise<Record<string, string>> }
) => Promise<NextResponse>;

/**
 * Wraps an API route handler with authentication.
 * Returns 401 if not authenticated. Optionally restricts by role.
 */
export function withAuth(handler: AuthenticatedHandler, opts?: { role?: "vibecoder" | "reviewer" }) {
  return async (req: NextRequest, context: { params: Promise<Record<string, string>> }) => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (opts?.role && user.role !== opts.role) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      return await handler(req, user, context);
    } catch (err) {
      console.error(`[API Error] ${req.method} ${req.nextUrl.pathname}:`, err);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  };
}

/**
 * Safely parse request JSON body. Returns parsed data or null on failure.
 */
export async function safeParseBody<T = Record<string, unknown>>(req: NextRequest): Promise<T | null> {
  try {
    return await req.json() as T;
  } catch {
    return null;
  }
}
