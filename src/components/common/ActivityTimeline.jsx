export default function ActivityTimeline({ activities = [] }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 text-lg font-semibold text-slate-800">Recent Activity</div>
      <div className="space-y-4">
        {activities.map((item, index) => (
          <div key={index} className="flex gap-3">
            <div className="relative flex flex-col items-center">
              <div className="h-3 w-3 rounded-full bg-sky-500" />
              {index !== activities.length - 1 ? <div className="mt-1 h-full w-px bg-slate-200" /> : null}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-slate-700">{item.title}</div>
              <div className="text-xs text-slate-400">{item.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
