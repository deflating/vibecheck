"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Reviewer {
  id: number;
  github_username: string;
  name: string;
  avatar_url: string | null;
  bio: string | null;
  tagline: string | null;
  expertise: string[];
  hourly_rate: number | null;
  rating: number;
  review_count: number;
  turnaround_hours: number;
}

const EXPERTISE_OPTIONS = [
  "Security", "Architecture", "Performance", "React", "Next.js",
  "TypeScript", "Python", "Node.js", "Go", "Rust", "AWS", "DevOps",
];

const SORT_OPTIONS = [
  { value: "rating", label: "Top Rated" },
  { value: "reviews", label: "Most Reviews" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-3.5 h-3.5 ${star <= Math.round(rating) ? "text-warning" : "text-border"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function ReviewersPage() {
  const [reviewers, setReviewers] = useState<Reviewer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expertise, setExpertise] = useState("");
  const [sort, setSort] = useState("rating");
  const [maxRate, setMaxRate] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (expertise) params.set("expertise", expertise);
    if (maxRate) params.set("maxRate", maxRate);
    params.set("sort", sort);

    const timeout = setTimeout(() => {
      fetch(`/api/reviewers?${params}`)
        .then((r) => r.json())
        .then((data) => { setReviewers(data); setLoading(false); })
        .catch(() => setLoading(false));
    }, search ? 300 : 0);

    return () => clearTimeout(timeout);
  }, [search, expertise, sort, maxRate]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Find a Reviewer</h1>
        <p className="text-text-muted text-sm">Browse experienced developers ready to review your code</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-surface border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors"
          placeholder="Search by name or tagline..."
        />
        <select
          value={expertise}
          onChange={(e) => setExpertise(e.target.value)}
          className="bg-surface border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors"
        >
          <option value="">All Expertise</option>
          {EXPERTISE_OPTIONS.map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
        <input
          value={maxRate}
          onChange={(e) => setMaxRate(e.target.value)}
          type="number"
          min="0"
          className="w-32 bg-surface border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors"
          placeholder="Max $/hr"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="bg-surface border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-surface border border-border rounded-xl p-5 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-surface-hover rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-surface-hover rounded w-2/3 mb-1" />
                  <div className="h-3 bg-surface-hover rounded w-1/2" />
                </div>
              </div>
              <div className="h-3 bg-surface-hover rounded w-full mb-2" />
              <div className="h-3 bg-surface-hover rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : reviewers.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-8 text-center">
          <p className="text-text-muted text-sm">No reviewers found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reviewers.map((r) => (
            <Link
              key={r.id}
              href={`/reviewer/${r.github_username}`}
              className="bg-surface border border-border rounded-xl p-5 card-hover block"
            >
              <div className="flex items-center gap-3 mb-3">
                {r.avatar_url ? (
                  <img src={r.avatar_url} alt={r.name} className="w-10 h-10 rounded-full border border-border" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-surface-hover flex items-center justify-center text-text-muted text-sm font-medium">
                    {r.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm truncate flex items-center gap-1">{r.name}</h3>
                  <p className="text-xs text-text-muted truncate">@{r.github_username}</p>
                </div>
              </div>

              {r.tagline && (
                <p className="text-sm text-text-secondary mb-3 line-clamp-2">{r.tagline}</p>
              )}

              <div className="flex flex-wrap gap-1.5 mb-3">
                {r.expertise.slice(0, 4).map((e) => (
                  <span key={e} className="bg-accent/10 text-accent text-xs px-2 py-0.5 rounded-full">{e}</span>
                ))}
                {r.expertise.length > 4 && (
                  <span className="text-xs text-text-muted">+{r.expertise.length - 4}</span>
                )}
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <StarRating rating={r.rating} />
                  <span className="text-text-muted">({r.review_count})</span>
                </div>
                {r.hourly_rate && (
                  <span className="font-semibold">${r.hourly_rate}/hr</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
