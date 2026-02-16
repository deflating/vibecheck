"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Chat } from "@/components/chat";

export default function RequestDetailForReviewer() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch(`/api/requests/${params.id}`)
      .then((r) => r.json())
      .then((data) => { setRequest(data); setLoading(false); });
  }, [params.id]);

  async function handleSubmitQuote(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        request_id: Number(params.id),
        price: Number(form.get("price")),
        turnaround_hours: Number(form.get("turnaround_hours")),
        note: form.get("note"),
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong");
      setSubmitting(false);
      return;
    }

    setSubmitted(true);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-text-muted">Loading...</div>;
  if (!request) return <div className="min-h-screen flex items-center justify-center text-text-muted">Not found</div>;

  return (
    <div className="min-h-screen">
      <nav className="border-b border-border px-6 py-4">
        <div className="mx-auto max-w-4xl flex items-center gap-4">
          <Link href="/reviewer/browse" className="text-text-muted hover:text-text transition-colors text-sm">&larr; Browse</Link>
        </div>
      </nav>
      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-2xl font-bold mb-2">{request.title}</h1>
        <div className="flex items-center gap-3 mb-4 text-sm text-text-muted">
          <span>by {request.user_name}</span>
          {request.budget_min && request.budget_max && <span>Budget: ${request.budget_min}–${request.budget_max}</span>}
        </div>

        <p className="text-text-secondary leading-relaxed mb-6">{request.description}</p>

        <a href={request.repo_url} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:text-accent-hover font-mono mb-6 inline-block">
          {request.repo_url}
        </a>

        <div className="flex flex-wrap gap-4 mb-8 text-sm">
          {request.stack?.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-text-muted">Stack:</span>
              <div className="flex gap-1.5">
                {request.stack.map((s: string) => (
                  <span key={s} className="bg-surface border border-border rounded-full px-2.5 py-0.5 text-xs">{s}</span>
                ))}
              </div>
            </div>
          )}
          {request.concerns?.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-text-muted">Focus:</span>
              <div className="flex gap-1.5">
                {request.concerns.map((c: string) => (
                  <span key={c} className="bg-accent/10 text-accent rounded-full px-2.5 py-0.5 text-xs capitalize">{c}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {request.concerns_freetext && (
          <div className="bg-surface border border-border rounded-xl p-5 mb-8">
            <h3 className="text-sm font-medium mb-2">What they want you to look at</h3>
            <p className="text-sm text-text-secondary whitespace-pre-wrap">{request.concerns_freetext}</p>
          </div>
        )}

        {/* Quote form */}
        {submitted ? (
          <div className="bg-success/10 border border-success/20 rounded-xl p-6 text-center">
            <div className="text-2xl mb-2">✓</div>
            <h3 className="font-semibold mb-1">Quote submitted</h3>
            <p className="text-sm text-text-muted">You&apos;ll be notified if your quote is accepted.</p>
            <Link href="/reviewer" className="inline-block mt-4 text-sm text-accent hover:text-accent-hover">Back to dashboard</Link>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Submit a Quote</h2>
            {error && <div className="bg-danger/10 border border-danger/20 text-danger text-sm rounded-lg px-4 py-3 mb-4">{error}</div>}
            <form onSubmit={handleSubmitQuote} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium mb-1.5">Price (USD)</label>
                  <input id="price" name="price" type="number" min="1" required className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors" placeholder="350" />
                </div>
                <div>
                  <label htmlFor="turnaround_hours" className="block text-sm font-medium mb-1.5">Turnaround (hours)</label>
                  <input id="turnaround_hours" name="turnaround_hours" type="number" min="1" required className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors" placeholder="24" />
                </div>
              </div>
              <div>
                <label htmlFor="note" className="block text-sm font-medium mb-1.5">Your approach</label>
                <textarea id="note" name="note" rows={4} className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors resize-none" placeholder="Describe what you'll focus on and why you're the right reviewer for this project..." />
              </div>
              <button type="submit" disabled={submitting} className="w-full bg-accent hover:bg-accent-hover disabled:opacity-50 text-white py-3 rounded-lg text-sm font-medium transition-colors">
                {submitting ? "Submitting..." : "Submit Quote"}
              </button>
            </form>
          </div>
        )}
        {/* Chat */}
        {session?.user?.dbId && (
          <div className="mt-8">
            <Chat requestId={Number(params.id)} currentUserId={session.user.dbId} />
          </div>
        )}
      </main>
    </div>
  );
}
