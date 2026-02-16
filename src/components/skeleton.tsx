export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-surface-hover rounded ${className}`} />;
}

export function CardSkeleton() {
  return (
    <div className="bg-surface border border-border rounded-xl p-5 animate-pulse">
      <div className="h-4 bg-surface-hover rounded w-1/3 mb-3" />
      <div className="h-3 bg-surface-hover rounded w-2/3 mb-2" />
      <div className="h-3 bg-surface-hover rounded w-1/2" />
    </div>
  );
}

export function StatSkeleton() {
  return (
    <div className="bg-surface border border-border rounded-xl p-4 text-center animate-pulse">
      <div className="h-7 bg-surface-hover rounded w-12 mx-auto mb-2" />
      <div className="h-3 bg-surface-hover rounded w-16 mx-auto" />
    </div>
  );
}

export function PageSkeleton({ cards = 3 }: { cards?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: cards }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
