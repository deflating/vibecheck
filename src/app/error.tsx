"use client";

import Link from "next/link";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-danger)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-6">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>

      <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
      <p className="text-sm text-text-muted mb-8">An unexpected error occurred. Please try again.</p>

      <div className="flex gap-3">
        <button
          onClick={reset}
          className="bg-accent-pop hover:bg-accent-pop-hover text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          Try Again
        </button>
        <Link href="/" className="border border-border hover:border-border-light px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">
          Go Home
        </Link>
      </div>
    </div>
  );
}
