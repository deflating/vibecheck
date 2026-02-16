"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface OpenRequest {
  id: number;
  title: string;
  description: string;
  repo_url: string;
  stack: string[];
  concerns: string[];
  budget_min: number | null;
  budget_max: number | null;
  user_name: string;
  category: string | null;
  quote_count: number;
  created_at: string;
}

const STACK_FILTERS = ["React", "Next.js", "TypeScript", "Python", "Node.js", "Go", "Rust"];
const CATEGORY_FILTERS = ["Full App Review", "Security Audit", "Architecture Review", "Performance Review", "Pre-Launch Check", "Quick Sanity Check"];

export default function BrowseRequestsPage() {
  const [requests, setRequests] = useState<OpenRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [stackFilter, setStackFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (stackFilter) params.set("stack", stackFilter);
    if (categoryFilter) params.set("category", categoryFilter);
    fetch(`/api/requests/open?${params}`)
      .then((r) => r.json())
      .then((data) => { setRequests(data); setLoading(false); });
  }, [stackFilter, categoryFilter]);

  return (
    <div className="min-h-screen">
      <nav className="border-b border-border px-6 py-4">
        <div className="mx-auto max-w-6xl flex items-center gap-4">
          <Link href="/reviewer" className="text-text-muted hover:text-text transition-colors text-sm">&larr; Dashboard</Link>
          <span className="text-lg font-semibold">Open Requests</span>
        </div>
      </nav>
      <main className="mx-auto max-w-6xl px-6 py-10">
        {/* Filters */}
        <div className="space-y-3 mb-8">
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-text-muted self-center mr-1">Stack:</span>
            <button
              onClick={() => setStackFilter(null)}
              className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${!stackFilter ? "bg-accent/10 border-accent text-accent" : "border-border text-text-muted hover:border-border-light"}`}
            >All</button>
            {STACK_FILTERS.map((s) => (
              <button
                key={s}
                onClick={() => setStackFilter(s)}
                className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${stackFilter === s ? "bg-accent/10 border-accent text-accent" : "border-border text-text-muted hover:border-border-light"}`}
              >{s}</button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-text-muted self-center mr-1">Type:</span>
            <button
              onClick={() => setCategoryFilter(null)}
              className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${!categoryFilter ? "bg-accent/10 border-accent text-accent" : "border-border text-text-muted hover:border-border-light"}`}
            >All</button>
            {CATEGORY_FILTERS.map((c) => (
              <button
                key={c}
                onClick={() => setCategoryFilter(c)}
                className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${categoryFilter === c ? "bg-accent/10 border-accent text-accent" : "border-border text-text-muted hover:border-border-light"}`}
              >{c}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-surface border border-border rounded-xl p-5 animate-pulse">
                <div className="h-4 bg-surface-hover rounded w-1/3 mb-3" />
                <div className="h-3 bg-surface-hover rounded w-2/3 mb-2" />
                <div className="h-3 bg-surface-hover rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-8 text-center">
            <p className="text-text-muted text-sm">No open requests{stackFilter ? ` matching "${stackFilter}"` : ""}.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((r) => (
              <Link key={r.id} href={`/reviewer/browse/${r.id}`} className="block bg-surface border border-border rounded-xl p-5 card-hover">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold mb-1">{r.title}</h3>
                    <p className="text-sm text-text-secondary line-clamp-2">{r.description}</p>
                    <div className="flex flex-wrap gap-3 mt-3 text-xs">
                      {r.category && (
                        <span className="bg-surface-hover border border-border rounded-full px-2 py-0.5 font-medium">{r.category}</span>
                      )}
                      <div className="flex gap-1.5">
                        {r.stack.map((s) => (
                          <span key={s} className="bg-surface-hover border border-border rounded-full px-2 py-0.5">{s}</span>
                        ))}
                      </div>
                      <div className="flex gap-1.5">
                        {r.concerns.map((c) => (
                          <span key={c} className="bg-accent/10 text-accent rounded-full px-2 py-0.5 capitalize">{c}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    {r.budget_min && r.budget_max && (
                      <div className="font-semibold">${r.budget_min}–${r.budget_max}</div>
                    )}
                    <div className="text-xs text-text-muted mt-1">{r.quote_count} quote{r.quote_count !== 1 ? "s" : ""}</div>
                    <div className="text-xs text-text-muted">by {r.user_name}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
