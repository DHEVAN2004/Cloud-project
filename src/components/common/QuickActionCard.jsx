import { AlertCircle, Plus, Power, RotateCw } from 'lucide-react';

export default function QuickActionCard({ title, onClick, variant = 'primary' }) {
  const styles = {
    primary: 'bg-[#0c8fe7] text-white',
    success: 'bg-[#1fb365] text-white',
    danger: 'bg-[#ef4444] text-white',
    purple: 'bg-[#7c5cf5] text-white',
  };

  const icons = {
    primary: Plus,
    success: Power,
    danger: AlertCircle,
    purple: RotateCw,
  };

  const Icon = icons[variant] || Plus;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-[110px] flex-col items-center justify-center gap-3 rounded-2xl shadow-sm transition hover:brightness-105 ${styles[variant]}`}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15">
        <Icon size={24} />
      </div>
      <span className="text-lg font-semibold">{title}</span>
    </button>
  );
}
