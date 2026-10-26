import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useVMs } from '../context/VMContext';

export default function EditVM() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { vms, updateVM } = useVMs();
  const { pushToast } = useToast();
  const vm = vms.find((item) => item.id === id);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (vm) {
      setForm({
        name: vm.name,
        description: vm.description || '',
        os: vm.os,
        cpu: vm.cpu,
        memory: vm.memory,
        disk: vm.disk,
        networkMode: vm.networkMode || 'NAT',
        status: vm.status,
        portForwarding: vm.portForwarding,
        startOnBoot: vm.startOnBoot,
        template: vm.template,
        sshKey: vm.sshKey,
      });
    }
  }, [vm]);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await updateVM(id, form);
      pushToast('Virtual machine updated successfully', 'success');
      navigate(`/virtual-machines/${id}`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  if (!form) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">{vm ? 'Loading VM details…' : 'Virtual machine not found.'}</div>;
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-3xl space-y-6">
      <header>
        <button type="button" onClick={() => navigate(`/virtual-machines/${id}`)} className="mb-3 inline-flex items-center gap-2 text-sm text-sky-700"><ArrowLeft size={16} /> Back to VM</button>
        <h1 className="text-3xl font-bold text-slate-800">Edit Virtual Machine</h1>
        <p className="mt-2 text-slate-500">Update the saved configuration. This does not change a real hypervisor.</p>
      </header>
      <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-2">
        {[
          ['name', 'Name'],
          ['description', 'Description'],
          ['os', 'Operating system'],
          ['cpu', 'CPU cores (e.g. 2 vCPU)'],
          ['memory', 'Memory (e.g. 4 GB)'],
          ['disk', 'Storage (e.g. 50 GB)'],
          ['networkMode', 'Network configuration'],
        ].map(([key, label]) => (
          <label key={key} className="space-y-1 text-sm font-medium text-slate-600">
            {label}
            <input required={key !== 'description'} value={form[key]} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))} className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-slate-800" />
          </label>
        ))}
      </section>
      {error ? <p role="alert" className="text-sm text-red-600">{error}</p> : null}
      <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-3 font-semibold text-white disabled:opacity-60"><Save size={16} />{saving ? 'Saving…' : 'Save changes'}</button>
    </form>
  );
}
