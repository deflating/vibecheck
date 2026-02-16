"use client";

import { useState, useEffect } from "react";

export function RatingWidget({ reviewId, isOwner }: { reviewId: number; isOwner: boolean }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [existing, setExisting] = useState<{ rating: number; comment: string | null } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/ratings?review_id=${reviewId}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setExisting(data[0]);
        }
      });
  }, [reviewId, submitted]);

  if (!isOwner) return null;

  if (existing) {
    return (
      <div className="bg-surface border border-border rounded-xl p-5 mt-6">
        <h3 className="text-sm font-semibold mb-2">Your Rating</h3>
        <div className="flex items-center gap-1 mb-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              className={`w-5 h-5 ${star <= existing.rating ? "text-warning" : "text-border"}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        {existing.comment && <p className="text-sm text-text-secondary">{existing.comment}</p>}
      </div>
    );
  }

  async function handleSubmit() {
    if (!rating) return;
    setLoading(true);
    const res = await fetch("/api/ratings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ review_id: reviewId, rating, comment: comment || null }),
    });
    if (res.ok) setSubmitted(true);
    setLoading(false);
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-5 mt-6">
      <h3 className="text-sm font-semibold mb-3">Rate this review</h3>
      <div className="flex items-center gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(star)}
            className="focus:outline-none"
          >
            <svg
              className={`w-7 h-7 transition-colors ${
                star <= (hover || rating) ? "text-warning" : "text-border"
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={2}
        className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent transition-colors resize-none mb-3"
        placeholder="Optional comment..."
      />
      <button
        onClick={handleSubmit}
        disabled={!rating || loading}
        className="bg-accent-pop hover:bg-accent-pop-hover disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        {loading ? "Submitting..." : "Submit Rating"}
      </button>
    </div>
  );
}
