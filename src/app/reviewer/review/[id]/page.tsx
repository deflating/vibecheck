"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FileUpload } from "@/components/file-upload";

const CATEGORIES = [
  { key: "security", label: "Security" },
  { key: "architecture", label: "Architecture" },
  { key: "performance", label: "Performance" },
  { key: "maintainability", label: "Maintainability" },
] as const;

export default function ReviewWorkspace() {
  const params = useParams();
  const router = useRouter();
  const [review, setReview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<"" | "saving" | "saved">("");
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [summary, setSummary] = useState("");
  const [scores, setScores] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [overallScore, setOverallScore] = useState<number>(0);
  const [recommendations, setRecommendations] = useState("");
  const [attachments, setAttachments] = useState<{ id: number; original_name: string; size: number }[]>([]);

  useEffect(() => {
    fetch(`/api/reviews/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setReview(data);
        if (data.summary) setSummary(data.summary);
        if (data.recommendations) setRecommendations(data.recommendations);
        if (data.overall_score) setOverallScore(data.overall_score);
        CATEGORIES.forEach(({ key }) => {
          if (data[`${key}_score`]) setScores((s) => ({ ...s, [key]: data[`${key}_score`] }));
          if (data[`${key}_notes`]) setNotes((n) => ({ ...n, [key]: data[`${key}_notes`] }));
        });
        setLoading(false);
      });
    fetch(`/api/attachments?review_id=${params.id}`).then(r => r.json()).then(setAttachments).catch(() => {});
  }, [params.id]);

  const wordCount = useCallback((text: string) => text.trim() ? text.trim().split(/\s+/).length : 0, []);

  const triggerAutoSave = useCallback(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      setAutoSaveStatus("saving");
      const body: any = { summary, recommendations };
      CATEGORIES.forEach(({ key }) => {
        body[`${key}_score`] = scores[key] || null;
        body[`${key}_notes`] = notes[key] || null;
      });
      await fetch(`/api/reviews/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setAutoSaveStatus("saved");
      setTimeout(() => setAutoSaveStatus(""), 2000);
    }, 2000);
  }, [summary, recommendations, scores, notes, params.id]);

  async function handleSave(submit: boolean) {
    setSaving(true);
    const body: any = { summary, recommendations };
    CATEGORIES.forEach(({ key }) => {
      body[`${key}_score`] = scores[key] || null;
      body[`${key}_notes`] = notes[key] || null;
    });
    if (submit) {
      body.overall_score = overallScore || Math.round(
        Object.values(scores).reduce((a, b) => a + b, 0) / Math.max(Object.values(scores).length, 1)
      );
    }

    await fetch(`/api/reviews/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setSaving(false);
    if (submit) {
      router.push("/reviewer");
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  if (loading) return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div className="h-7 bg-surface-hover rounded w-48 animate-pulse" />
          <div className="flex items-center gap-3">
            <div className="h-9 bg-surface-hover rounded-lg w-24 animate-pulse" />
            <div className="h-9 bg-surface-hover rounded-lg w-32 animate-pulse" />
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5 mb-8 animate-pulse">
          <div className="h-5 bg-surface-hover rounded w-1/3 mb-3" />
          <div className="h-4 bg-surface-hover rounded w-2/3 mb-3" />
          <div className="h-4 bg-surface-hover rounded w-1/2" />
        </div>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-surface border border-border rounded-xl p-5 mb-6 animate-pulse">
            <div className="h-5 bg-surface-hover rounded w-24 mb-4" />
            <div className="h-20 bg-surface-hover rounded" />
          </div>
        ))}
      </main>
    </div>
  );
  if (!review) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-text-muted gap-4">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted/50">
        <circle cx="12" cy="12" r="10" /><path d="M16 16s-1.5-2-4-2-4 2-4 2M9 9h.01M15 9h.01" />
      </svg>
      <p>Review not found</p>
      <a href="/reviewer" className="text-sm text-accent hover:text-accent-hover">Back to dashboard</a>
    </div>
  );

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold truncate">{review.request_title}</h1>
          <div className="flex items-center gap-3 flex-shrink-0">
            {autoSaveStatus === "saving" && <span className="text-xs text-text-muted">Auto-saving...</span>}
            {autoSaveStatus === "saved" && <span className="text-xs text-success">Auto-saved</span>}
            {saved && <span className="text-xs text-success">Saved</span>}
            <button onClick={() => handleSave(false)} disabled={saving} className="text-sm border border-border hover:border-border-light px-4 py-2 rounded-lg transition-colors">
              Save Draft
            </button>
            <button onClick={() => handleSave(true)} disabled={saving} className="text-sm bg-accent-pop hover:bg-accent-pop-hover text-white px-4 py-2 rounded-lg transition-colors">
              Submit Review
            </button>
          </div>
        </div>
        {/* Project context */}
        <div className="bg-surface border border-border rounded-xl p-5 mb-8">
          <h2 className="font-semibold mb-2">{review.request_title}</h2>
          <p className="text-sm text-text-secondary mb-3">{review.request_description}</p>
          <a href={review.repo_url} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:text-accent-hover font-mono">
            {review.repo_url}
          </a>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {review.stack?.map((s: string) => (
              <span key={s} className="text-xs bg-surface-hover border border-border rounded-full px-2 py-0.5">{s}</span>
            ))}
            {review.concerns?.map((c: string) => (
              <span key={c} className="text-xs bg-accent/10 text-accent rounded-full px-2 py-0.5 capitalize">{c}</span>
            ))}
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 mb-8 bg-surface border border-border rounded-lg p-1 w-fit">
          <button
            onClick={() => setActiveTab("edit")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === "edit" ? "bg-accent text-white" : "text-text-muted hover:text-text"}`}
          >Edit</button>
          <button
            onClick={() => setActiveTab("preview")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === "preview" ? "bg-accent text-white" : "text-text-muted hover:text-text"}`}
          >Preview</button>
        </div>

        {activeTab === "preview" ? (
          <div className="mb-8">
            <div className="bg-surface border border-border rounded-xl p-6 space-y-6">
              {summary && <p className="text-text-secondary leading-relaxed">{summary}</p>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CATEGORIES.map(({ key, label }) => (
                  <div key={key} className="bg-bg border border-border rounded-lg p-4">
                    <div className="text-xs text-text-muted mb-1">{label}</div>
                    <div className="text-2xl font-bold mb-2">{scores[key] || "—"}<span className="text-sm text-text-muted font-normal">/10</span></div>
                    {scores[key] && (
                      <div className="h-2 bg-border rounded-full overflow-hidden mb-2">
                        <div className={`h-full rounded-full transition-all ${(scores[key] || 0) <= 3 ? "bg-danger" : (scores[key] || 0) <= 5 ? "bg-warning" : (scores[key] || 0) <= 7 ? "bg-accent" : "bg-success"}`} style={{ width: `${(scores[key] || 0) * 10}%` }} />
                      </div>
                    )}
                    {notes[key] && <p className="text-sm text-text-secondary whitespace-pre-wrap">{notes[key]}</p>}
                  </div>
                ))}
              </div>
              <div className="text-center">
                <div className="text-xs text-text-muted mb-1">Overall</div>
                <div className="text-4xl font-bold text-accent">{overallScore || "—"}<span className="text-lg text-text-muted font-normal">/10</span></div>
              </div>
              {recommendations && (
                <div className="border-t border-border pt-4">
                  <h3 className="text-sm font-semibold mb-2">Recommendations</h3>
                  <p className="text-sm text-text-secondary whitespace-pre-wrap">{recommendations}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
        <>

        {/* Summary */}
        <div className="mb-8">
          <label className="block text-sm font-medium mb-2">Executive Summary</label>
          <textarea
            value={summary}
            onChange={(e) => { setSummary(e.target.value); triggerAutoSave(); }}
            rows={4}
            className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors resize-none"
            placeholder="High-level summary of your findings. What are the critical issues vs nice-to-haves?"
          />
          <div className="text-xs text-text-muted mt-1 text-right">{wordCount(summary)} words</div>
        </div>

        {/* Category scores */}
        <div className="space-y-6 mb-8">
          {CATEGORIES.map(({ key, label }) => (
            <div key={key} className="bg-surface border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">{label}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted">Poor</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setScores({ ...scores, [key]: n })}
                        className={`w-7 h-7 rounded text-xs font-medium transition-colors ${
                          scores[key] === n
                            ? "bg-accent text-white"
                            : scores[key] && n <= scores[key]
                            ? "bg-accent/20 text-accent"
                            : "bg-bg border border-border text-text-muted hover:border-border-light"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                  <span className="text-xs text-text-muted">Great</span>
                </div>
              </div>
              <textarea
                value={notes[key] || ""}
                onChange={(e) => { setNotes({ ...notes, [key]: e.target.value }); triggerAutoSave(); }}
                rows={4}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors resize-none font-mono"
                placeholder={`Detailed ${label.toLowerCase()} findings. Reference specific files and lines where possible...`}
              />
              <div className="text-xs text-text-muted mt-1 text-right">{wordCount(notes[key] || "")} words</div>
            </div>
          ))}
        </div>

        {/* Recommendations */}
        <div className="mb-8">
          <label className="block text-sm font-medium mb-2">Recommendations</label>
          <textarea
            value={recommendations}
            onChange={(e) => { setRecommendations(e.target.value); triggerAutoSave(); }}
            rows={5}
            className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors resize-none"
            placeholder="What should they do next? Prioritized list of fixes, refactors, or improvements you'd recommend..."
          />
          <div className="text-xs text-text-muted mt-1 text-right">{wordCount(recommendations)} words</div>
        </div>

        {/* Attachments */}
        <div className="mb-8">
          <label className="block text-sm font-medium mb-2">Attachments</label>
          <FileUpload
            attachments={attachments}
            reviewId={Number(params.id)}
            onUpload={(a) => setAttachments([...attachments, a])}
          />
        </div>

        {/* Overall score */}
        <div className="bg-surface border border-border rounded-xl p-6 text-center">
          <label className="block text-sm font-medium mb-3">Overall Score</label>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setOverallScore(n)}
                className={`w-10 h-10 rounded-lg text-sm font-semibold transition-colors ${
                  overallScore === n
                    ? "bg-accent text-white"
                    : overallScore && n <= overallScore
                    ? "bg-accent/20 text-accent"
                    : "bg-bg border border-border text-text-muted hover:border-border-light"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        </>
        )}
      </main>
    </div>
  );
}
