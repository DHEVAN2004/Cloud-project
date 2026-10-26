import { Bell, LogOut, Menu, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function TopHeader({ onToggleSidebar }) {
  const { user, logout } = useAuth();

  return (
    <header className="flex h-[84px] items-center justify-between border-b border-slate-200 bg-[#f5f7fb] px-4 md:px-5 xl:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm md:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu size={18} />
        </button>

        <div className="hide-on-mobile flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm text-slate-700 md:hidden">
          <Menu size={18} />
        </div>

        <label className="flex w-[420px] max-w-[50vw] items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm md:w-[500px]">
          <Search size={18} className="text-slate-400" />
          <input
            type="search"
            placeholder="Search VMs, IPs, or anything..."
            className="w-full border-0 bg-transparent text-sm text-slate-600 placeholder:text-slate-400 focus:outline-none"
          />
        </label>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm ring-1 ring-slate-200">
            <Bell size={18} />
          </button>
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            3
          </span>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-2 py-1.5 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0a7ae2] text-sm font-semibold text-white">
            {(user?.name || user?.email || 'U').slice(0, 1).toUpperCase()}
          </div>
          <div className="mr-1 text-left leading-tight">
            <div className="text-sm font-semibold text-slate-700">{user?.name || user?.username || 'User'}</div>
            <div className="text-[11px] text-slate-500">{user?.email || ''}</div>
          </div>
        </div>
        <button type="button" onClick={logout} aria-label="Sign out" title="Sign out" className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"><LogOut size={17} /></button>
      </div>
    </header>
  );
}
