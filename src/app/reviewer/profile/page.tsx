"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const EXPERTISE_OPTIONS = [
  "React", "Next.js", "TypeScript", "Python", "Node.js", "Go", "Rust",
  "iOS", "Android", "DevOps", "Security", "Databases", "AI/ML", "AWS", "Docker",
];

export default function ReviewerProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);

  const [tagline, setTagline] = useState("");
  const [expertise, setExpertise] = useState<string[]>([]);
  const [hourlyRate, setHourlyRate] = useState<string>("");
  const [turnaroundHours, setTurnaroundHours] = useState<string>("48");

  useEffect(() => {
    fetch("/api/reviewer/stats")
      .then((r) => r.json())
      .then((data) => {
        setProfile(data.profile);
        setStats(data.stats);
        setTagline(data.profile?.tagline || "");
        setExpertise(data.profile?.expertise || []);
        setHourlyRate(data.profile?.hourly_rate?.toString() || "");
        setTurnaroundHours(data.profile?.turnaround_hours?.toString() || "48");
        setLoading(false);
      });
  }, []);

  function toggleExpertise(tag: string) {
    setExpertise((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    setError("");

    const res = await fetch("/api/reviewer/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tagline,
        expertise,
        hourly_rate: Number(hourlyRate) || null,
        turnaround_hours: Number(turnaroundHours) || 48,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to save");
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-text-muted">Loading...</div>;

  return (
    <div className="min-h-screen">
      <nav className="border-b border-border px-6 py-4">
        <div className="mx-auto max-w-4xl flex items-center justify-between">
          <Link href="/reviewer" className="text-text-muted hover:text-text transition-colors text-sm">&larr; Dashboard</Link>
          <div className="flex items-center gap-3">
            {saved && <span className="text-xs text-success">Saved</span>}
            <button onClick={handleSave} disabled={saving} className="text-sm bg-accent hover:bg-accent-hover disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors">
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-2xl font-bold mb-8">Your Profile</h1>

        {error && (
          <div className="bg-danger/10 border border-danger/20 text-danger text-sm rounded-lg px-4 py-3 mb-6">{error}</div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-surface border border-border rounded-xl p-4 text-center">
            <div className="text-2xl font-bold">{stats?.completed_reviews || 0}</div>
            <div className="text-xs text-text-muted">Reviews</div>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4 text-center">
            <div className="text-2xl font-bold">{profile?.rating?.toFixed(1) || "—"}</div>
            <div className="text-xs text-text-muted">Rating</div>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4 text-center">
            <div className="text-2xl font-bold">{stats?.pending_quotes || 0}</div>
            <div className="text-xs text-text-muted">Pending Quotes</div>
          </div>
        </div>

        {/* Edit form */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1.5">Tagline</label>
            <input
              value={tagline}
              onChange={(e) => { setTagline(e.target.value); setSaved(false); }}
              className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors"
              placeholder="e.g. Senior backend engineer, 10 years in fintech"
            />
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Hourly Rate ($)</label>
              <input
                type="number"
                value={hourlyRate}
                onChange={(e) => { setHourlyRate(e.target.value); setSaved(false); }}
                min={0}
                className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors"
                placeholder="150"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Turnaround (hours)</label>
              <input
                type="number"
                value={turnaroundHours}
                onChange={(e) => { setTurnaroundHours(e.target.value); setSaved(false); }}
                min={1}
                className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
