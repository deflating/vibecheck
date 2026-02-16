"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import type { GitHubRepo } from "@/lib/models";

const CONCERN_OPTIONS = ["security", "architecture", "performance", "maintainability", "testing", "accessibility"];
const STACK_SUGGESTIONS = ["React", "Next.js", "TypeScript", "Python", "Node.js", "Go", "Rust", "PostgreSQL", "MongoDB", "AWS", "Docker", "Tailwind CSS"];
const CATEGORY_OPTIONS = ["Full App Review", "Security Audit", "Architecture Review", "Performance Review", "Pre-Launch Check", "Quick Sanity Check"];

export default function NewRequestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [concerns, setConcerns] = useState<string[]>([]);
  const [stack, setStack] = useState<string[]>([]);
  const [stackInput, setStackInput] = useState("");
  const [category, setCategory] = useState("Full App Review");
  const [files, setFiles] = useState<File[]>([]);

  // GitHub repos
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [reposLoading, setReposLoading] = useState(true);
  const [selectedRepo, setSelectedRepo] = useState<string>("");
  const [repoSearch, setRepoSearch] = useState("");
  const [showRepoDropdown, setShowRepoDropdown] = useState(false);

  useEffect(() => {
    fetch("/api/github/repos")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setRepos(data);
        setReposLoading(false);
      })
      .catch(() => setReposLoading(false));
  }, []);

  const filteredRepos = repos.filter((r) =>
    r.full_name.toLowerCase().includes(repoSearch.toLowerCase())
  );

  function selectRepo(repo: GitHubRepo) {
    setSelectedRepo(repo.html_url);
    setRepoSearch(repo.full_name);
    setShowRepoDropdown(false);
  }

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
    const repoUrl = selectedRepo || form.get("repo_url");
    const res = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.get("title"),
        repo_url: repoUrl,
        description: form.get("description"),
        stack,
        concerns,
        concerns_freetext: form.get("concerns_freetext") || "",
        category,
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

    // Upload any attached files
    for (const file of files) {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("request_id", String(id));
      await fetch("/api/attachments", { method: "POST", body: fd });
    }

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
        <h1 className="text-2xl font-bold mb-2">Get expert eyes on your code</h1>
        <p className="text-text-muted text-sm mb-8">Tell us about your project and a senior dev will take it from here</p>

        {error && (
          <div className="bg-danger/10 border border-danger/20 text-danger text-sm rounded-lg px-4 py-3 mb-6">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1.5">Project title</label>
            <input id="title" name="title" required autoFocus className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors" placeholder="e.g. SaaS Billing Dashboard" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">GitHub repository</label>
            {reposLoading ? (
              <div className="text-text-muted text-sm py-2">Loading your repos...</div>
            ) : repos.length > 0 ? (
              <div className="relative">
                <input
                  value={repoSearch}
                  onChange={(e) => { setRepoSearch(e.target.value); setShowRepoDropdown(true); setSelectedRepo(""); }}
                  onFocus={() => setShowRepoDropdown(true)}
                  className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors font-mono"
                  placeholder="Search your repos..."
                />
                {showRepoDropdown && filteredRepos.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full max-h-60 overflow-y-auto bg-surface border border-border rounded-lg shadow-lg">
                    {filteredRepos.slice(0, 20).map((repo) => (
                      <button
                        key={repo.id}
                        type="button"
                        onClick={() => selectRepo(repo)}
                        className="w-full text-left px-3 py-2.5 hover:bg-surface-hover transition-colors border-b border-border last:border-0"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-mono">{repo.full_name}</span>
                          <div className="flex items-center gap-2 text-xs text-text-muted">
                            {repo.private && <span className="bg-warning/10 text-warning px-1.5 py-0.5 rounded">private</span>}
                            {repo.language && <span>{repo.language}</span>}
                          </div>
                        </div>
                        {repo.description && (
                          <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{repo.description}</p>
                        )}
                      </button>
                    ))}
                  </div>
                )}
                {/* Hidden input for form submission fallback */}
                <input type="hidden" name="repo_url" value={selectedRepo} />
                <p className="text-text-muted text-xs mt-1.5 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                  Your code is only visible to the reviewer you select
                </p>
              </div>
            ) : (
              <input name="repo_url" required className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors font-mono" placeholder="https://github.com/you/your-repo" />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Review type</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${
                    category === c
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
            <label htmlFor="description" className="block text-sm font-medium mb-1.5">What does it do?</label>
            <textarea id="description" name="description" required rows={4} className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors resize-none" placeholder="What does this app do? What parts feel shaky? What would keep you up at night if it went to production?" />
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
            <label className="block text-sm font-medium mb-2">What keeps you up at night?</label>
            <div className="flex flex-wrap gap-2 mb-3">
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
            <textarea name="concerns_freetext" rows={3} className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors resize-none" placeholder="Anything specific you want the reviewer to look at? E.g. 'I'm worried about the auth flow — it was entirely AI-generated and I have no idea if it's secure...'" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Budget range (USD)</label>
            <div className="flex items-center gap-3">
              <input name="budget_min" type="number" min="0" className="w-32 bg-surface border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors" placeholder="Min" />
              <span className="text-text-muted">to</span>
              <input name="budget_max" type="number" min="0" className="w-32 bg-surface border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors" placeholder="Max" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Attachments</label>
            <div className="flex items-center gap-3 mb-2">
              <label className="cursor-pointer text-sm border border-border hover:border-border-light rounded-lg px-3 py-1.5 transition-colors text-text-secondary">
                Attach files
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) setFiles([...files, ...Array.from(e.target.files)]);
                    e.target.value = "";
                  }}
                />
              </label>
              <span className="text-xs text-text-muted">Max 10MB each</span>
            </div>
            {files.length > 0 && (
              <div className="space-y-1.5">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="text-text-muted">📎</span>
                    <span className="truncate">{f.name}</span>
                    <span className="text-xs text-text-muted">{(f.size / 1024).toFixed(0)} KB</span>
                    <button type="button" onClick={() => setFiles(files.filter((_, j) => j !== i))} className="text-xs text-text-muted hover:text-danger">&times;</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" disabled={loading} className="w-full bg-accent-pop hover:bg-accent-pop-hover disabled:opacity-50 text-white py-3 rounded-lg text-sm font-medium transition-colors">
            {loading ? "Posting..." : "Post Review Request"}
          </button>
        </form>
      </main>
    </div>
  );
}
