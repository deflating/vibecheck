"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Nav } from "@/components/nav";

interface Settings {
  notify_new_quotes: number;
  notify_review_completed: number;
  notify_new_messages: number;
  onboarded: number;
}

interface UserInfo {
  name: string;
  email: string;
  github_username: string;
  avatar_url: string | null;
  role: string;
  created_at: string;
}

export default function SettingsPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/settings")
      .then(r => {
        if (!r.ok) { router.push("/login"); return null; }
        return r.json();
      })
      .then(d => {
        if (d) {
          setUser(d.user);
          setSettings(d.settings);
        }
      });
  }, [router]);

  async function toggleSetting(key: keyof Settings) {
    if (!settings) return;
    setSaving(true);
    const newVal = settings[key] ? 0 : 1;
    const updated = { ...settings, [key]: newVal };
    setSettings(updated);

    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: newVal }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!user || !settings) {
    return (
      <>
        <Nav user={null} />
        <main className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-surface rounded w-1/3" />
            <div className="h-32 bg-surface rounded" />
          </div>
        </main>
      </>
    );
  }

  const toggles: { key: keyof Settings; label: string; description: string }[] = [
    { key: "notify_new_quotes", label: "New quotes", description: "When a reviewer sends a quote on your request" },
    { key: "notify_review_completed", label: "Review completed", description: "When a reviewer finishes your code review" },
    { key: "notify_new_messages", label: "New messages", description: "When you receive a new message" },
  ];

  return (
    <>
      <Nav user={user} />
      <main className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Settings</h1>
          {saved && <span className="text-sm text-success">Saved</span>}
        </div>

        {/* Account info */}
        <div className="bg-surface border border-border rounded-xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-4">Account</h2>
          <div className="flex items-center gap-4 mb-6">
            {user.avatar_url && (
              <img src={user.avatar_url} alt={user.name} className="w-16 h-16 rounded-full border border-border" />
            )}
            <div>
              <div className="font-semibold text-lg">{user.name}</div>
              <div className="text-sm text-text-muted">@{user.github_username}</div>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-border-light">
              <span className="text-text-secondary">Email</span>
              <span>{user.email || "Not set"}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border-light">
              <span className="text-text-secondary">GitHub</span>
              <span>@{user.github_username}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-text-secondary">Member since</span>
              <span>{new Date(user.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Notification preferences */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-4">Email Notifications</h2>
          <div className="space-y-1">
            {toggles.map(t => (
              <div key={t.key} className="flex items-center justify-between py-3 border-b border-border-light last:border-0">
                <div>
                  <div className="text-sm font-medium">{t.label}</div>
                  <div className="text-xs text-text-muted mt-0.5">{t.description}</div>
                </div>
                <button
                  onClick={() => toggleSetting(t.key)}
                  disabled={saving}
                  className={`relative w-11 h-6 rounded-full transition-colors ${settings[t.key] ? "bg-accent" : "bg-border"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings[t.key] ? "translate-x-5" : ""}`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
