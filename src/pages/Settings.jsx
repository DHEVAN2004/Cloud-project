import { useEffect, useState } from 'react';
import { Bell, Check, Globe2, Settings as SettingsIcon, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

const defaults = { region: 'us-east', refreshInterval: '60', emailAlerts: true, criticalOnly: false, maintenanceNotices: true };

function normalizeSettings(response) {
  if (!Array.isArray(response)) return { ...defaults, ...(response || {}) };
  const values = Object.fromEntries(response.map((item) => [item.settingKey || item.key, item.settingValue ?? item.value]));
  return {
    ...defaults,
    ...values,
    refreshInterval: String(values.refreshInterval ?? defaults.refreshInterval),
    emailAlerts: values.emailAlerts === true || values.emailAlerts === 'true',
    criticalOnly: values.criticalOnly === true || values.criticalOnly === 'true',
    maintenanceNotices: values.maintenanceNotices === true || values.maintenanceNotices === 'true',
  };
}

export default function Settings() {
  const { user } = useAuth();
  const { pushToast } = useToast();
  const [settings, setSettings] = useState(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api.settings()
      .then((response) => { if (active) setSettings(normalizeSettings(response)); })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const update = (key, value) => setSettings((current) => ({ ...current, [key]: value }));
  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const response = await api.updateSettings(settings);
      setSettings(normalizeSettings(response || settings));
      pushToast('Settings saved successfully.', 'success');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-sky-700"><SettingsIcon size={16} /> WORKSPACE</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Settings</h1>
          <p className="mt-1 text-slate-500">Manage your workspace preferences and alert delivery.</p>
        </div>
        <button type="submit" disabled={saving || loading} className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-800 disabled:opacity-60"><Check size={16} /> {saving ? 'Saving…' : 'Save changes'}</button>
      </header>
      {error ? <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
      {loading ? <p role="status" className="text-sm text-slate-500">Loading settings…</p> : null}

      <section className="border-y border-slate-200 bg-white">
        <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-4 sm:px-6"><UserRound size={18} className="text-sky-700" /><div><h2 className="font-semibold text-slate-800">Account</h2><p className="text-sm text-slate-500">Signed-in workspace user</p></div></div>
        <div className="grid gap-4 px-4 py-5 sm:grid-cols-2 sm:px-6">
          <label className="space-y-1.5 text-sm font-medium text-slate-600">Name<input readOnly value={user?.name ?? 'Admin'} className="block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-700" /></label>
          <label className="space-y-1.5 text-sm font-medium text-slate-600">Email<input readOnly value={user?.email ?? ''} className="block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-700" /></label>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-4 sm:px-6"><Globe2 size={18} className="text-sky-700" /><div><h2 className="font-semibold text-slate-800">Environment</h2><p className="text-sm text-slate-500">Default region and dashboard refresh behavior</p></div></div>
        <div className="grid gap-4 px-4 py-5 sm:grid-cols-2 sm:px-6">
          <label className="space-y-1.5 text-sm font-medium text-slate-600">Default region<select value={settings.region} onChange={(event) => update('region', event.target.value)} className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-slate-700"><option value="us-east">US East</option><option value="us-west">US West</option><option value="eu-west">Europe West</option><option value="ap-southeast">Asia Pacific Southeast</option></select></label>
          <label className="space-y-1.5 text-sm font-medium text-slate-600">Refresh interval<select value={settings.refreshInterval} onChange={(event) => update('refreshInterval', event.target.value)} className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-slate-700"><option value="30">30 seconds</option><option value="60">1 minute</option><option value="300">5 minutes</option><option value="0">Manual</option></select></label>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-4 sm:px-6"><Bell size={18} className="text-sky-700" /><div><h2 className="font-semibold text-slate-800">Notifications</h2><p className="text-sm text-slate-500">Choose which workspace events to receive</p></div></div>
        <div className="divide-y divide-slate-100 px-4 sm:px-6">
          {[
            ['emailAlerts', 'Email alert notifications', 'Receive a notification when a VM needs attention.'],
            ['criticalOnly', 'Critical alerts only', 'Suppress warning-level utilization notifications.'],
            ['maintenanceNotices', 'Maintenance notices', 'Receive notices about planned workspace maintenance.'],
          ].map(([key, label, detail]) => (
            <label key={key} className="flex cursor-pointer items-center justify-between gap-4 py-4">
              <span><span className="block text-sm font-medium text-slate-700">{label}</span><span className="mt-0.5 block text-sm text-slate-500">{detail}</span></span>
              <input type="checkbox" checked={settings[key]} onChange={(event) => update(key, event.target.checked)} className="h-4 w-4 shrink-0 accent-sky-700" />
            </label>
          ))}
        </div>
      </section>
      <p className="text-xs text-slate-400">Preferences are stored by the application. Region and notification options do not configure a cloud provider.</p>
    </form>
  );
}