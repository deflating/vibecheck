"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { QuoteWithReviewer } from "@/lib/models";

export function QuoteList({ requestId, isOwner }: { requestId: number; isOwner: boolean }) {
  const router = useRouter();
  const [quotes, setQuotes] = useState<QuoteWithReviewer[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/requests/${requestId}/quotes`)
      .then((r) => r.json())
      .then((data) => { setQuotes(data); setLoading(false); });
  }, [requestId]);

  async function acceptQuote(quoteId: number) {
    setAccepting(quoteId);
    await fetch(`/api/requests/${requestId}/quotes/${quoteId}/accept`, { method: "POST" });
    router.refresh();
  }

  if (loading) return <div className="text-text-muted text-sm">Loading quotes...</div>;
  if (quotes.length === 0) return (
    <div className="bg-surface border border-border rounded-xl p-8 text-center">
      <div className="text-3xl mb-3">⏳</div>
      <p className="text-text-muted text-sm">No quotes yet. Reviewers will see your request and send proposals.</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {quotes.map((q) => (
        <div key={q.id} className="bg-surface border border-border rounded-xl p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <span className="font-semibold">{q.reviewer_name}</span>
                <span className="text-xs text-warning">★ {q.reviewer_rating.toFixed(1)}</span>
                <span className="text-xs text-text-muted">({q.reviewer_review_count} reviews)</span>
              </div>
              {q.reviewer_tagline && (
                <p className="text-sm text-text-muted italic mb-2">&ldquo;{q.reviewer_tagline}&rdquo;</p>
              )}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {q.reviewer_expertise.map((e) => (
                  <span key={e} className="text-xs bg-surface-hover border border-border rounded-full px-2 py-0.5">{e}</span>
                ))}
              </div>
              {q.note && <p className="text-sm text-text-secondary leading-relaxed">{q.note}</p>}
            </div>
            <div className="text-right shrink-0">
              <div className="text-xl font-bold">${q.price}</div>
              <div className="text-xs text-text-muted">{q.turnaround_hours}h turnaround</div>
              {isOwner && q.status === "pending" && (
                <button
                  onClick={() => acceptQuote(q.id)}
                  disabled={accepting !== null}
                  className="mt-3 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg transition-colors"
                >
                  {accepting === q.id ? "Accepting..." : "Accept"}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
