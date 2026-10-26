export default function ComingSoon({ title = 'Page' }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="text-center">
        <div className="text-5xl font-black tracking-tight text-slate-800">Coming Soon</div>
        <div className="mt-3 text-lg text-slate-500">{title} is under development.</div>
      </div>
    </div>
  );
}
