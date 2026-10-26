import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CircleHelp, Copy, ExternalLink, Power, RotateCw, Send, Server, Terminal } from 'lucide-react';
import { useVMs } from '../context/VMContext';
import VMStatusBadge from '../components/common/VMStatusBadge';

const initialLines = [
  { kind: 'system', text: 'CloudVM guest console connected.' },
  { kind: 'system', text: 'This is a simulated terminal. No commands are sent to a real VM.' },
  { kind: 'output', text: 'Type "help" to see available demo commands.' },
];

export default function VMConsole() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { vms, updateVMStatus, restartVM } = useVMs();
  const [command, setCommand] = useState('');
  const [lines, setLines] = useState(initialLines);
  const vm = vms.find((item) => item.id === id);

  if (!vm) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-8 text-center">
        <h1 className="text-xl font-semibold text-slate-800">VM not found</h1>
        <button type="button" onClick={() => navigate('/virtual-machines')} className="mt-4 text-sm font-medium text-sky-700 hover:underline">Back to virtual machines</button>
      </section>
    );
  }

  const submitCommand = (event) => {
    event.preventDefault();
    const input = command.trim();
    if (!input) return;

    const normalized = input.toLowerCase();
    const responses = {
      help: 'Available demo commands: help, clear, hostname, whoami, uptime, ip addr',
      hostname: vm.name.toLowerCase(),
      whoami: 'cloudvm-user',
      uptime: `up ${vm.uptime}`,
      'ip addr': `inet ${vm.ipAddress}`,
    };

    if (normalized === 'clear') {
      setLines([]);
    } else {
      setLines((current) => [
        ...current,
        { kind: 'command', text: input },
        { kind: 'output', text: responses[normalized] || `Command not found: ${input}. Type "help" for demo commands.` },
      ]);
    }
    setCommand('');
  };

  const isRunning = vm.status === 'Running';

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <button type="button" onClick={() => navigate(`/virtual-machines/${vm.id}`)} className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-sky-700">
            <ArrowLeft size={16} /> Back to VM details
          </button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">{vm.name} console</h1>
            <VMStatusBadge status={vm.status} />
          </div>
          <p className="mt-1 text-sm text-slate-500">{vm.description} <span className="mx-1">·</span> {vm.os}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isRunning ? (
            <>
              <button type="button" onClick={() => restartVM(vm.id)} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"><RotateCw size={15} /> Restart</button>
              <button type="button" onClick={() => updateVMStatus(vm.id, 'Stopped')} className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50"><Power size={15} /> Stop VM</button>
            </>
          ) : (
            <button type="button" onClick={() => updateVMStatus(vm.id, 'Running')} className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-800"><Power size={15} /> Start VM</button>
          )}
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
        <section className="overflow-hidden rounded-xl border border-slate-800 bg-[#111a21] shadow-sm">
          <div className="flex items-center justify-between border-b border-white/10 bg-[#19242c] px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-200"><Terminal size={16} className="text-emerald-400" /> Guest terminal</div>
            <button type="button" onClick={() => navigator.clipboard?.writeText(lines.map((line) => line.text).join('\n'))} title="Copy console output" aria-label="Copy console output" className="rounded-md p-2 text-slate-400 hover:bg-white/10 hover:text-white"><Copy size={15} /></button>
          </div>
          {isRunning ? (
            <>
              <div className="min-h-[340px] max-h-[55vh] space-y-2 overflow-auto p-5 font-mono text-[13px] leading-6" aria-live="polite">
                {lines.map((line, index) => (
                  <div key={`${index}-${line.text}`} className={line.kind === 'command' ? 'text-emerald-300' : line.kind === 'system' ? 'text-slate-500' : 'text-slate-200'}>
                    {line.kind === 'command' ? <><span className="text-sky-300">{vm.name.toLowerCase()}@cloudvm</span><span className="text-slate-500">:~$ </span>{line.text}</> : line.text}
                  </div>
                ))}
                <div className="flex items-center gap-2 text-emerald-300"><span className="text-sky-300">{vm.name.toLowerCase()}@cloudvm</span><span className="text-slate-500">:~$</span><span className="h-4 w-2 animate-pulse bg-emerald-400" /></div>
              </div>
              <form onSubmit={submitCommand} className="flex items-center gap-3 border-t border-white/10 bg-[#19242c] p-3">
                <span className="hidden font-mono text-xs text-slate-500 sm:block">DEMO</span>
                <input value={command} onChange={(event) => setCommand(event.target.value)} aria-label="Enter a demo command" placeholder="Enter a demo command..." className="min-w-0 flex-1 bg-transparent px-2 py-2 font-mono text-sm text-white outline-none placeholder:text-slate-600" />
                <button type="submit" title="Run demo command" aria-label="Run demo command" className="rounded-md bg-emerald-700 p-2 text-white hover:bg-emerald-600"><Send size={16} /></button>
              </form>
            </>
          ) : (
            <div className="flex min-h-[340px] flex-col items-center justify-center px-6 text-center">
              <Power size={28} className="text-slate-500" />
              <h2 className="mt-4 text-lg font-semibold text-white">This VM is stopped</h2>
              <p className="mt-2 max-w-sm text-sm text-slate-400">Start the VM to open its simulated guest console.</p>
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-slate-800">Machine details</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3"><dt className="text-slate-500">Operating system</dt><dd className="text-right font-medium text-slate-800">{vm.os}</dd></div>
              <div className="flex items-center justify-between"><dt className="text-slate-500">CPU</dt><dd className="font-medium text-slate-800">{vm.cpu}</dd></div>
              <div className="flex items-center justify-between"><dt className="text-slate-500">Memory</dt><dd className="font-medium text-slate-800">{vm.memory}</dd></div>
              <div className="flex items-center justify-between"><dt className="text-slate-500">IP address</dt><dd className="font-mono text-xs text-slate-800">{vm.ipAddress}</dd></div>
            </dl>
            <button type="button" onClick={() => navigate(`/virtual-machines/${vm.id}`)} className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-sky-700 hover:text-sky-900"><Server size={15} /> VM details <ExternalLink size={13} /></button>
          </section>
          <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <CircleHelp size={18} className="mt-0.5 shrink-0" />
            <p>This console is a UI demo. It does not connect to a real guest operating system.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}