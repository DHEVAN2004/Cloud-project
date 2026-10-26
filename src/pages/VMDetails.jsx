import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Activity, ArrowLeft, Cpu, Database, HardDrive, Network, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useVMs } from '../context/VMContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import VMStatusBadge from '../components/common/VMStatusBadge';
import ResourceChart from '../components/common/ResourceChart';
import VMDetailsCard from '../components/common/VMDetailsCard';
import ActivityTimeline from '../components/common/ActivityTimeline';
import LiveConsole from '../components/common/LiveConsole';

const tabs = ['Overview', 'Performance', 'Logs', 'Snapshots', 'Settings'];

export default function VMDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { vms, updateVMStatus, restartVM, deleteVM, loading } = useVMs();
  const { pushToast } = useToast();
  const [metricHistory, setMetricHistory] = useState([]);
  const [actionError, setActionError] = useState('');

  const vm = useMemo(() => vms.find((item) => item.id === id), [vms, id]);

  useEffect(() => {
    if (!vm) return undefined;
    let active = true;
    api.vmMetrics(vm.id)
      .then((response) => {
        const records = Array.isArray(response) ? response : response.content || response.metrics || [];
        if (active) setMetricHistory(records.map((record) => ({
          time: record.recordedAt ? new Date(record.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
          cpu: Number(record.cpuUsagePercent ?? record.cpuUsage ?? 0),
          memory: Number(record.memoryUsagePercent ?? record.memoryUsage ?? 0),
          disk: Number(record.storageUsagePercent ?? record.diskUsagePercent ?? record.storageUsage ?? 0),
          network: Number(record.networkUsagePercent ?? record.networkUsage ?? 0),
        })));
      })
      .catch((error) => { if (active) setActionError(error.message); });
    return () => { active = false; };
  }, [vm?.id]);

  const changeStatus = async (status) => {
    setActionError('');
    try {
      await updateVMStatus(vm.id, status);
      pushToast(`Virtual machine ${status.toLowerCase()}.`, 'success');
      return true;
    } catch (error) {
      setActionError(error.message);
      return false;
    }
  };

  const removeVM = async () => {
    if (!window.confirm(`Delete ${vm.name}? This removes its stored VM record.`)) return;
    try {
      await deleteVM(vm.id);
      pushToast('Virtual machine deleted.', 'success');
      navigate('/virtual-machines');
    } catch (error) {
      setActionError(error.message);
    }
  };

  if (!vm) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">{loading ? 'Loading virtual machine…' : 'Virtual machine not found.'}</div>;
  }

  const metrics = [
    { label: 'CPU Usage', value: `${vm.cpuUsage}%`, used: '32%', total: '100%', color: '#2f8af9', icon: Cpu },
    { label: 'Memory Usage', value: `${vm.memoryUsage}%`, used: '48%', total: '100%', color: '#22c55e', icon: Database },
    { label: 'Disk Usage', value: `${vm.diskUsage}%`, used: '22%', total: '100%', color: '#a855f7', icon: HardDrive },
    { label: 'Network Usage', value: `${vm.networkUsage}%`, used: '23%', total: '100%', color: '#38bdf8', icon: Network },
  ];

  const activities = [
    { title: 'VM started successfully', time: '5 min ago' },
    { title: 'CPU usage checked', time: '20 min ago' },
    { title: 'Memory usage checked', time: '42 min ago' },
    { title: 'Disk usage checked', time: '1 hour ago' },
    { title: 'Network usage checked', time: '1 hour ago' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
            <button type="button" onClick={() => navigate('/virtual-machines')} className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-700">
              <ArrowLeft size={14} /> Home
            </button>
            <span>›</span>
            <span>Virtual Machines</span>
            <span>›</span>
            <span className="font-medium text-slate-700">{vm.name} ({vm.description})</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-slate-800">{vm.name} ({vm.description})</h1>
            <VMStatusBadge status={vm.status} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {vm.status === 'Running' ? (
            <button type="button" onClick={() => navigate(`/virtual-machines/${vm.id}/console`)} className="rounded-xl bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-700">Open Console</button>
          ) : (
            <button type="button" onClick={async () => { if (await changeStatus('Running')) navigate(`/virtual-machines/${vm.id}/console`); }} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Start</button>
          )}
            <button type="button" onClick={() => changeStatus('Stopped')} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Stop</button>
            <button type="button" onClick={async () => { try { await restartVM(vm.id); pushToast('Virtual machine restarted (simulated).', 'success'); } catch (error) { setActionError(error.message); } }} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Restart</button>
            <button type="button" onClick={() => navigate(`/virtual-machines/${vm.id}/edit`)} className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"><Pencil size={14} /> Edit</button>
            <button type="button" onClick={removeVM} aria-label="Delete virtual machine" className="rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50">
              <Trash2 size={15} />
            </button>
        </div>
      </div>
      {actionError ? <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{actionError}</p> : null}

      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`rounded-xl px-4 py-2 text-sm font-medium ${tab === 'Overview' ? 'bg-sky-100 text-sky-700' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                  <metric.icon size={16} />
                </div>
                <span className="font-medium">{metric.label}</span>
              </div>
              <span className="text-lg font-bold text-slate-800">{metric.value}</span>
            </div>
            <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full" style={{ width: `${vm.cpuUsage}%`, background: metric.color }} />
            </div>
            <div className="mt-3 text-xs text-slate-500">Used: {metric.used} / {metric.total}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.5fr_0.9fr]">
        <div className="space-y-5">
          <ResourceChart title="CPU Usage" color="#2f8af9" data={metricHistory} dataKey="cpu" periodLabel={`${metricHistory.length} stored samples`} />
          <ResourceChart title="Memory Usage" color="#22c55e" data={metricHistory} dataKey="memory" periodLabel={`${metricHistory.length} stored samples`} />
          <ResourceChart title="Disk Usage" color="#8b5cf6" data={metricHistory} dataKey="disk" periodLabel={`${metricHistory.length} stored samples`} />
          <ResourceChart title="Network Usage" color="#38bdf8" data={metricHistory} dataKey="network" periodLabel={`${metricHistory.length} stored samples`} />
        </div>

        <div className="space-y-5">
          <VMDetailsCard vm={vm} />
          <ActivityTimeline activities={activities} />
          <LiveConsole />
        </div>
      </div>
    </div>
  );
}
