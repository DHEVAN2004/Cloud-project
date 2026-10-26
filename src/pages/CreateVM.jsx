import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowDownCircle, ArrowLeft, Check, Cloud, Cpu, Database, HardDrive, Network, Plus, Server, Shield } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useVMs } from '../context/VMContext';

const defaultForm = {
  vmName: 'Web-Server-01',
  description: 'Ubuntu web server for development',
  os: 'Ubuntu 22.04 LTS',
  template: 'Default Template',
  cpu: '2 vCPU',
  memory: '4 GB',
  disk: '50 GB',
  networkMode: 'NAT (Default)',
  portForwarding: true,
  sshKey: 'Select SSH Key',
  startOnBoot: true,
};

export default function CreateVM() {
  const navigate = useNavigate();
  const { addVM } = useVMs();
  const { pushToast } = useToast();
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const summary = useMemo(() => ({
    name: form.vmName || 'VM-Name',
    os: form.os || 'Ubuntu 22.04 LTS',
    cpu: form.cpu || '2 vCPU',
    memory: form.memory || '4 GB',
    disk: form.disk || '50 GB',
    network: form.networkMode || 'NAT (Default)',
    template: form.template || 'Default Template',
    portForwarding: form.portForwarding ? 'Enabled' : 'Disabled',
    startOnBoot: form.startOnBoot ? 'Enabled' : 'Disabled',
  }), [form]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = {};
    if (!form.vmName.trim()) nextErrors.vmName = 'VM Name is required';
    if (!form.os) nextErrors.os = 'Operating system is required';
    if (!form.cpu) nextErrors.cpu = 'CPU is required';
    if (!form.memory) nextErrors.memory = 'Memory is required';
    if (!form.disk) nextErrors.disk = 'Disk is required';

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    const nextVm = {
      name: form.vmName.trim(),
      description: form.description || 'New VM',
      status: 'Running',
      os: form.os,
      cpu: form.cpu,
      memory: form.memory,
      disk: form.disk,
      template: form.template,
      networkMode: form.networkMode,
      portForwarding: form.portForwarding,
      startOnBoot: form.startOnBoot,
      sshKey: form.sshKey,
    };

    setSubmitting(true);
    try {
      await addVM(nextVm);
      pushToast('Virtual machine created successfully', 'success');
      navigate('/virtual-machines');
    } catch (error) {
      setErrors((current) => ({ ...current, general: error.message }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-800">Create Virtual Machine</h1>
          <p className="mt-2 text-slate-500">Configure and deploy a new virtual machine in your cloud environment.</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.7fr_0.9fr]">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-3 text-xl font-bold text-slate-800">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-100 text-sm text-sky-700">1</span>
              Basic Information
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">VM Name *</label>
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <Cloud size={16} className="text-slate-400" />
                  <input value={form.vmName} onChange={(event) => updateField('vmName', event.target.value)} className="w-full border-0 bg-transparent text-sm text-slate-700 outline-none" />
                </div>
                {errors.vmName ? <p className="mt-2 text-sm text-red-500">{errors.vmName}</p> : null}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">Description</label>
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <Shield size={16} className="text-slate-400" />
                  <input value={form.description} onChange={(event) => updateField('description', event.target.value)} className="w-full border-0 bg-transparent text-sm text-slate-700 outline-none" />
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">Operating System *</label>
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <Server size={16} className="text-slate-400" />
                  <select value={form.os} onChange={(event) => updateField('os', event.target.value)} className="w-full appearance-none bg-transparent text-sm text-slate-700 outline-none">
                    <option>Ubuntu 22.04 LTS</option>
                    <option>Ubuntu 20.04 LTS</option>
                    <option>Windows Server 2019</option>
                    <option>CentOS 8</option>
                    <option>Debian 11</option>
                  </select>
                  <ArrowDownCircle size={16} className="text-slate-400" />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">VM Template</label>
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <Cloud size={16} className="text-slate-400" />
                  <select value={form.template} onChange={(event) => updateField('template', event.target.value)} className="w-full appearance-none bg-transparent text-sm text-slate-700 outline-none">
                    <option>Default Template</option>
                    <option>Web Server</option>
                    <option>Database</option>
                    <option>Development</option>
                  </select>
                  <ArrowDownCircle size={16} className="text-slate-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-3 text-xl font-bold text-slate-800">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-100 text-sm text-sky-700">2</span>
              Hardware Configuration
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">CPU Cores *</label>
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <Cpu size={16} className="text-slate-400" />
                  <select value={form.cpu} onChange={(event) => updateField('cpu', event.target.value)} className="w-full appearance-none bg-transparent text-sm text-slate-700 outline-none">
                    <option>1 vCPU</option>
                    <option>2 vCPU</option>
                    <option>4 vCPU</option>
                    <option>8 vCPU</option>
                  </select>
                  <ArrowDownCircle size={16} className="text-slate-400" />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">Memory (RAM) *</label>
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <Database size={16} className="text-slate-400" />
                  <select value={form.memory} onChange={(event) => updateField('memory', event.target.value)} className="w-full appearance-none bg-transparent text-sm text-slate-700 outline-none">
                    <option>2 GB</option>
                    <option>4 GB</option>
                    <option>8 GB</option>
                    <option>16 GB</option>
                  </select>
                  <ArrowDownCircle size={16} className="text-slate-400" />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">Disk Size *</label>
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <HardDrive size={16} className="text-slate-400" />
                  <select value={form.disk} onChange={(event) => updateField('disk', event.target.value)} className="w-full appearance-none bg-transparent text-sm text-slate-700 outline-none">
                    <option>20 GB</option>
                    <option>50 GB</option>
                    <option>100 GB</option>
                    <option>200 GB</option>
                  </select>
                  <ArrowDownCircle size={16} className="text-slate-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-3 text-xl font-bold text-slate-800">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-100 text-sm text-sky-700">3</span>
              Network Configuration
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">Network Mode *</label>
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <Network size={16} className="text-slate-400" />
                  <select value={form.networkMode} onChange={(event) => updateField('networkMode', event.target.value)} className="w-full appearance-none bg-transparent text-sm text-slate-700 outline-none">
                    <option>NAT (Default)</option>
                    <option>Bridged</option>
                    <option>Host-only</option>
                  </select>
                  <ArrowDownCircle size={16} className="text-slate-400" />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                <span className="text-sm font-medium text-slate-600">Port Forwarding</span>
                <button type="button" onClick={() => updateField('portForwarding', !form.portForwarding)} className={`relative h-7 w-12 rounded-full ${form.portForwarding ? 'bg-sky-500' : 'bg-slate-300'}`}>
                  <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${form.portForwarding ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-3 text-xl font-bold text-slate-800">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-100 text-sm text-sky-700">4</span>
                Advanced Options
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">SSH Key (Optional)</label>
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <Shield size={16} className="text-slate-400" />
                  <select value={form.sshKey} onChange={(event) => updateField('sshKey', event.target.value)} className="w-full appearance-none bg-transparent text-sm text-slate-700 outline-none">
                    <option>Select SSH Key</option>
                    <option>Default Key</option>
                    <option>Production Key</option>
                    <option>Development Key</option>
                  </select>
                  <ArrowDownCircle size={16} className="text-slate-400" />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                <span className="text-sm font-medium text-slate-600">Start on Boot</span>
                <button type="button" onClick={() => updateField('startOnBoot', !form.startOnBoot)} className={`relative h-7 w-12 rounded-full ${form.startOnBoot ? 'bg-sky-500' : 'bg-slate-300'}`}>
                  <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${form.startOnBoot ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 md:flex-row">
              <button type="button" onClick={() => navigate('/virtual-machines')} className="flex-1 rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="flex-1 rounded-xl bg-[#0d8df3] px-5 py-3 font-semibold text-white shadow-[0_10px_16px_rgba(20,104,224,0.3)] transition hover:bg-[#0b7bdd] disabled:opacity-60">
                {submitting ? 'Creating…' : 'Create VM'}
              </button>
            </div>
            {errors.general ? <p role="alert" className="mt-3 text-sm text-red-600">{errors.general}</p> : null}
          </div>
        </form>

        <aside className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-800">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                <Cloud size={18} />
              </div>
              VM Configuration Summary
            </div>

            <div className="space-y-3 text-sm">
              {[
                ['Name', summary.name],
                ['Operating System', summary.os],
                ['Template', summary.template],
                ['CPU', summary.cpu],
                ['Memory', summary.memory],
                ['Disk', summary.disk],
                ['Network', summary.network],
                ['Port Forwarding', summary.portForwarding],
                ['Start on Boot', summary.startOnBoot],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 border-b border-slate-100 pb-2 last:border-b-0 last:pb-0">
                  <span className="text-slate-500">{label}</span>
                  <span className="font-medium text-slate-700">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-800">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                <Check size={17} />
              </div>
              Estimated Resources
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[['CPU', '2 vCPU', '#2fa3ff'], ['Memory', '4 GB', '#22c55e'], ['Storage', '50 GB', '#8b5cf6']].map(([label, value, color]) => (
                <div key={label} className="rounded-xl bg-slate-50 p-3 text-center">
                  <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full border-[5px] border-slate-200" style={{ borderTopColor: color, borderRightColor: color, borderBottomColor: '#e2e8f0', borderLeftColor: '#e2e8f0' }}>
                    <span className="text-sm font-semibold text-slate-700">{value}</span>
                  </div>
                  <div className="text-xs font-medium text-slate-600">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4 text-sm text-sky-800 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-sky-700">
                <Check size={14} />
              </div>
              <div>
                Your VM will be created with the selected data center and will be accessible from the Virtual Machines page after deployment.
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
