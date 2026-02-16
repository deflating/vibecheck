import Link from "next/link";

type Crumb = { label: string; href?: string };

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-text-muted mb-6" aria-label="Breadcrumb">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          )}
          {item.href ? (
            <Link href={item.href} className="hover:text-text transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-text font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
