import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ArrowRight, Cpu, Database, HardDrive, Monitor, Network, Plus, SquareKanban, TrendingUp } from 'lucide-react';
import StatCard from '../components/common/StatCard';
import ResourceCard from '../components/common/ResourceCard';
import VMStatusBadge from '../components/common/VMStatusBadge';
import VMActionButtons from '../components/common/VMActionButtons';
import AlertCard from '../components/common/AlertCard';
import QuickActionCard from '../components/common/QuickActionCard';
import { useVMs } from '../context/VMContext';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { pushToast } = useToast();
  const { vms, totals, updateVMStatus, restartVM } = useVMs();
  const [serverStats, setServerStats] = useState(null);
  const [resourceValues, setResourceValues] = useState(null);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [dataError, setDataError] = useState('');
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([api.dashboardStats(), api.dashboardResources(), api.alerts()])
      .then(([stats, resources, alerts]) => {
        if (!active) return;
        setServerStats(stats);
        const readings = Array.isArray(resources) ? resources : resources.metrics || resources.resources || [];
        const average = (keys) => {
          const values = readings.map((item) => {
            if (keys.includes(item.name)) return item.percent;
            return keys.map((key) => item[key]).find((value) => value != null);
          }).map(Number).filter(Number.isFinite);
          return values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : null;
        };
        setResourceValues({
          cpu: average(['cpu', 'cpuUsagePercent', 'cpuUsage']),
          memory: average(['memory', 'memoryUsagePercent', 'memoryUsage']),
          storage: average(['storage', 'storageUsagePercent', 'diskUsagePercent', 'storageUsage', 'diskUsage']),
          network: average(['network', 'networkUsagePercent', 'networkUsage']),
        });
        setRecentAlerts((Array.isArray(alerts) ? alerts : alerts.content || [])
          .filter((alert) => (alert.status || 'OPEN').toUpperCase() !== 'RESOLVED')
          .slice(0, 5)
          .map((alert) => ({ type: (alert.severity || 'INFO').toLowerCase(), title: alert.message || alert.title, time: alert.createdAt ? new Date(alert.createdAt).toLocaleString() : '', detail: alert.detail })));
        setDataError('');
      })
      .catch((error) => {
        if (active) setDataError(error.message);
      });
    return () => { active = false; };
  }, []);

  const resourceCards = [
    { title: 'CPU Usage', value: resourceValues?.cpu ?? 0, percent: resourceValues?.cpu ?? 0, color: '#2f8af9', icon: Cpu, subtitle: 'Latest stored fleet average' },
    { title: 'Memory Usage', value: resourceValues?.memory ?? 0, percent: resourceValues?.memory ?? 0, color: '#22c55e', icon: Database, subtitle: 'Latest stored fleet average' },
    { title: 'Storage Usage', value: resourceValues?.storage ?? 0, percent: resourceValues?.storage ?? 0, color: '#8b5cf6', icon: HardDrive, subtitle: 'Latest stored fleet average' },
    { title: 'Network Usage', value: resourceValues?.network ?? 0, percent: resourceValues?.network ?? 0, color: '#38bdf8', icon: Network, subtitle: 'Latest stored fleet average' },
  ];

  const handleAction = async (action, vmId) => {
    if (!vmId) return;
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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Good Morning, {user?.name || user?.username || 'there'}!</h1>
          <p className="mt-1 text-slate-500">Here&apos;s what&apos;s happening with your cloud environment today.</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm">
          <Activity size={16} className="text-sky-500" />
          <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          <span className="text-slate-400">•</span>
          <span>{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
      {actionError ? <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{actionError}</p> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total VMs" value={serverStats?.totalVms ?? serverStats?.total ?? totals.total} subtitle="Stored virtual machines" accent="blue" icon={Monitor} />
        <StatCard title="Running" value={serverStats?.runningVms ?? serverStats?.running ?? totals.running} subtitle="Simulated status" accent="green" icon={TrendingUp} />
        <StatCard title="Stopped" value={serverStats?.stoppedVms ?? serverStats?.stopped ?? totals.stopped} subtitle="Simulated status" accent="orange" icon={Activity} />
        <StatCard title="Failed" value={serverStats?.errorVms ?? serverStats?.failed ?? totals.failed} subtitle="Requires attention" accent="red" icon={Plus} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {resourceCards.map((card) => (
              <ResourceCard key={card.title} {...card} />
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="mb-3 flex items-center justify-between px-2 pt-2">
              <div className="flex items-center gap-2 text-lg font-semibold text-slate-800">
                <Monitor size={18} className="text-sky-600" />
                Virtual Machines
              </div>
              <button type="button" onClick={() => navigate('/virtual-machines')} className="text-sm font-medium text-sky-600 hover:text-sky-700">
                View All <ArrowRight size={15} className="inline" />
              </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="min-w-full border-collapse text-left text-sm">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Name</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">CPU</th>
                    <th className="px-4 py-3 font-semibold">Memory</th>
                    <th className="px-4 py-3 font-semibold">Disk</th>
                    <th className="px-4 py-3 font-semibold">IP Address</th>
                    <th className="px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vms.map((vm) => (
                    <tr key={vm.id} className="border-t border-slate-200 bg-white hover:bg-slate-50/80">
                      <td className="px-4 py-3">
                        <button type="button" onClick={() => navigate(`/virtual-machines/${vm.id}`)} className="flex items-center gap-3 font-medium text-slate-700 hover:text-sky-600">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                            <SquareKanban size={15} />
                          </div>
                          <span>{vm.name} ({vm.description})</span>
                        </button>
                      </td>
                      <td className="px-4 py-3"><VMStatusBadge status={vm.status} /></td>
                      <td className="px-4 py-3 text-slate-600">{vm.cpuUsage}%</td>
                      <td className="px-4 py-3 text-slate-600">{vm.memoryUsage}%</td>
                      <td className="px-4 py-3 text-slate-600">{vm.diskUsage}%</td>
                      <td className="px-4 py-3 text-slate-600">{vm.ipAddress}</td>
                      <td className="px-4 py-3">
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
          </div>
        </div>

        <aside className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-lg font-semibold text-slate-800">
                <Activity size={18} className="text-sky-600" />
                System Resources
              </div>
            </div>

            <div className="space-y-4 pt-2">
              {[
                ['CPU', resourceValues?.cpu ?? 0, '#2f8af9'],
                ['Memory', resourceValues?.memory ?? 0, '#22c55e'],
                ['Storage', resourceValues?.storage ?? 0, '#8b5cf6'],
                ['Network', resourceValues?.network ?? 0, '#3bb7ff'],
              ].map(([label, value, color]) => (
                <div key={label}>
                  <div className="mb-1 flex items-center justify-between text-sm text-slate-600">
                    <span>{label}</span>
                    <span>{value}%</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-lg font-semibold text-slate-800">
                <Activity size={18} className="text-sky-600" />
                Recent Alerts
              </div>
              <button type="button" className="text-sm font-medium text-sky-600 hover:text-sky-700">
                View All →
              </button>
            </div>

            <div className="space-y-3">
              {dataError ? <p className="text-sm text-amber-700">{dataError}</p> : recentAlerts.length ? recentAlerts.map((alert) => (
                <AlertCard key={alert.title} type={alert.type} title={alert.title} time={alert.time} detail={alert.detail} />
              )) : <p className="text-sm text-slate-500">No recent alerts.</p>}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-800">
              <Activity size={18} className="text-sky-600" />
              Quick Actions
            </div>

            <div className="grid grid-cols-2 gap-3">
              <QuickActionCard title="Create VM" variant="primary" onClick={() => navigate('/create-vm')} />
              <QuickActionCard title="Start VM" variant="success" onClick={() => handleAction('start', vms[0]?.id)} />
              <QuickActionCard title="Stop VM" variant="danger" onClick={() => handleAction('stop', vms[0]?.id)} />
              <QuickActionCard title="Restart VM" variant="purple" onClick={() => handleAction('restart', vms[0]?.id)} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
