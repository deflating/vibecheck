"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

const CONCERN_OPTIONS = ["security", "architecture", "performance", "maintainability", "testing", "accessibility"];
const STACK_SUGGESTIONS = ["React", "Next.js", "TypeScript", "Python", "Node.js", "Go", "Rust", "PostgreSQL", "MongoDB", "AWS", "Docker", "Tailwind CSS"];

export default function NewRequestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [concerns, setConcerns] = useState<string[]>([]);
  const [stack, setStack] = useState<string[]>([]);
  const [stackInput, setStackInput] = useState("");

  function toggleConcern(c: string) {
    setConcerns((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);
  }

  function addStack(s: string) {
    if (!stack.includes(s)) setStack([...stack, s]);
    setStackInput("");
  }

  function removeStack(s: string) {
    setStack(stack.filter((x) => x !== s));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.get("title"),
        repo_url: form.get("repo_url"),
        description: form.get("description"),
        stack,
        concerns,
        budget_min: Number(form.get("budget_min")) || null,
        budget_max: Number(form.get("budget_max")) || null,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong");
      setLoading(false);
      return;
    }

    const { id } = await res.json();
    router.push(`/requests/${id}`);
  }

  return (
    <div className="min-h-screen">
      <nav className="border-b border-border px-6 py-4">
        <div className="mx-auto max-w-3xl flex items-center gap-4">
          <Link href="/dashboard" className="text-text-muted hover:text-text transition-colors text-sm">&larr; Dashboard</Link>
        </div>
      </nav>
      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-bold mb-2">Post a Review Request</h1>
        <p className="text-text-muted text-sm mb-8">Describe your project and what you need reviewed</p>

        {error && (
          <div className="bg-danger/10 border border-danger/20 text-danger text-sm rounded-lg px-4 py-3 mb-6">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1.5">Project title</label>
            <input id="title" name="title" required className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors" placeholder="e.g. SaaS Billing Dashboard" />
          </div>

          <div>
            <label htmlFor="repo_url" className="block text-sm font-medium mb-1.5">GitHub repo URL</label>
            <input id="repo_url" name="repo_url" required className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors font-mono" placeholder="https://github.com/you/your-repo" />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1.5">What does it do?</label>
            <textarea id="description" name="description" required rows={4} className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors resize-none" placeholder="Describe your project and any specific areas you'd like reviewed..." />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tech stack</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {stack.map((s) => (
                <button key={s} type="button" onClick={() => removeStack(s)} className="bg-accent/10 text-accent text-sm px-3 py-1 rounded-full hover:bg-accent/20 transition-colors">
                  {s} &times;
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={stackInput}
                onChange={(e) => setStackInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (stackInput.trim()) addStack(stackInput.trim()); } }}
                className="flex-1 bg-surface border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors"
                placeholder="Add a technology..."
              />
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {STACK_SUGGESTIONS.filter((s) => !stack.includes(s)).map((s) => (
                <button key={s} type="button" onClick={() => addStack(s)} className="text-xs text-text-muted border border-border hover:border-border-light rounded-full px-2.5 py-1 transition-colors">
                  + {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">What are you worried about?</label>
            <div className="flex flex-wrap gap-2">
              {CONCERN_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleConcern(c)}
                  className={`text-sm px-3 py-1.5 rounded-lg border transition-colors capitalize ${
                    concerns.includes(c)
                      ? "bg-accent/10 border-accent text-accent"
                      : "border-border text-text-muted hover:border-border-light"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Budget range (USD)</label>
            <div className="flex items-center gap-3">
              <input name="budget_min" type="number" min="0" className="w-32 bg-surface border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors" placeholder="Min" />
              <span className="text-text-muted">to</span>
              <input name="budget_max" type="number" min="0" className="w-32 bg-surface border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors" placeholder="Max" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-accent hover:bg-accent-hover disabled:opacity-50 text-white py-3 rounded-lg text-sm font-medium transition-colors">
            {loading ? "Posting..." : "Post Review Request"}
          </button>
        </form>
      </main>
    </div>
  );
}
