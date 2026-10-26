export default function StatCard({ title, value, subtitle, accent = 'blue', icon: Icon }) {
  const accentMap = {
    blue: 'bg-[#eaf5ff] text-[#0d8af3]',
    green: 'bg-[#eafaf1] text-[#2cb673]',
    orange: 'bg-[#fff4e5] text-[#f59e0b]',
    red: 'bg-[#ffeded] text-[#ef4444]',
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-slate-500">{title}</div>
          <div className="mt-3 text-3xl font-bold text-slate-800">{value}</div>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${accentMap[accent]}`}>
          {Icon ? <Icon size={22} /> : null}
        </div>
      </div>
      <div className="mt-5 text-sm text-slate-500">{subtitle}</div>
    </div>
  );
}
