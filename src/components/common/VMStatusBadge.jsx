export default function VMStatusBadge({ status }) {
  const styles = {
    Running: 'bg-emerald-50 text-emerald-600 ring-emerald-200',
    Stopped: 'bg-amber-50 text-amber-600 ring-amber-200',
    Error: 'bg-red-50 text-red-600 ring-red-200',
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${styles[status] || 'bg-slate-100 text-slate-600 ring-slate-200'}`}>
      <span className="h-2 w-2 rounded-full bg-current" />
      {status}
    </span>
  );
}
