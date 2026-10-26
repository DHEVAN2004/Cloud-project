import { useEffect, useMemo, useState } from 'react';
import { Activity, Cpu, Database, HardDrive, Monitor, Network } from 'lucide-react';
import ResourceChart from '../components/common/ResourceChart';
import VMStatusBadge from '../components/common/VMStatusBadge';
import { useVMs } from '../context/VMContext';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function Monitoring() {
  const { vms } = useVMs();
  const { pushToast } = useToast();
  const [selectedId, setSelectedId] = useState(vms[0]?.id ?? '');
  const [metrics, setMetrics] = useState([]);
  const [metricsError, setMetricsError] = useState('');
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const selectedVm = vms.find((vm) => vm.id === selectedId) ?? vms[0];

  useEffect(() => {
    if (!selectedVm) return undefined;
    let active = true;
    setMetricsLoading(true);
    api.vmMetrics(selectedVm.id)
      .then((response) => {
        const records = Array.isArray(response) ? response : response.content || response.metrics || [];
        if (active) setMetrics(records);
      })
      .catch((error) => { if (active) setMetricsError(error.message); })
      .finally(() => { if (active) setMetricsLoading(false); });
    return () => { active = false; };
  }, [selectedVm?.id]);

  const recordSample = async () => {
    if (!selectedVm) return;
    setRecording(true);
    setMetricsError('');
    try {
      await api.recordVmMetrics(selectedVm.id, {
        cpuUsagePercent: selectedVm.cpuUsage,
        memoryUsagePercent: selectedVm.memoryUsage,
        storageUsagePercent: selectedVm.diskUsage,
        networkUsagePercent: selectedVm.networkUsage,
      });
      const response = await api.vmMetrics(selectedVm.id);
      setMetrics(Array.isArray(response) ? response : response.content || response.metrics || []);
      pushToast('Demo metrics saved.', 'success');
    } catch (error) {
      setMetricsError(error.message);
    } finally {
      setRecording(false);
    }
  };

  const charts = useMemo(() => {
    if (!selectedVm) return [];
    const records = metrics.map((record) => ({
      time: record.recordedAt ? new Date(record.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
      cpu: Number(record.cpuUsagePercent ?? record.cpuUsage ?? 0),
      memory: Number(record.memoryUsagePercent ?? record.memoryUsage ?? 0),
      disk: Number(record.storageUsagePercent ?? record.diskUsagePercent ?? record.storageUsage ?? 0),
      network: Number(record.networkUsagePercent ?? record.networkUsage ?? 0),
    }));
    return [
      { title: 'CPU utilization', value: records.at(-1)?.cpu ?? selectedVm.cpuUsage, color: '#1687c9', icon: Cpu, dataKey: 'cpu' },
      { title: 'Memory utilization', value: records.at(-1)?.memory ?? selectedVm.memoryUsage, color: '#25a56a', icon: Database, dataKey: 'memory' },
      { title: 'Disk utilization', value: records.at(-1)?.disk ?? selectedVm.diskUsage, color: '#d78b2e', icon: HardDrive, dataKey: 'disk' },
      { title: 'Network utilization', value: records.at(-1)?.network ?? selectedVm.networkUsage, color: '#c05268', icon: Network, dataKey: 'network' },
    ].map((metric) => ({ ...metric, data: records.map((record) => ({ time: record.time, usage: record[metric.dataKey] })) }));
  }, [selectedVm, metrics]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-sky-700"><Activity size={16} /> LIVE TELEMETRY</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Monitoring</h1>
          <p className="mt-1 text-slate-500">Resource utilization across your virtual machines.</p>
        </div>
        <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
          <Monitor size={17} className="text-sky-600" />
          <span className="font-medium">Machine</span>
          <select value={selectedVm?.id ?? ''} onChange={(event) => setSelectedId(event.target.value)} className="max-w-48 bg-transparent font-semibold text-slate-800 outline-none">
            {vms.map((vm) => <option key={vm.id} value={vm.id}>{vm.name} · {vm.description}</option>)}
          </select>
        </label>
        <button type="button" disabled={!selectedVm || recording} onClick={recordSample} className="rounded-xl bg-sky-700 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">{recording ? 'Saving sample…' : 'Record demo sample'}</button>
      </header>

      {!selectedVm ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">Create a virtual machine to start monitoring resources.</div>
      ) : (
        <>
          {metricsError ? <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{metricsError}</p> : null}
          {metricsLoading ? <p role="status" className="text-sm text-slate-500">Loading stored measurements…</p> : null}
          <section className="flex flex-wrap items-center justify-between gap-4 border-y border-slate-200 py-4">
            <div>
              <div className="text-xl font-semibold text-slate-800">{selectedVm.name} <span className="font-normal text-slate-500">/ {selectedVm.description}</span></div>
              <div className="mt-1 text-sm text-slate-500">{selectedVm.os} · {selectedVm.ipAddress}</div>
            </div>
            <VMStatusBadge status={selectedVm.status} />
          </section>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {charts.map(({ title, value, color, icon: Icon }) => (
              <div key={title} className="flex items-center gap-4 border-l-2 bg-white px-4 py-4 shadow-sm" style={{ borderColor: color }}>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50" style={{ color }}><Icon size={19} /></div>
                <div><div className="text-sm text-slate-500">{title}</div><div className="text-2xl font-bold text-slate-800">{value}<span className="ml-1 text-base font-medium text-slate-500">%</span></div></div>
              </div>
            ))}
          </section>
          <section className="grid gap-4 xl:grid-cols-2">
            {charts.map(({ title, color, data }) => (
              <ResourceChart key={title} title={title} color={color} data={data} dataKey="usage" unit="%" periodLabel={`${data.length} stored samples`} />
            ))}
          </section>
          {!metricsLoading && !metrics.length ? <p className="text-sm text-slate-500">No metrics have been recorded for this VM yet.</p> : null}
          <p className="text-xs text-slate-400">Charts display stored sample records; this demo does not collect telemetry from a real VM or hypervisor.</p>
        </>
      )}
    </div>
  );
}