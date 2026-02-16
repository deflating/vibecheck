"use client";

import { useState } from "react";

export function WelcomeBanner() {
  const [visible, setVisible] = useState(true);

  async function dismiss() {
    setVisible(false);
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ onboarded: true }),
    });
  }

  if (!visible) return null;

  return (
    <div className="bg-accent/5 border border-accent/20 rounded-xl p-5 mb-8 relative">
      <button
        onClick={dismiss}
        className="absolute top-3 right-3 text-text-muted hover:text-text transition-colors p-1"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
      <h2 className="font-semibold text-lg mb-1">Welcome to Vibecheck!</h2>
      <p className="text-sm text-text-secondary">
        Get expert code reviews from senior developers. Post a review request with your repo link, receive quotes from reviewers, and get actionable feedback to level up your code.
      </p>
    </div>
  );
}
