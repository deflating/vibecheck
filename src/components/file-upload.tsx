"use client";

import { useRef, useState } from "react";

type Attachment = { id: number; original_name: string; size: number };

export function FileUpload({
  attachments,
  onUpload,
  requestId,
  reviewId,
}: {
  attachments: Attachment[];
  onUpload: (a: Attachment) => void;
  requestId?: number;
  reviewId?: number;
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const form = new FormData();
    form.append("file", file);
    if (requestId) form.append("request_id", String(requestId));
    if (reviewId) form.append("review_id", String(reviewId));

    const res = await fetch("/api/attachments", { method: "POST", body: form });
    if (res.ok) {
      const data = await res.json();
      onUpload(data);
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="text-sm border border-border hover:border-border-light rounded-lg px-3 py-1.5 transition-colors text-text-secondary"
        >
          {uploading ? "Uploading..." : "Attach file"}
        </button>
        <span className="text-xs text-text-muted">Max 10MB</span>
      </div>
      <input ref={inputRef} type="file" className="hidden" onChange={handleFile} />
      {attachments.length > 0 && (
        <div className="space-y-1.5">
          {attachments.map((a) => (
            <div key={a.id} className="flex items-center gap-2 text-sm">
              <span className="text-text-muted">📎</span>
              <a href={`/api/attachments/${a.id}`} className="text-accent hover:text-accent-hover truncate">
                {a.original_name}
              </a>
              <span className="text-xs text-text-muted">{formatSize(a.size)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
