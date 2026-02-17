import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { GitHubRepo } from "@/lib/models";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  const githubAccessToken = typeof token?.githubAccessToken === "string" ? token.githubAccessToken : null;
  if (!githubAccessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const res = await fetch("https://api.github.com/user/repos?sort=updated&per_page=100&type=owner", {
      headers: {
        Authorization: `Bearer ${githubAccessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch repos" }, { status: 502 });
    }

    const repos = await res.json();
    return NextResponse.json(
      repos.map((r: GitHubRepo) => ({
        id: r.id,
        name: r.name,
        full_name: r.full_name,
        html_url: r.html_url,
        description: r.description,
        language: r.language,
        stargazers_count: r.stargazers_count,
        updated_at: r.updated_at,
        private: r.private,
      }))
    );
  } catch {
    return NextResponse.json({ error: "Failed to fetch repos" }, { status: 502 });
  }
}
