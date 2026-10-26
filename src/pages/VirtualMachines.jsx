import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Filter, Grid2x2, List, Plus, Search, Server, TableProperties } from 'lucide-react';
import StatCard from '../components/common/StatCard';
import VMStatusBadge from '../components/common/VMStatusBadge';
import VMActionButtons from '../components/common/VMActionButtons';
import { useVMs } from '../context/VMContext';
import { useToast } from '../context/ToastContext';

const sortOptions = ['Name A-Z', 'Name Z-A', 'Status', 'CPU'];

export default function VirtualMachines() {
  const navigate = useNavigate();
  const { vms, totals, updateVMStatus, restartVM, loading } = useVMs();
  const { pushToast } = useToast();
  const [actionError, setActionError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [osFilter, setOsFilter] = useState('All OS');
  const [sortBy, setSortBy] = useState('Name A-Z');
  const [viewMode, setViewMode] = useState('list');

  const filteredVms = useMemo(() => {
    const query = search.trim().toLowerCase();

    let next = [...vms].filter((vm) => {
      const matchesSearch =
        !query ||
        vm.name.toLowerCase().includes(query) ||
        vm.ipAddress.toLowerCase().includes(query) ||
        vm.os.toLowerCase().includes(query);

      const matchesStatus = statusFilter === 'All Status' || vm.status === statusFilter;
      const matchesOs = osFilter === 'All OS' || vm.os.includes(osFilter);

      return matchesSearch && matchesStatus && matchesOs;
    });

    if (sortBy === 'Name A-Z') next.sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === 'Name Z-A') next.sort((a, b) => b.name.localeCompare(a.name));
    if (sortBy === 'Status') next.sort((a, b) => a.status.localeCompare(b.status));
    if (sortBy === 'CPU') next.sort((a, b) => Number.parseInt(b.cpuUsage, 10) - Number.parseInt(a.cpuUsage, 10));

    return next;
  }, [vms, search, statusFilter, osFilter, sortBy]);

  const handleAction = async (action, vmId) => {
    if (action === 'view') return navigate(`/virtual-machines/${vmId}`);
    if (action === 'monitor') return navigate(`/virtual-machines/${vmId}`);
    setActionError('');
    try {
      if (action === 'start') {
        await updateVMStatus(vmId, 'Running');
        navigate(`/virtual-machines/${vmId}/console`);
      } else if (action === 'stop') {
        await updateVMStatus(vmId, 'Stopped');
        pushToast('Virtual machine stopped (simulated).', 'success');
      } else if (action === 'restart') {
        await restartVM(vmId);
        pushToast('Virtual machine restarted (simulated).', 'success');
      }
    } catch (error) {
      setActionError(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-800">Virtual Machines</h1>
          <p className="mt-2 text-slate-500">Manage and monitor all your virtual machines in one place.</p>
        </div>

        <button type="button" onClick={() => navigate('/create-vm')} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0d8df3] px-4 py-3 font-semibold text-white shadow-[0_10px_16px_rgba(20,104,224,0.3)] transition hover:bg-[#0b7bdd]">
          <Plus size={16} />
          Create New VM
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total VMs" value={totals.total} subtitle="Running: 4 | Stopped: 1 | Error: 1" accent="blue" icon={Server} />
        <StatCard title="Running" value={totals.running} subtitle="66.7% of total VMs" accent="green" icon={Server} />
        <StatCard title="Stopped" value={totals.stopped} subtitle="16.7% of total VMs" accent="orange" icon={Server} />
        <StatCard title="Error" value={totals.failed} subtitle="16.7% of total VMs" accent="red" icon={Server} />
      </div>
      {actionError ? <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{actionError}</p> : null}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <label className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 xl:max-w-[360px]">
            <Search size={16} className="text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, IP or OS..."
              className="w-full border-0 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
            />
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <Filter size={15} className="text-slate-500" />
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="bg-transparent text-sm text-slate-700 focus:outline-none">
                <option>All Status</option>
                <option>Running</option>
                <option>Stopped</option>
                <option>Error</option>
              </select>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <Server size={15} className="text-slate-500" />
              <select value={osFilter} onChange={(event) => setOsFilter(event.target.value)} className="bg-transparent text-sm text-slate-700 focus:outline-none">
                <option>All OS</option>
                <option>Ubuntu</option>
                <option>CentOS</option>
                <option>Windows</option>
                <option>Debian</option>
              </select>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <TableProperties size={15} className="text-slate-500" />
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="bg-transparent text-sm text-slate-700 focus:outline-none">
                {sortOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1">
              <button type="button" onClick={() => setViewMode('list')} className={`rounded-lg p-2 ${viewMode === 'list' ? 'bg-[#0d8df3] text-white' : 'text-slate-600'}`}>
                <List size={16} />
              </button>
              <button type="button" onClick={() => setViewMode('grid')} className={`rounded-lg p-2 ${viewMode === 'grid' ? 'bg-[#0d8df3] text-white' : 'text-slate-600'}`}>
                <Grid2x2 size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="px-3 py-3"><input type="checkbox" className="h-4 w-4 rounded border-slate-300" /></th>
                <th className="px-3 py-3 font-semibold">Name</th>
                <th className="px-3 py-3 font-semibold">Status</th>
                <th className="px-3 py-3 font-semibold">CPU</th>
                <th className="px-3 py-3 font-semibold">Memory</th>
                <th className="px-3 py-3 font-semibold">Disk</th>
                <th className="px-3 py-3 font-semibold">IP Address</th>
                <th className="px-3 py-3 font-semibold">OS</th>
                <th className="px-3 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!loading && filteredVms.length === 0 ? <tr><td colSpan="9" className="px-4 py-10 text-center text-slate-500">No virtual machines match this view. Create a VM to get started.</td></tr> : null}
              {filteredVms.map((vm) => (
                <tr key={vm.id} className="border-t border-slate-200 bg-white hover:bg-slate-50/80">
                  <td className="px-3 py-3"><input type="checkbox" className="h-4 w-4 rounded border-slate-300" /></td>
                  <td className="px-3 py-3">
                    <button type="button" onClick={() => navigate(`/virtual-machines/${vm.id}`)} className="flex items-center gap-3 font-medium text-slate-700 hover:text-sky-600">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                        <Server size={14} />
                      </div>
                      <div>
                        <div>{vm.name}</div>
                        <div className="text-xs text-slate-400">{vm.description}</div>
                      </div>
                    </button>
                  </td>
                  <td className="px-3 py-3"><VMStatusBadge status={vm.status} /></td>
                  <td className="px-3 py-3 text-slate-600">
                    <div>{vm.cpuUsage}%</div>
                    <div className="mt-1 h-2 w-24 overflow-hidden rounded-full bg-slate-200">
                      <div className="h-full rounded-full bg-sky-500" style={{ width: `${vm.cpuUsage}%` }} />
                    </div>
                  </td>
                  <td className="px-3 py-3 text-slate-600">
                    <div>{vm.memoryUsage}%</div>
                    <div className="mt-1 h-2 w-24 overflow-hidden rounded-full bg-slate-200">
                      <div className="h-full rounded-full bg-emerald-500" style={{ width: `${vm.memoryUsage}%` }} />
                    </div>
                  </td>
                  <td className="px-3 py-3 text-slate-600">
                    <div>{vm.diskUsage}%</div>
                    <div className="mt-1 h-2 w-24 overflow-hidden rounded-full bg-slate-200">
                      <div className="h-full rounded-full bg-violet-500" style={{ width: `${vm.diskUsage}%` }} />
                    </div>
                  </td>
                  <td className="px-3 py-3 text-slate-600">{vm.ipAddress}</td>
                  <td className="px-3 py-3 text-slate-600">{vm.os.split(' ')[0]}</td>
                  <td className="px-3 py-3">
                    <VMActionButtons
                      vm={vm}
                      onView={() => handleAction('view', vm.id)}
                      onMonitor={() => handleAction('monitor', vm.id)}
                      onStart={() => handleAction('start', vm.id)}
                      onStop={() => handleAction('stop', vm.id)}
                      onRestart={() => handleAction('restart', vm.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between px-2 text-sm text-slate-500">
          <span>Showing 1–{filteredVms.length} of {filteredVms.length} VMs</span>
          <div className="flex items-center gap-2">
            <button type="button" className="h-8 w-8 rounded-lg border border-slate-200 bg-white text-slate-500">‹</button>
            <button type="button" className="h-8 w-8 rounded-lg border border-sky-500 bg-sky-500 text-white">1</button>
            <button type="button" className="h-8 w-8 rounded-lg border border-slate-200 bg-white text-slate-500">›</button>
          </div>
        </div>
      </div>
    </div>
  );
}
