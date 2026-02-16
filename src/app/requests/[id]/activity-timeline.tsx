interface TimelineEvent {
  label: string;
  detail?: string;
  date: string;
}

export function ActivityTimeline({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) return null;

  return (
    <div className="mt-8 print-hide">
      <h2 className="text-lg font-semibold mb-4">Activity</h2>
      <div className="relative pl-6 space-y-4">
        <div className="absolute left-[9px] top-2 bottom-2 w-px bg-border" />
        {events.map((event, i) => (
          <div key={i} className="relative flex items-start gap-3">
            <div className="absolute left-[-15px] top-1.5 w-2.5 h-2.5 rounded-full bg-accent border-2 border-surface" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium">{event.label}</div>
              {event.detail && <div className="text-xs text-text-muted">{event.detail}</div>}
            </div>
            <div className="text-xs text-text-muted whitespace-nowrap">
              {new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
