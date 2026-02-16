export default function RequestDetailLoading() {
  return (
    <div className="min-h-screen">
      <nav className="border-b border-border px-4 sm:px-6 py-4">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div className="h-5 bg-surface-hover rounded w-28 animate-pulse" />
          <div className="w-8 h-8 bg-surface-hover rounded-full animate-pulse" />
        </div>
      </nav>
      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
        <div className="h-4 bg-surface-hover rounded w-32 animate-pulse mb-6" />
        <div className="mb-8 animate-pulse">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-7 bg-surface-hover rounded w-64" />
            <div className="h-5 bg-surface-hover rounded-full w-20" />
          </div>
          <div className="h-4 bg-surface-hover rounded w-full mb-2" />
          <div className="h-4 bg-surface-hover rounded w-3/4 mb-4" />
          <div className="h-4 bg-surface-hover rounded w-48" />
        </div>
        <div className="bg-surface border border-border rounded-xl p-5 mb-6 animate-pulse">
          <div className="h-5 bg-surface-hover rounded w-40 mb-4" />
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 bg-surface-hover rounded" />
            ))}
          </div>
        </div>
        <div className="border border-border rounded-xl overflow-hidden animate-pulse">
          <div className="px-4 py-3 border-b border-border bg-surface">
            <div className="h-4 bg-surface-hover rounded w-20" />
          </div>
          <div className="h-64 bg-surface-hover" />
        </div>
      </main>
    </div>
  );
}
