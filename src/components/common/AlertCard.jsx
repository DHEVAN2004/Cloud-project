import { AlertCircle, CheckCircle, Info } from 'lucide-react';

const typeStyles = {
  info: 'text-sky-600 bg-sky-50',
  warning: 'text-amber-600 bg-amber-50',
  error: 'text-red-600 bg-red-50',
  success: 'text-emerald-600 bg-emerald-50',
};

const icons = {
  info: Info,
  warning: AlertCircle,
  error: AlertCircle,
  success: CheckCircle,
};

export default function AlertCard({ type = 'info', title, time }) {
  const Icon = icons[type] || Info;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${typeStyles[type]}`}>
        <Icon size={14} />
      </div>
      <div className="flex-1 text-sm text-slate-700">{title}</div>
      <div className="text-xs text-slate-400">{time}</div>
    </div>
  );
}
