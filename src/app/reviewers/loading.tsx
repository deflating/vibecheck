export default function ReviewersLoading() {
  return (
    <div className="min-h-screen">
      <nav className="border-b border-border px-4 sm:px-6 py-4">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div className="h-5 bg-surface-hover rounded w-28 animate-pulse" />
          <div className="w-8 h-8 bg-surface-hover rounded-full animate-pulse" />
        </div>
      </nav>
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        <div className="h-7 bg-surface-hover rounded w-40 animate-pulse mb-6" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-surface border border-border rounded-xl p-5 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-surface-hover rounded-full" />
                <div>
                  <div className="h-4 bg-surface-hover rounded w-24 mb-1" />
                  <div className="h-3 bg-surface-hover rounded w-16" />
                </div>
              </div>
              <div className="h-3 bg-surface-hover rounded w-full mb-2" />
              <div className="h-3 bg-surface-hover rounded w-2/3" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
