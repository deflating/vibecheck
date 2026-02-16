import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <svg width="200" height="160" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-8">
        <rect x="40" y="20" width="120" height="90" rx="8" stroke="var(--color-border-light)" strokeWidth="2" fill="var(--color-surface)" />
        <rect x="55" y="40" width="90" height="8" rx="4" fill="var(--color-surface-hover)" />
        <rect x="55" y="56" width="60" height="8" rx="4" fill="var(--color-surface-hover)" />
        <rect x="55" y="72" width="75" height="8" rx="4" fill="var(--color-surface-hover)" />
        <circle cx="100" cy="130" r="20" fill="var(--color-accent)" opacity="0.1" />
        <text x="100" y="137" textAnchor="middle" fontSize="20" fill="var(--color-accent)">~</text>
        <line x1="30" y1="55" x2="10" y2="45" stroke="var(--color-accent-pop)" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
        <line x1="170" y1="55" x2="190" y2="45" stroke="var(--color-accent-pop)" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
        <line x1="25" y1="75" x2="8" y2="80" stroke="var(--color-accent-pop)" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
        <line x1="175" y1="75" x2="192" y2="80" stroke="var(--color-accent-pop)" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
      </svg>

      <h1 className="text-3xl font-bold mb-2">404</h1>
      <p className="text-lg text-text-secondary mb-1">This page got vibechecked into oblivion</p>
      <p className="text-sm text-text-muted mb-8">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>

      <div className="flex gap-3">
        <Link href="/" className="bg-accent-pop hover:bg-accent-pop-hover text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">
          Go Home
        </Link>
        <Link href="/dashboard" className="border border-border hover:border-border-light px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">
          Dashboard
        </Link>
      </div>
    </div>
  );
}
