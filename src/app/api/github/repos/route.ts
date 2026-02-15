import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const res = await fetch("https://api.github.com/user/repos?sort=updated&per_page=100&type=owner", {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch repos" }, { status: 502 });
    }

    const repos = await res.json();
    return NextResponse.json(
      repos.map((r: any) => ({
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
