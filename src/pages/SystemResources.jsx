import { useEffect, useMemo, useState } from 'react';
import { Cpu, Database, HardDrive, Network, Server } from 'lucide-react';
import { useVMs } from '../context/VMContext';
import { api } from '../services/api';

function average(vms, key) {
  if (!vms.length) return 0;
  return Math.round(vms.reduce((sum, vm) => sum + Number(vm[key] || 0), 0) / vms.length);
}

const resources = [
  { key: 'cpuUsage', label: 'CPU', detail: 'Processor utilization', icon: Cpu, color: '#1687c9' },
  { key: 'memoryUsage', label: 'Memory', detail: 'Memory utilization', icon: Database, color: '#25a56a' },
  { key: 'diskUsage', label: 'Storage', detail: 'Provisioned disk utilization', icon: HardDrive, color: '#d78b2e' },
  { key: 'networkUsage', label: 'Network', detail: 'Network utilization', icon: Network, color: '#c05268' },
];

export default function SystemResources() {
  const { vms } = useVMs();
  const [storedReadings, setStoredReadings] = useState(null);
  const [error, setError] = useState('');
  const runningVms = vms.filter((vm) => vm.status === 'Running');
  const readings = useMemo(() => Object.fromEntries(resources.map(({ key, label }) => [key, storedReadings?.[label] ?? average(runningVms, key)])), [runningVms, storedReadings]);

  useEffect(() => {
    let active = true;
    api.dashboardResources()
      .then((response) => {
        const records = Array.isArray(response) ? response : response.metrics || response.resources || [];
        const getAverage = (keys) => {
          const values = records.map((record) => {
            if (keys.includes(record.name)) return record.percent;
            return keys.map((key) => record[key]).find((value) => value != null);
          }).map(Number).filter(Number.isFinite);
          return values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : null;
        };
        if (active) setStoredReadings({
          CPU: getAverage(['cpu', 'cpuUsagePercent', 'cpuUsage']),
          Memory: getAverage(['memory', 'memoryUsagePercent', 'memoryUsage']),
          Storage: getAverage(['storage', 'storageUsagePercent', 'diskUsagePercent', 'storageUsage', 'diskUsage']),
          Network: getAverage(['network', 'networkUsagePercent', 'networkUsage']),
        });
      })
      .catch((requestError) => { if (active) setError(requestError.message); });
    return () => { active = false; };
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-700"><Server size={16} /> CAPACITY OVERVIEW</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">System Resources</h1>
        <p className="mt-1 text-slate-500">Fleet utilization averaged across active virtual machines.</p>
      </header>
      {error ? <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="border-l-2 border-sky-500 bg-white p-4 shadow-sm"><div className="text-sm text-slate-500">Virtual machines</div><div className="mt-1 text-2xl font-bold text-slate-800">{vms.length}</div></div>
        <div className="border-l-2 border-emerald-500 bg-white p-4 shadow-sm"><div className="text-sm text-slate-500">Active</div><div className="mt-1 text-2xl font-bold text-slate-800">{runningVms.length}</div></div>
        <div className="border-l-2 border-rose-500 bg-white p-4 shadow-sm"><div className="text-sm text-slate-500">Needs attention</div><div className="mt-1 text-2xl font-bold text-slate-800">{vms.filter((vm) => vm.status === 'Error').length}</div></div>
      </section>

      <section className="space-y-1 border-y border-slate-200 bg-white">
        {resources.map(({ key, label, detail, icon: Icon, color }) => (
          <article key={key} className="grid gap-3 border-b border-slate-100 px-4 py-5 last:border-0 sm:grid-cols-[minmax(180px,1fr)_2fr_70px] sm:items-center sm:px-6">
            <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50" style={{ color }}><Icon size={19} /></div><div><h2 className="font-semibold text-slate-800">{label}</h2><p className="text-xs text-slate-500">{detail}</p></div></div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full transition-all" style={{ width: `${readings[key]}%`, backgroundColor: color }} /></div>
            <div className="text-right text-lg font-bold text-slate-800">{readings[key]}%</div>
          </article>
        ))}
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-4 sm:px-6"><h2 className="font-semibold text-slate-800">Per-machine utilization</h2></div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3 font-semibold sm:px-6">Machine</th><th className="px-4 py-3 font-semibold">Status</th><th className="px-4 py-3 font-semibold">CPU</th><th className="px-4 py-3 font-semibold">Memory</th><th className="px-4 py-3 font-semibold">Storage</th><th className="px-4 py-3 font-semibold">Network</th></tr></thead>
            <tbody>{vms.map((vm) => <tr key={vm.id} className="border-t border-slate-100"><td className="px-4 py-3 font-medium text-slate-800 sm:px-6">{vm.name}<div className="text-xs font-normal text-slate-500">{vm.description}</div></td><td className="px-4 py-3 text-slate-600">{vm.status}</td><td className="px-4 py-3 text-slate-600">{vm.cpuUsage}%</td><td className="px-4 py-3 text-slate-600">{vm.memoryUsage}%</td><td className="px-4 py-3 text-slate-600">{vm.diskUsage}%</td><td className="px-4 py-3 text-slate-600">{vm.networkUsage}%</td></tr>)}</tbody>
          </table>
        </div>
      </section>
      <p className="text-xs text-slate-400">Fleet averages exclude stopped and error-state machines. Metrics are stored application records, not live hypervisor telemetry.</p>
    </div>
  );
}