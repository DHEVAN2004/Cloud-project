import { Eye, Gauge, MoreHorizontal, Play, Power, RotateCw } from 'lucide-react';

export default function VMActionButtons({ vm, onView, onMonitor, onStart, onStop, onRestart }) {
  const actions = [
    { label: 'View', icon: Eye, onClick: onView },
    { label: 'Monitoring', icon: Gauge, onClick: onMonitor },
    { label: vm?.status === 'Stopped' ? 'Start' : 'Stop', icon: vm?.status === 'Stopped' ? Play : Power, onClick: vm?.status === 'Stopped' ? onStart : onStop },
    { label: 'Restart', icon: RotateCw, onClick: onRestart },
  ];

  return (
    <div className="flex items-center gap-2">
      {actions.map(({ label, icon: Icon, onClick }) => (
        <button
          key={label}
          type="button"
          onClick={onClick}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-sky-200 hover:text-sky-600"
          title={label}
          aria-label={label}
        >
          <Icon size={15} />
        </button>
      ))}

      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-sky-200 hover:text-sky-600"
        aria-label="More options"
      >
        <MoreHorizontal size={15} />
      </button>
    </div>
  );
}
