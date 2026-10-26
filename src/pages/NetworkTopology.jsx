import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ArrowUpRight, Circle, Cpu, HardDrive, Network, Radio, Server, Wifi } from 'lucide-react';
import { useVMs } from '../context/VMContext';
import VMStatusBadge from '../components/common/VMStatusBadge';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

const filterOptions = [
  { id: 'all', label: 'All machines' },
  { id: 'running', label: 'Running' },
  { id: 'stopped', label: 'Stopped' },
  { id: 'error', label: 'Needs attention' },
];

const isRunning = (vm) => vm.status === 'Running';
const isError = (vm) => vm.status === 'Error';

export default function NetworkTopology() {
  const navigate = useNavigate();
  const { vms, totals } = useVMs();
  const { pushToast } = useToast();
  const [filter, setFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(vms[0]?.id ?? null);
  const [networks, setNetworks] = useState([]);
  const [networkForm, setNetworkForm] = useState({ networkName: '', networkType: 'NAT', subnet: '', gateway: '', description: '' });
  const [networkError, setNetworkError] = useState('');

  useEffect(() => {
    let active = true;
    api.networks()
      .then((response) => { if (active) setNetworks(Array.isArray(response) ? response : response.content || []); })
      .catch((error) => { if (active) setNetworkError(error.message); });
    return () => { active = false; };
  }, []);

  const createNetwork = async (event) => {
    event.preventDefault();
    setNetworkError('');
    try {
      const created = await api.createNetwork(networkForm);
      setNetworks((current) => [created, ...current]);
      setNetworkForm({ networkName: '', networkType: 'NAT', subnet: '', gateway: '', description: '' });
      pushToast('Network saved successfully.', 'success');
    } catch (error) {
      setNetworkError(error.message);
    }
  };

  const visibleVms = vms.filter((vm) => {
    if (filter === 'running') return isRunning(vm);
    if (filter === 'stopped') return vm.status === 'Stopped';
    if (filter === 'error') return isError(vm);
    return true;
  });
  const selectedVm = visibleVms.find((vm) => vm.id === selectedId) ?? visibleVms[0];
  const center = { x: 500, y: 280 };
  const nodePositions = visibleVms.map((vm, index) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / Math.max(visibleVms.length, 1);
    return {
      vm,
      x: center.x + Math.cos(angle) * 350,
      y: center.y + Math.sin(angle) * 195,
    };
  });

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Lab network
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Network topology</h1>
          <p className="mt-1 text-sm text-slate-500">A live view of your virtual machines and their virtual switch.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Activity size={16} className="text-emerald-600" />
          <span>Updated just now</span>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Network summary">
        <div className="border-l-2 border-sky-500 bg-white px-4 py-3">
          <div className="text-xs font-medium text-slate-500">Virtual machines</div>
          <div className="mt-1 text-2xl font-semibold text-slate-900">{totals.total}</div>
        </div>
        <div className="border-l-2 border-emerald-500 bg-white px-4 py-3">
          <div className="text-xs font-medium text-slate-500">Connected</div>
          <div className="mt-1 text-2xl font-semibold text-slate-900">{totals.running}</div>
        </div>
        <div className="border-l-2 border-amber-500 bg-white px-4 py-3">
          <div className="text-xs font-medium text-slate-500">Stopped</div>
          <div className="mt-1 text-2xl font-semibold text-slate-900">{totals.stopped}</div>
        </div>
        <div className="border-l-2 border-rose-500 bg-white px-4 py-3">
          <div className="text-xs font-medium text-slate-500">Needs attention</div>
          <div className="mt-1 text-2xl font-semibold text-slate-900">{totals.failed}</div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)]">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="font-semibold text-slate-800">Configured networks</h2>
          {networkError ? <p role="alert" className="mt-2 text-sm text-rose-700">{networkError}</p> : null}
          {networks.length ? <ul className="mt-3 divide-y divide-slate-100">{networks.map((network) => (
            <li key={network.id ?? network.networkId ?? network.networkName} className="py-3 text-sm">
              <div className="font-medium text-slate-800">{network.networkName || network.name}</div>
              <div className="text-slate-500">{network.networkType || network.type} · {network.subnet || 'No subnet'} · Gateway {network.gateway || 'not set'}</div>
            </li>
          ))}</ul> : <p className="mt-3 text-sm text-slate-500">No networks are configured yet.</p>}
        </div>
        <form onSubmit={createNetwork} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2">
          <h2 className="font-semibold text-slate-800 sm:col-span-2">Add a network</h2>
          <input required aria-label="Network name" placeholder="Network name" value={networkForm.networkName} onChange={(event) => setNetworkForm((current) => ({ ...current, networkName: event.target.value }))} className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <select aria-label="Network type" value={networkForm.networkType} onChange={(event) => setNetworkForm((current) => ({ ...current, networkType: event.target.value }))} className="rounded-lg border border-slate-200 px-3 py-2 text-sm"><option>NAT</option><option>Bridged</option><option>Host-only</option></select>
          <input required aria-label="Subnet" placeholder="Subnet (e.g. 192.168.1.0/24)" value={networkForm.subnet} onChange={(event) => setNetworkForm((current) => ({ ...current, subnet: event.target.value }))} className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <input aria-label="Gateway" placeholder="Gateway" value={networkForm.gateway} onChange={(event) => setNetworkForm((current) => ({ ...current, gateway: event.target.value }))} className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <input aria-label="Network description" placeholder="Description" value={networkForm.description} onChange={(event) => setNetworkForm((current) => ({ ...current, description: event.target.value }))} className="rounded-lg border border-slate-200 px-3 py-2 text-sm sm:col-span-2" />
          <button type="submit" className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white sm:col-span-2">Save network</button>
        </form>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1 rounded-lg border border-slate-200 bg-white p-1" role="group" aria-label="Filter virtual machines">
          {filterOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setFilter(option.id)}
              aria-pressed={filter === option.id}
              className={`rounded-md px-3 py-2 text-sm font-medium transition ${filter === option.id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5"><Circle size={9} fill="#10b981" className="text-emerald-500" /> Running</span>
          <span className="inline-flex items-center gap-1.5"><Circle size={9} fill="#f59e0b" className="text-amber-500" /> Stopped</span>
          <span className="inline-flex items-center gap-1.5"><Circle size={9} fill="#f43f5e" className="text-rose-500" /> Error</span>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_290px]">
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-[#f8faf9]" aria-label="Interactive network map">
          <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800"><Network size={16} className="text-emerald-700" /> Virtual switch map</div>
            <span className="text-xs text-slate-500">{visibleVms.length} {visibleVms.length === 1 ? 'machine' : 'machines'} shown</span>
          </div>
          {visibleVms.length ? (
            <div className="w-full overflow-auto">
              <svg viewBox="0 0 1000 560" className="block min-w-[680px] w-full" role="img" aria-label="Virtual machines connected to a central virtual switch">
                <defs>
                  <pattern id="topology-dots" width="24" height="24" patternUnits="userSpaceOnUse">
                    <circle cx="1" cy="1" r="1" fill="#cbd5d1" />
                  </pattern>
                  <linearGradient id="topology-link" x1="0" x2="1">
                    <stop offset="0%" stopColor="#a7f3d0" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>
                <rect width="1000" height="560" fill="url(#topology-dots)" />
                <rect x="26" y="28" width="948" height="504" rx="16" fill="none" stroke="#cbd5d1" strokeDasharray="5 7" />
                <text x="46" y="54" fill="#64748b" fontSize="11" fontFamily="sans-serif" letterSpacing="1.5">CLOUDVM LAB / PRIVATE NETWORK</text>

                {nodePositions.map(({ vm, x, y }) => (
                  <g key={`${vm.id}-link`}>
                    <line x1={center.x} y1={center.y} x2={x} y2={y} stroke={isRunning(vm) ? 'url(#topology-link)' : '#cbd5e1'} strokeWidth={isRunning(vm) ? 2.5 : 1.5} strokeDasharray={isRunning(vm) ? '7 8' : '4 7'} className={isRunning(vm) ? 'topology-flow' : ''} />
                    {isRunning(vm) && <circle cx={(center.x + x) / 2} cy={(center.y + y) / 2} r="4" fill="#059669"><animate attributeName="opacity" values="0.35;1;0.35" dur="2s" repeatCount="indefinite" /></circle>}
                  </g>
                ))}

                <g>
                  <circle cx={center.x} cy={center.y} r="58" fill="#0f766e" opacity="0.08" />
                  <circle cx={center.x} cy={center.y} r="43" fill="#0f766e" />
                  <path d="M480 280h40M500 260v40M486 266l28 28M514 266l-28 28" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.85" />
                  <text x={center.x} y="342" textAnchor="middle" fill="#0f172a" fontSize="13" fontWeight="700" fontFamily="sans-serif">Virtual switch</text>
                  <text x={center.x} y="360" textAnchor="middle" fill="#64748b" fontSize="11" fontFamily="monospace">192.168.1.1</text>
                </g>

                {nodePositions.map(({ vm, x, y }) => {
                  const fill = isRunning(vm) ? '#10b981' : isError(vm) ? '#f43f5e' : '#f59e0b';
                  const selected = selectedVm?.id === vm.id;
                  return (
                    <g
                      key={vm.id}
                      role="button"
                      tabIndex="0"
                      aria-label={`${vm.name}, ${vm.status}, ${vm.ipAddress}`}
                      aria-pressed={selected}
                      onClick={() => setSelectedId(vm.id)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          setSelectedId(vm.id);
                        }
                      }}
                      className="cursor-pointer outline-none"
                    >
                      <title>{`${vm.name} · ${vm.description} · ${vm.status}`}</title>
                      <rect x={x - 85} y={y - 41} width="170" height="82" rx="10" fill="white" stroke={selected ? '#0f766e' : '#cbd5e1'} strokeWidth={selected ? 2.5 : 1.5} />
                      <rect x={x - 73} y={y - 26} width="32" height="32" rx="8" fill={isRunning(vm) ? '#ecfdf5' : isError(vm) ? '#fff1f2' : '#fffbeb'} />
                      <Server x={x - 65} y={y - 18} size={16} color={fill} />
                      <circle cx={x + 67} cy={y - 23} r="4" fill={fill} />
                      <text x={x - 33} y={y - 11} fill="#0f172a" fontSize="12" fontWeight="700" fontFamily="sans-serif">{vm.name}</text>
                      <text x={x - 33} y={y + 5} fill="#64748b" fontSize="10" fontFamily="sans-serif">{vm.description}</text>
                      <text x={x - 72} y={y + 26} fill="#64748b" fontSize="10" fontFamily="monospace">{vm.ipAddress}</text>
                    </g>
                  );
                })}
              </svg>
            </div>
          ) : (
            <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
              <Network size={28} className="text-slate-400" />
              <p className="mt-3 font-semibold text-slate-800">No machines in this view</p>
              <button type="button" onClick={() => setFilter('all')} className="mt-2 text-sm font-medium text-emerald-700 hover:underline">Show all machines</button>
            </div>
          )}
        </section>

        <aside className="rounded-xl border border-slate-200 bg-white p-5">
          {selectedVm ? (
            <>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Selected machine</div>
                  <h2 className="mt-1 text-xl font-bold text-slate-900">{selectedVm.name}</h2>
                  <p className="mt-0.5 text-sm text-slate-500">{selectedVm.description}</p>
                </div>
                <VMStatusBadge status={selectedVm.status} />
              </div>
              <div className="mt-5 border-t border-slate-100 pt-4">
                <div className="text-xs font-medium text-slate-500">Network address</div>
                <div className="mt-1 font-mono text-sm text-slate-900">{selectedVm.ipAddress}</div>
                <div className="mt-4 text-xs font-medium text-slate-500">Operating system</div>
                <div className="mt-1 text-sm text-slate-800">{selectedVm.os}</div>
              </div>
              <div className="mt-5 space-y-4 border-t border-slate-100 pt-4">
                <div>
                  <div className="mb-1.5 flex items-center justify-between text-xs"><span className="inline-flex items-center gap-1.5 text-slate-500"><Cpu size={13} /> CPU</span><span className="font-semibold text-slate-800">{selectedVm.cpuUsage}%</span></div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-sky-500" style={{ width: `${selectedVm.cpuUsage}%` }} /></div>
                </div>
                <div>
                  <div className="mb-1.5 flex items-center justify-between text-xs"><span className="inline-flex items-center gap-1.5 text-slate-500"><HardDrive size={13} /> Memory</span><span className="font-semibold text-slate-800">{selectedVm.memoryUsage}%</span></div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${selectedVm.memoryUsage}%` }} /></div>
                </div>
              </div>
              <button type="button" onClick={() => navigate(`/virtual-machines/${selectedVm.id}`)} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 py-2.5 text-sm font-semibold text-white hover:bg-slate-700">Open VM details <ArrowUpRight size={15} /></button>
            </>
          ) : (
            <div className="flex min-h-48 flex-col items-center justify-center text-center">
              <Radio size={24} className="text-slate-400" />
              <p className="mt-3 text-sm text-slate-500">Create a VM to see it on the network map.</p>
            </div>
          )}
          <div className="mt-5 flex items-start gap-2 border-t border-slate-100 pt-4 text-xs leading-relaxed text-slate-500">
            <Wifi size={14} className="mt-0.5 shrink-0 text-emerald-700" />
            The map illustrates simulated VM connectivity. Saved network configuration is shown above; no real networking is provisioned.
          </div>
        </aside>
      </div>
    </div>
  );
}