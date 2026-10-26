export default function ResourceCard({ title, value, total, percent, color, icon: Icon, subtitle }) {
  const ringColor = color || '#4f9ef8';

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-slate-800">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          {Icon ? <Icon size={18} /> : null}
        </div>
        <div className="text-lg font-semibold">{title}</div>
      </div>

      <div className="prog-ring" style={{ '--ring-color': ringColor, '--ring-value': percent }}>
        <div className="ring" />
        <div className="inner" />
        <div className="value">{percent}%</div>
      </div>

      <div className="mt-4 text-xs text-slate-500">{subtitle}</div>
      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full" style={{ width: `${percent}%`, background: ringColor }} />
      </div>
    </div>
  );
}
