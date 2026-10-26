import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';
import { useVMs } from '../../context/VMContext';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { loading, error, usingMockData } = useVMs();

  return (
    <div className="app-shell flex h-screen overflow-hidden bg-slate-100">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col bg-[#edf2f7]">
        <TopHeader onToggleSidebar={() => setSidebarOpen((value) => !value)} />

        <main className="custom-scroll flex-1 overflow-y-auto p-4 md:p-5 xl:p-6">
          {error ? <div role="alert" className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{error}</div> : null}
          {usingMockData ? <div className="mb-4 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">Development mock data is active. Changes are stored in this browser, not MySQL.</div> : null}
          {loading ? <div role="status" className="mb-4 text-sm text-slate-500">Loading workspace data…</div> : null}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
