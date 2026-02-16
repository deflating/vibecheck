"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const EXPERTISE_OPTIONS = [
  "React", "Next.js", "TypeScript", "Python", "Node.js", "Go", "Rust",
  "iOS", "Android", "DevOps", "Security", "Databases", "AI/ML", "AWS", "Docker",
];

const LANG_SUGGESTIONS = [
  "JavaScript", "TypeScript", "Python", "Go", "Rust", "Java", "C#", "Ruby",
  "Swift", "Kotlin", "PHP", "C++", "Elixir", "Scala",
];

const FRAMEWORK_SUGGESTIONS = [
  "React", "Next.js", "Vue", "Angular", "Svelte", "Express", "Django", "FastAPI",
  "Rails", "Spring Boot", "Flutter", "SwiftUI", "Tailwind CSS", "Docker", "Kubernetes",
];

interface WorkEntry { company: string; role: string; years: string; }
interface ProjectEntry { name: string; url: string; description: string; }

export default function ReviewerProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);

  // Basic info
  const [tagline, setTagline] = useState("");
  const [expertise, setExpertise] = useState<string[]>([]);
  const [hourlyRate, setHourlyRate] = useState("");
  const [turnaroundHours, setTurnaroundHours] = useState("48");

  // Links
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [blogUrl, setBlogUrl] = useState("");

  // Skills
  const [languages, setLanguages] = useState<string[]>([]);
  const [langInput, setLangInput] = useState("");
  const [frameworks, setFrameworks] = useState<string[]>([]);
  const [frameworkInput, setFrameworkInput] = useState("");

  // Work history
  const [workHistory, setWorkHistory] = useState<WorkEntry[]>([]);

  // Featured projects
  const [featuredProjects, setFeaturedProjects] = useState<ProjectEntry[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/reviewer/profile").then(r => r.json()),
      fetch("/api/reviewer/stats").then(r => r.json()),
    ]).then(([profileData, statsData]) => {
      setProfile(profileData);
      setStats(statsData.stats);
      setTagline(profileData.tagline || "");
      setExpertise(profileData.expertise || []);
      setHourlyRate(profileData.hourly_rate?.toString() || "");
      setTurnaroundHours(profileData.turnaround_hours?.toString() || "48");
      setPortfolioUrl(profileData.portfolio_url || "");
      setLinkedinUrl(profileData.linkedin_url || "");
      setTwitterUrl(profileData.twitter_url || "");
      setBlogUrl(profileData.blog_url || "");
      setLanguages(profileData.languages || []);
      setFrameworks(profileData.frameworks || []);
      setWorkHistory(profileData.work_history || []);
      setFeaturedProjects(profileData.featured_projects || []);
      setLoading(false);
    });
  }, []);

  function toggleExpertise(tag: string) {
    setExpertise(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
    setSaved(false);
  }

  function addTag(list: string[], setList: (v: string[]) => void, value: string) {
    if (value.trim() && !list.includes(value.trim())) {
      setList([...list, value.trim()]);
      setSaved(false);
    }
  }

  function removeTag(list: string[], setList: (v: string[]) => void, value: string) {
    setList(list.filter(t => t !== value));
    setSaved(false);
  }

  function addWorkEntry() {
    setWorkHistory([...workHistory, { company: "", role: "", years: "" }]);
    setSaved(false);
  }

  function updateWorkEntry(i: number, field: keyof WorkEntry, value: string) {
    const updated = [...workHistory];
    updated[i] = { ...updated[i], [field]: value };
    setWorkHistory(updated);
    setSaved(false);
  }

  function removeWorkEntry(i: number) {
    setWorkHistory(workHistory.filter((_, j) => j !== i));
    setSaved(false);
  }

  function addProjectEntry() {
    setFeaturedProjects([...featuredProjects, { name: "", url: "", description: "" }]);
    setSaved(false);
  }

  function updateProjectEntry(i: number, field: keyof ProjectEntry, value: string) {
    const updated = [...featuredProjects];
    updated[i] = { ...updated[i], [field]: value };
    setFeaturedProjects(updated);
    setSaved(false);
  }

  function removeProjectEntry(i: number) {
    setFeaturedProjects(featuredProjects.filter((_, j) => j !== i));
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
        portfolio_url: portfolioUrl,
        linkedin_url: linkedinUrl,
        twitter_url: twitterUrl,
        blog_url: blogUrl,
        languages,
        frameworks,
        work_history: workHistory.filter(w => w.company || w.role),
        featured_projects: featuredProjects.filter(p => p.name),
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

  if (loading) return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
        <div className="h-7 bg-surface-hover rounded w-48 mb-8 animate-pulse" />
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-surface border border-border rounded-xl p-4 text-center animate-pulse">
              <div className="h-7 bg-surface-hover rounded w-12 mx-auto mb-2" />
              <div className="h-3 bg-surface-hover rounded w-16 mx-auto" />
            </div>
          ))}
        </div>
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-5 bg-surface-hover rounded w-24 mb-4" />
              <div className="h-10 bg-surface-hover rounded-lg w-full" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Your Reviewer Profile</h1>
          <div className="flex items-center gap-3">
            {profile?.github_username && (
              <Link href={`/reviewer/${profile.github_username}`} className="text-xs text-accent hover:underline">
                View public profile
              </Link>
            )}
            {saved && <span className="text-xs text-success">Saved</span>}
            <button onClick={handleSave} disabled={saving} className="text-sm bg-accent-pop hover:bg-accent-pop-hover disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors">
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-danger/10 border border-danger/20 text-danger text-sm rounded-lg px-4 py-3 mb-6">{error}</div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
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

        <div className="space-y-10">
          {/* Basic Info */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Basic Info</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Tagline</label>
                <input
                  value={tagline}
                  onChange={e => { setTagline(e.target.value); setSaved(false); }}
                  className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors"
                  placeholder="e.g. Ex-Stripe backend eng. I find the bugs before your users do."
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Hourly Rate ($)</label>
                  <input
                    type="number"
                    value={hourlyRate}
                    onChange={e => { setHourlyRate(e.target.value); setSaved(false); }}
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
                    onChange={e => { setTurnaroundHours(e.target.value); setSaved(false); }}
                    min={1}
                    className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Links */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Links</h2>
            {profile?.github_username && (
              <div className="mb-3 flex items-center gap-2 text-sm text-text-secondary">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                <a href={`https://github.com/${profile.github_username}`} target="_blank" rel="noopener noreferrer" className="hover:text-accent">
                  github.com/{profile.github_username}
                </a>
                <span className="text-text-muted text-xs">(auto-linked)</span>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Portfolio</label>
                <input value={portfolioUrl} onChange={e => { setPortfolioUrl(e.target.value); setSaved(false); }} className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors" placeholder="https://yoursite.com" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">LinkedIn</label>
                <input value={linkedinUrl} onChange={e => { setLinkedinUrl(e.target.value); setSaved(false); }} className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors" placeholder="https://linkedin.com/in/you" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Twitter / X</label>
                <input value={twitterUrl} onChange={e => { setTwitterUrl(e.target.value); setSaved(false); }} className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors" placeholder="https://twitter.com/you" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Blog</label>
                <input value={blogUrl} onChange={e => { setBlogUrl(e.target.value); setSaved(false); }} className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors" placeholder="https://blog.yoursite.com" />
              </div>
            </div>
          </section>

          {/* Skills */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Skills</h2>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Languages</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {languages.map(l => (
                  <button key={l} type="button" onClick={() => removeTag(languages, setLanguages, l)} className="bg-accent/10 text-accent text-sm px-3 py-1 rounded-full hover:bg-accent/20 transition-colors">
                    {l} &times;
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={langInput}
                  onChange={e => setLangInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(languages, setLanguages, langInput); setLangInput(""); } }}
                  className="flex-1 bg-surface border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors"
                  placeholder="Add a language..."
                />
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {LANG_SUGGESTIONS.filter(s => !languages.includes(s)).map(s => (
                  <button key={s} type="button" onClick={() => addTag(languages, setLanguages, s)} className="text-xs text-text-muted border border-border hover:border-border-light rounded-full px-2.5 py-1 transition-colors">
                    + {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Frameworks & Tools</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {frameworks.map(f => (
                  <button key={f} type="button" onClick={() => removeTag(frameworks, setFrameworks, f)} className="bg-accent/10 text-accent text-sm px-3 py-1 rounded-full hover:bg-accent/20 transition-colors">
                    {f} &times;
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={frameworkInput}
                  onChange={e => setFrameworkInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(frameworks, setFrameworks, frameworkInput); setFrameworkInput(""); } }}
                  className="flex-1 bg-surface border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors"
                  placeholder="Add a framework or tool..."
                />
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {FRAMEWORK_SUGGESTIONS.filter(s => !frameworks.includes(s)).map(s => (
                  <button key={s} type="button" onClick={() => addTag(frameworks, setFrameworks, s)} className="text-xs text-text-muted border border-border hover:border-border-light rounded-full px-2.5 py-1 transition-colors">
                    + {s}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Work History */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Work History</h2>
            <div className="space-y-3">
              {workHistory.map((entry, i) => (
                <div key={i} className="bg-surface border border-border rounded-lg p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      value={entry.company}
                      onChange={e => updateWorkEntry(i, "company", e.target.value)}
                      className="bg-bg border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent transition-colors"
                      placeholder="Company"
                    />
                    <input
                      value={entry.role}
                      onChange={e => updateWorkEntry(i, "role", e.target.value)}
                      className="bg-bg border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent transition-colors"
                      placeholder="Role"
                    />
                    <div className="flex gap-2">
                      <input
                        value={entry.years}
                        onChange={e => updateWorkEntry(i, "years", e.target.value)}
                        className="flex-1 bg-bg border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent transition-colors"
                        placeholder="e.g. 2020-2023"
                      />
                      <button type="button" onClick={() => removeWorkEntry(i)} className="text-text-muted hover:text-danger text-sm px-2 transition-colors">&times;</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button type="button" onClick={addWorkEntry} className="mt-3 text-sm text-accent hover:text-accent-hover transition-colors">
              + Add work experience
            </button>
          </section>

          {/* Featured Projects */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Featured Projects</h2>
            <div className="space-y-3">
              {featuredProjects.map((proj, i) => (
                <div key={i} className="bg-surface border border-border rounded-lg p-4">
                  <div className="flex gap-3 mb-3">
                    <input
                      value={proj.name}
                      onChange={e => updateProjectEntry(i, "name", e.target.value)}
                      className="flex-1 bg-bg border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent transition-colors"
                      placeholder="Project name"
                    />
                    <input
                      value={proj.url}
                      onChange={e => updateProjectEntry(i, "url", e.target.value)}
                      className="flex-1 bg-bg border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent transition-colors"
                      placeholder="https://..."
                    />
                    <button type="button" onClick={() => removeProjectEntry(i)} className="text-text-muted hover:text-danger text-sm px-2 transition-colors">&times;</button>
                  </div>
                  <input
                    value={proj.description}
                    onChange={e => updateProjectEntry(i, "description", e.target.value)}
                    className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent transition-colors"
                    placeholder="Brief description"
                  />
                </div>
              ))}
            </div>
            <button type="button" onClick={addProjectEntry} className="mt-3 text-sm text-accent hover:text-accent-hover transition-colors">
              + Add featured project
            </button>
          </section>

          {/* Expertise Areas */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Expertise Areas</h2>
            <div className="flex flex-wrap gap-2">
              {EXPERTISE_OPTIONS.map(tag => (
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
          </section>
        </div>
      </main>
    </div>
  );
}
