export default function DashboardLoading() {
  return (
    <div className="min-h-screen">
      <nav className="border-b border-border px-4 sm:px-6 py-4">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div className="h-5 bg-surface-hover rounded w-28 animate-pulse" />
          <div className="flex items-center gap-3">
            <div className="h-8 bg-surface-hover rounded-lg w-24 animate-pulse" />
            <div className="w-8 h-8 bg-surface-hover rounded-full animate-pulse" />
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div className="h-7 bg-surface-hover rounded w-40 animate-pulse" />
          <div className="h-9 bg-surface-hover rounded-lg w-36 animate-pulse" />
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-surface border border-border rounded-xl p-5 animate-pulse">
              <div className="flex items-center justify-between mb-3">
                <div className="h-5 bg-surface-hover rounded w-48" />
                <div className="h-5 bg-surface-hover rounded-full w-16" />
              </div>
              <div className="h-4 bg-surface-hover rounded w-2/3 mb-2" />
              <div className="h-4 bg-surface-hover rounded w-1/3" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
