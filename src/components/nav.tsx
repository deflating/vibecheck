"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useState } from "react";

export function Nav({ user }: { user: { name: string; avatar_url?: string | null; role?: string } | null }) {
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await signOut({ callbackUrl: "/" });
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
              <div className="w-px h-5 bg-border mx-1" />
              <div className="flex items-center gap-2">
                {user.avatar_url && (
                  <img
                    src={user.avatar_url}
                    alt={user.name}
                    className="w-7 h-7 rounded-full border border-border"
                  />
                )}
                <span className="text-sm text-text-muted">{user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="text-sm text-text-muted hover:text-danger transition-colors"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-text-secondary hover:text-text transition-colors">
                Log in
              </Link>
              <Link href="/login" className="text-sm bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg transition-colors">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
