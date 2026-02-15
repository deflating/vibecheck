"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function Nav({ user }: { user: { name: string; email: string; role?: string } | null }) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <nav className="border-b border-border px-6 py-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <span className="text-accent">~</span>
          <span>vibecheck</span>
        </Link>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              {user.role === "reviewer" ? (
                <>
                  <Link href="/reviewer" className="text-sm text-text-secondary hover:text-text transition-colors">
                    Dashboard
                  </Link>
                  <Link href="/reviewer/browse" className="text-sm text-text-secondary hover:text-text transition-colors">
                    Browse
                  </Link>
                  <Link href="/reviewer/profile" className="text-sm text-text-secondary hover:text-text transition-colors">
                    Profile
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/dashboard" className="text-sm text-text-secondary hover:text-text transition-colors">
                    Dashboard
                  </Link>
                  <Link href="/requests/new" className="text-sm bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg transition-colors">
                    New Request
                  </Link>
                </>
              )}
              <span className="text-sm text-text-muted">{user.name}</span>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="text-sm text-text-muted hover:text-text transition-colors"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-text-secondary hover:text-text transition-colors">
                Log in
              </Link>
              <Link href="/signup" className="text-sm bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg transition-colors">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
