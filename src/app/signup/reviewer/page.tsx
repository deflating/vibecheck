"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const EXPERTISE_OPTIONS = [
  "React", "Next.js", "TypeScript", "Python", "Node.js", "Go", "Rust",
  "iOS", "Android", "DevOps", "Security", "Databases", "AI/ML", "AWS", "Docker",
];

export default function ReviewerSignupPage() {
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
    const res = await fetch("/api/auth/signup-reviewer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
        name: form.get("name"),
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

    router.push("/reviewer/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight mb-8 justify-center">
          <span className="text-accent">~</span>
          <span>vibecheck</span>
        </Link>
        <h1 className="text-2xl font-bold text-center mb-2">Join as a Reviewer</h1>
        <p className="text-text-muted text-center text-sm mb-8">Help vibecoders ship better code</p>

        {error && (
          <div className="bg-danger/10 border border-danger/20 text-danger text-sm rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1.5">Name</label>
            <input id="name" name="name" required className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors" placeholder="Your name" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1.5">Email</label>
            <input id="email" name="email" type="email" required className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors" placeholder="you@example.com" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1.5">Password</label>
            <input id="password" name="password" type="password" required minLength={8} className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors" placeholder="At least 8 characters" />
          </div>
          <div>
            <label htmlFor="tagline" className="block text-sm font-medium mb-1.5">Tagline</label>
            <input id="tagline" name="tagline" className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors" placeholder="e.g. Senior backend engineer, 10 years in fintech" />
          </div>
          <div>
            <label htmlFor="bio" className="block text-sm font-medium mb-1.5">Bio</label>
            <textarea id="bio" name="bio" rows={3} className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors resize-none" placeholder="Tell vibecoders about your experience..." />
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
              <label htmlFor="hourly_rate" className="block text-sm font-medium mb-1.5">Hourly Rate ($)</label>
              <input id="hourly_rate" name="hourly_rate" type="number" min={0} className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors" placeholder="150" />
            </div>
            <div>
              <label htmlFor="turnaround_hours" className="block text-sm font-medium mb-1.5">Turnaround (hrs)</label>
              <input id="turnaround_hours" name="turnaround_hours" type="number" min={1} defaultValue={48} className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-accent hover:bg-accent-hover disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
            {loading ? "Creating account..." : "Start Reviewing"}
          </button>
        </form>

        <p className="text-center text-sm text-text-muted mt-6">
          Want code reviewed instead?{" "}
          <Link href="/signup" className="text-accent hover:text-accent-hover">Sign up as a vibecoder</Link>
        </p>
        <p className="text-center text-sm text-text-muted mt-2">
          Already have an account?{" "}
          <Link href="/login" className="text-accent hover:text-accent-hover">Log in</Link>
        </p>
      </div>
    </div>
  );
}
