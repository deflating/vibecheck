"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const EXPERTISE_OPTIONS = [
  "React", "Next.js", "TypeScript", "Python", "Node.js", "Go", "Rust",
  "iOS", "Android", "DevOps", "Security", "Databases", "AI/ML", "AWS", "Docker",
];

export default function ReviewerOnboardingPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [expertise, setExpertise] = useState<string[]>([]);

  function toggleExpertise(tag: string) {
    setExpertise((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/reviewer/onboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bio: form.get("bio"),
        tagline: form.get("tagline"),
        hourly_rate: Number(form.get("hourly_rate")) || null,
        turnaround_hours: Number(form.get("turnaround_hours")) || 48,
        expertise,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong");
      setLoading(false);
      return;
    }

    router.push("/reviewer");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-8 shadow-sm">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight mb-8 justify-center">
          <span className="text-accent">~</span>
          <span>vibecheck</span>
        </Link>
        <h1 className="text-2xl font-bold text-center mb-2">Set up your reviewer profile</h1>
        <p className="text-text-muted text-center text-sm mb-8">Vibecoders are waiting. Tell them what you bring to the table.</p>

        {error && (
          <div className="bg-danger/10 border border-danger/20 text-danger text-sm rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="tagline" className="block text-sm font-medium mb-1.5">One-liner</label>
            <input id="tagline" name="tagline" autoFocus className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors" placeholder="e.g. Ex-Stripe backend eng. I find the bugs before your users do." />
          </div>
          <div>
            <label htmlFor="bio" className="block text-sm font-medium mb-1.5">Bio</label>
            <textarea id="bio" name="bio" rows={3} className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors resize-none" placeholder="What have you built? What kind of messes have you cleaned up? Why should someone trust you with their codebase?" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Expertise</label>
            <div className="flex flex-wrap gap-2">
              {EXPERTISE_OPTIONS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleExpertise(tag)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    expertise.includes(tag)
                      ? "bg-accent/20 border-accent text-accent"
                      : "border-border text-text-secondary hover:border-border-light"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="hourly_rate" className="block text-sm font-medium mb-1.5">Indicative Rate ($/hr)</label>
              <input id="hourly_rate" name="hourly_rate" type="number" min={0} className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors" placeholder="150" />
              <p className="text-xs text-text-muted mt-1">Helps vibecoders estimate costs. You set the actual price per project when you quote.</p>
            </div>
            <div>
              <label htmlFor="turnaround_hours" className="block text-sm font-medium mb-1.5">Turnaround (hrs)</label>
              <input id="turnaround_hours" name="turnaround_hours" type="number" min={1} defaultValue={48} className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-accent-pop hover:bg-accent-pop-hover disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
            {loading ? "Setting up..." : "Start Getting Paid to Review"}
          </button>
        </form>
      </div>
    </div>
  );
}
