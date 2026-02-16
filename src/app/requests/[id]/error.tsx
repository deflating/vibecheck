"use client";

import Link from "next/link";

export default function RequestError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16 text-center">
      <h2 className="text-lg font-semibold mb-2">Failed to load request</h2>
      <p className="text-sm text-text-muted mb-6">We couldn't load this review request. It may have been removed or there was a server error.</p>
      <div className="flex gap-3 justify-center">
        <button onClick={reset} className="bg-accent-pop hover:bg-accent-pop-hover text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">
          Retry
        </button>
        <Link href="/dashboard" className="border border-border hover:border-border-light px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">
          Dashboard
        </Link>
      </div>
    </div>
  );
}
