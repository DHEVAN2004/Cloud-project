import { NavLink } from 'react-router-dom';
import {
  Activity,
  BellRing,
  Cloud,
  Gauge,
  LayoutGrid,
  Monitor,
  Network,
  Plus,
  Server,
  Settings,
  ShieldCheck,
  X,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { to: '/virtual-machines', label: 'Virtual Machines', icon: Monitor },
  { to: '/create-vm', label: 'Create VM', icon: Plus },
  { to: '/monitoring', label: 'Monitoring', icon: Activity },
  { to: '/alerts', label: 'Alerts', icon: BellRing },
  { to: '/system-resources', label: 'System Resources', icon: Server },
  { to: '/network-topology', label: 'Network Topology', icon: Network },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-slate-900/45 transition md:hidden ${isOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}
        onClick={onClose}
      />

      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 w-[295px] flex flex-col justify-between border-r border-white/10 bg-[#061d39] px-4 py-4 text-white shadow-2xl transition-transform duration-200 md:static md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        ].join(' ')}
      >
        <div className="flex items-center justify-between md:hidden">
          <div className="text-lg font-semibold">Menu</div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-white/80 hover:bg-white/5">
            <X size={18} />
          </button>
        </div>

        <div>
          <div className="mb-8 flex items-center gap-3 px-2 pt-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0f2d52] ring-1 ring-white/10">
              <Cloud className="h-6 w-6 text-[#7bc7ff]" />
            </div>
            <div>
              <div className="text-[1.8rem] font-extrabold leading-none tracking-tight">CloudVM</div>
              <div className="mt-1 text-xs font-medium tracking-wide text-sky-200/80">Manager</div>
            </div>
          </div>

          <nav className="space-y-2">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <Icon size={18} className="shrink-0" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="mt-8 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#183c68] text-sky-200">
            <ShieldCheck size={18} />
          </div>
          <div className="text-[0.64rem] leading-relaxed text-slate-200">
            <div className="font-bold text-white">Cloud-based Virtual Machine</div>
            <div className="text-slate-300">Monitoring and Management System</div>
            <div className="mt-2 text-sky-200">v1.0.0</div>
          </div>
        </div>
      </aside>
    </>
  );
}
