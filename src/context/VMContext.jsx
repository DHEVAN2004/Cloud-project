import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { defaultVMs } from '../data/mockVMs';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const VMContext = createContext(null);
const VM_STORAGE_KEY = 'cloudvm-vms';
const mockFallbackEnabled = import.meta.env.DEV && import.meta.env.VITE_ENABLE_MOCK_FALLBACK === 'true';

function toUiVm(vm) {
  const status = String(vm.status || 'Stopped').toLowerCase();
  return {
    ...vm,
    id: String(vm.id ?? vm.vmId),
    description: vm.description || vm.name,
    os: vm.os || vm.operatingSystem || 'Unknown',
    cpu: vm.cpu || `${vm.cpuCores ?? 1} vCPU`,
    memory: vm.memory || `${vm.memoryGb ?? 1} GB`,
    disk: vm.disk || `${vm.storageGb ?? 1} GB`,
    ipAddress: vm.ipAddress || '',
    networkMode: vm.networkMode || vm.networkConfig || '',
    status: status === 'running' ? 'Running' : status === 'error' || status === 'failed' ? 'Error' : 'Stopped',
    cpuUsage: Number(vm.cpuUsage ?? vm.latestMetrics?.cpuUsagePercent ?? 0),
    memoryUsage: Number(vm.memoryUsage ?? vm.latestMetrics?.memoryUsagePercent ?? 0),
    diskUsage: Number(vm.diskUsage ?? vm.latestMetrics?.storageUsagePercent ?? 0),
    networkUsage: Number(vm.networkUsage ?? 0),
  };
}

function toApiVm(vm) {
  const value = (field) => Number.parseInt(String(vm[field] || '').match(/\d+/)?.[0] || '0', 10);
  const networkConfig = vm.networkConfig || vm.networkMode || 'NAT';
  return {
    name: vm.name,
    description: vm.description,
    operatingSystem: vm.os,
    cpuCores: value('cpu'),
    memoryGb: value('memory'),
    storageGb: value('disk'),
    ipAddress: vm.ipAddress || null,
    networkConfig: networkConfig === 'NAT (Default)' ? 'NAT' : networkConfig,
    portForwarding: Boolean(vm.portForwarding),
    startOnBoot: Boolean(vm.startOnBoot),
    template: vm.template || 'Default Template',
    sshKey: vm.sshKey || null,
    status: vm.status || 'Running',
  };
}

export function VMProvider({ children }) {
  const { user } = useAuth();
  const [vms, setVms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [usingMockData, setUsingMockData] = useState(false);

  useEffect(() => {
    if (!user) {
      setVms([]);
      setLoading(false);
      setError('');
      setUsingMockData(false);
      return undefined;
    }
    let active = true;
    setLoading(true);
    api.listVms()
      .then((items) => {
        if (!active) return;
        setVms((Array.isArray(items) ? items : items.content || []).map(toUiVm));
        setUsingMockData(false);
        setError('');
      })
      .catch((requestError) => {
        if (!active) return;
        if (mockFallbackEnabled && requestError.code === 'API_UNAVAILABLE') {
          try {
            const saved = localStorage.getItem(VM_STORAGE_KEY);
            setVms((saved ? JSON.parse(saved) : defaultVMs).map(toUiVm));
          } catch {
            setVms(defaultVMs.map(toUiVm));
          }
          setUsingMockData(true);
          setError('');
        } else {
          setError(requestError.message);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [user]);

  const persistFallback = useCallback((next) => {
    if (usingMockData) localStorage.setItem(VM_STORAGE_KEY, JSON.stringify(next));
    return next;
  }, [usingMockData]);

  const addVM = useCallback(async (newVm) => {
    if (usingMockData) {
      const next = [toUiVm(newVm), ...vms];
      persistFallback(next);
      setVms(next);
      return next[0];
    }
    const created = toUiVm(await api.createVm(toApiVm(newVm)));
    setVms((current) => [created, ...current]);
    return created;
  }, [persistFallback, usingMockData, vms]);

  const updateVM = useCallback(async (id, changes) => {
    if (usingMockData) {
      const next = vms.map((vm) => vm.id === String(id) ? toUiVm({ ...vm, ...changes }) : vm);
      persistFallback(next);
      setVms(next);
      return next.find((vm) => vm.id === String(id));
    }
    const response = await api.updateVm(id, toApiVm(changes));
    const updated = toUiVm(response || { ...vms.find((vm) => vm.id === String(id)), ...changes });
    setVms((current) => current.map((vm) => vm.id === String(id) ? updated : vm));
    return updated;
  }, [persistFallback, usingMockData, vms]);

  const deleteVM = useCallback(async (id) => {
    if (usingMockData) {
      const next = vms.filter((vm) => vm.id !== String(id));
      persistFallback(next);
      setVms(next);
      return;
    }
    await api.deleteVm(id);
    setVms((current) => current.filter((vm) => vm.id !== String(id)));
  }, [persistFallback, usingMockData, vms]);

  const updateVMStatus = useCallback(async (id, status) => {
    if (usingMockData) {
      const next = vms.map((vm) => vm.id === String(id) ? { ...vm, status } : vm);
      persistFallback(next);
      setVms(next);
      return;
    }
    const response = await api.updateVmStatus(id, status);
    const updated = toUiVm(response || { ...vms.find((vm) => vm.id === String(id)), status });
    setVms((current) => current.map((vm) => vm.id === String(id) ? updated : vm));
  }, [persistFallback, usingMockData, vms]);

  const restartVM = useCallback((id) => updateVMStatus(id, 'Running'), [updateVMStatus]);

  const totals = useMemo(() => {
    const total = vms.length;
    const running = vms.filter((vm) => vm.status === 'Running').length;
    const stopped = vms.filter((vm) => vm.status === 'Stopped').length;
    const failed = vms.filter((vm) => vm.status === 'Error').length;

    return { total, running, stopped, failed };
  }, [vms]);

  const value = useMemo(
    () => ({ vms, setVms, addVM, updateVM, deleteVM, updateVMStatus, restartVM, totals, loading, error, usingMockData }),
    [vms, addVM, updateVM, deleteVM, updateVMStatus, restartVM, totals, loading, error, usingMockData],
  );

  return <VMContext.Provider value={value}>{children}</VMContext.Provider>;
}

export function useVMs() {
  const context = useContext(VMContext);
  if (!context) {
    throw new Error('useVMs must be used within VMProvider');
  }

  return context;
}
