"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "./confirm-dialog";

export function RequestActions({
  requestId,
  status,
  isOwner,
  hasAcceptedQuote,
  request,
}: {
  requestId: number;
  status: string;
  isOwner: boolean;
  hasAcceptedQuote: boolean;
  request: { title: string; description: string; repo_url: string; stack: string[]; concerns: string[]; budget_min: number | null; budget_max: number | null; category?: string };
}) {
  const router = useRouter();
  const [showCancel, setShowCancel] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Edit form state
  const [title, setTitle] = useState(request.title);
  const [description, setDescription] = useState(request.description);
  const [budgetMin, setBudgetMin] = useState(request.budget_min?.toString() || "");
  const [budgetMax, setBudgetMax] = useState(request.budget_max?.toString() || "");

  const canCancel = isOwner && (status === "open" || status === "in_progress");
  const canEdit = isOwner && status === "open" && !hasAcceptedQuote;
  const canRepost = isOwner && (status === "completed" || status === "cancelled");

  async function handleCancel() {
    setCancelling(true);
    try {
      const res = await fetch(`/api/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Failed to cancel request" }));
        alert(data.error || "Failed to cancel request");
      }
    } catch {
      alert("Network error. Please try again.");
    }
    setShowCancel(false);
    setCancelling(false);
    router.refresh();
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          budget_min: budgetMin ? Number(budgetMin) : null,
          budget_max: budgetMax ? Number(budgetMax) : null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Failed to save changes" }));
        alert(data.error || "Failed to save changes");
        setSaving(false);
        return;
      }
      setEditing(false);
    } catch {
      alert("Network error. Please try again.");
    }
    setSaving(false);
    router.refresh();
  }

  function repostUrl() {
    const params = new URLSearchParams();
    params.set("title", request.title);
    params.set("description", request.description);
    params.set("repo_url", request.repo_url);
    if (request.stack.length) params.set("stack", request.stack.join(","));
    if (request.concerns.length) params.set("concerns", request.concerns.join(","));
    if (request.budget_min) params.set("budget_min", String(request.budget_min));
    if (request.budget_max) params.set("budget_max", String(request.budget_max));
    if (request.category) params.set("category", request.category);
    return `/requests/new?${params.toString()}`;
  }

  if (editing) {
    return (
      <div className="bg-surface border border-border rounded-xl p-5 mb-8">
        <h3 className="text-sm font-semibold mb-4">Edit Request</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent resize-none" />
          </div>
          <div className="flex gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Budget min</label>
              <input type="number" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} className="w-28 bg-bg border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Budget max</label>
              <input type="number" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} className="w-28 bg-bg border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleSave} disabled={saving} className="bg-accent-pop hover:bg-accent-pop-hover disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg transition-colors">
              {saving ? "Saving..." : "Save"}
            </button>
            <button onClick={() => setEditing(false)} className="text-sm px-4 py-2 rounded-lg border border-border hover:bg-surface-hover transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex gap-2 mb-8">
        {canEdit && (
          <button onClick={() => setEditing(true)} className="text-sm px-4 py-2 rounded-lg border border-border hover:bg-surface-hover transition-colors">
            Edit
          </button>
        )}
        {canCancel && (
          <button onClick={() => setShowCancel(true)} className="text-sm px-4 py-2 rounded-lg border border-danger/30 text-danger hover:bg-danger/10 transition-colors">
            Cancel Request
          </button>
        )}
        {canRepost && (
          <a href={repostUrl()} className="text-sm px-4 py-2 rounded-lg bg-accent-pop hover:bg-accent-pop-hover text-white transition-colors">
            Repost Similar
          </a>
        )}
      </div>
      <ConfirmDialog
        open={showCancel}
        title="Cancel this request?"
        message="This will close the request. Any pending quotes will be dismissed. This action cannot be undone."
        confirmLabel={cancelling ? "Cancelling..." : "Yes, cancel it"}
        danger
        onConfirm={handleCancel}
        onCancel={() => setShowCancel(false)}
      />
    </>
  );
}
