import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, BellRing, Check, CircleAlert, CircleCheck, X } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useVMs } from '../context/VMContext';

function normalizeAlert(alert) {
  const severity = String(alert.severity || alert.alertType || 'INFO').toUpperCase();
  return {
    ...alert,
    id: String(alert.id ?? alert.alertId),
    type: severity === 'CRITICAL' || severity === 'ERROR' ? 'Critical' : severity === 'WARNING' ? 'Warning' : 'Info',
    title: alert.message || alert.title || 'VM alert',
    detail: alert.detail || alert.alertType || alert.description || 'Alert recorded by CloudVM Manager.',
    vmId: alert.vmId == null ? '' : String(alert.vmId),
    status: String(alert.status || 'OPEN').toUpperCase(),
  };
}

export default function Alerts() {
  const { vms } = useVMs();
  const { pushToast } = useToast();
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api.alerts()
      .then((response) => {
        if (active) setAlerts((Array.isArray(response) ? response : response.content || []).map(normalizeAlert));
      })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const visibleAlerts = useMemo(() => alerts.filter((alert) => alert.status !== 'RESOLVED' && alert.status !== 'CLOSED' && (filter === 'All' || alert.type === filter)), [alerts, filter]);

  const dismiss = async (alert) => {
    try {
      const updated = await api.updateAlert(alert.id, 'Resolved');
      setAlerts((current) => current.map((item) => item.id === alert.id ? normalizeAlert(updated || { ...item, status: 'RESOLVED' }) : item));
      pushToast('Alert resolved.', 'success');
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const dismissAll = async () => {
    try {
      const resolved = await Promise.all(visibleAlerts.map((alert) => api.updateAlert(alert.id, 'Resolved')));
      setAlerts((current) => current.map((item) => {
        const updated = resolved[visibleAlerts.findIndex((alert) => alert.id === item.id)];
        return updated ? normalizeAlert(updated) : visibleAlerts.some((alert) => alert.id === item.id) ? { ...item, status: 'RESOLVED' } : item;
      }));
      pushToast('Visible alerts resolved.', 'success');
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-rose-700"><BellRing size={16} /> EVENT CENTER</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Alerts</h1>
          <p className="mt-1 text-slate-500">Stored VM health alerts and resource threshold warnings.</p>
        </div>
        <div className="flex items-center gap-3">
          <select aria-label="Filter alerts" value={filter} onChange={(event) => setFilter(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
            <option>All</option><option>Critical</option><option>Warning</option><option>Info</option>
          </select>
          <button type="button" onClick={dismissAll} disabled={!visibleAlerts.length} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"><Check size={15} /> Resolve all</button>
        </div>
      </header>

      {error ? <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="border-l-2 border-rose-500 bg-white p-4 shadow-sm"><div className="text-sm text-slate-500">Critical</div><div className="mt-1 text-2xl font-bold text-slate-800">{alerts.filter((alert) => alert.type === 'Critical' && alert.status !== 'RESOLVED' && alert.status !== 'CLOSED').length}</div></div>
        <div className="border-l-2 border-amber-500 bg-white p-4 shadow-sm"><div className="text-sm text-slate-500">Warnings</div><div className="mt-1 text-2xl font-bold text-slate-800">{alerts.filter((alert) => alert.type === 'Warning' && alert.status !== 'RESOLVED' && alert.status !== 'CLOSED').length}</div></div>
        <div className="border-l-2 border-emerald-500 bg-white p-4 shadow-sm"><div className="text-sm text-slate-500">Healthy machines</div><div className="mt-1 text-2xl font-bold text-slate-800">{vms.filter((vm) => vm.status === 'Running').length}</div></div>
      </div>

      <section className="divide-y divide-slate-200 border-y border-slate-200 bg-white">
        {loading ? <div role="status" className="p-8 text-center text-slate-500">Loading alerts…</div> : visibleAlerts.length ? visibleAlerts.map((alert) => {
          const critical = alert.type === 'Critical';
          const Icon = critical ? CircleAlert : AlertTriangle;
          return (
            <article key={alert.id} className="flex items-start gap-4 px-4 py-5 sm:px-6">
              <Icon size={20} className={`mt-0.5 shrink-0 ${critical ? 'text-rose-600' : 'text-amber-600'}`} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold text-slate-800">{alert.title}</h2><span className={`rounded px-2 py-0.5 text-xs font-semibold ${critical ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}`}>{alert.type}</span></div>
                <p className="mt-1 text-sm text-slate-500">{alert.detail}</p>
                <p className="mt-2 text-xs font-medium text-slate-400">{alert.vmId}{alert.createdAt ? ` · ${new Date(alert.createdAt).toLocaleString()}` : ''}</p>
              </div>
              <button type="button" aria-label={`Resolve ${alert.title}`} title="Resolve alert" onClick={() => dismiss(alert)} className="rounded p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X size={17} /></button>
            </article>
          );
        }) : (
          <div className="flex flex-col items-center py-14 text-center">
            <CircleCheck size={30} className="text-emerald-600" />
            <h2 className="mt-3 font-semibold text-slate-800">All clear</h2>
            <p className="mt-1 text-sm text-slate-500">No active alerts match this filter.</p>
          </div>
        )}
      </section>
      <p className="text-xs text-slate-400">Alert status is stored in the backend. VM lifecycle states remain simulated.</p>
    </div>
  );
}
