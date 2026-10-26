const apiBase = import.meta.env.DEV ? import.meta.env.VITE_API_BASE_URL || '' : '';

let accessToken = null;

export function setAccessToken(token) {
  accessToken = token;
}

export async function apiRequest(path, options = {}) {
  let response;
  try {
    response = await fetch(`${apiBase}/api${path}`, {
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...options.headers,
      },
    });
  } catch (error) {
    const unavailable = new Error('The CloudVM API is unavailable. Start the Spring Boot backend and check its database connection.');
    unavailable.cause = error;
    unavailable.code = 'API_UNAVAILABLE';
    throw unavailable;
  }

  if (!response.ok) {
    const raw = await response.text();
    let body = null;
    try {
      body = raw ? JSON.parse(raw) : null;
    } catch {
      if (response.status >= 500 && /proxy error|econnrefused|connecterror/i.test(raw)) {
        const unavailable = new Error('The CloudVM API is unavailable. Start the Spring Boot backend and check its database connection.');
        unavailable.code = 'API_UNAVAILABLE';
        throw unavailable;
      }
    }
    const detail = body?.message || body?.error || `Request failed (${response.status})`;
    const error = new Error(detail);
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  login: (credentials) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: ({ username, name, ...account }) => apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ ...account, name: name || username }),
  }),
  listVms: () => apiRequest('/vms'),
  getVm: (id) => apiRequest(`/vms/${encodeURIComponent(id)}`),
  createVm: (vm) => apiRequest('/vms', { method: 'POST', body: JSON.stringify(vm) }),
  updateVm: (id, vm) => apiRequest(`/vms/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(vm) }),
  updateVmStatus: (id, status) => apiRequest(`/vms/${encodeURIComponent(id)}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  deleteVm: (id) => apiRequest(`/vms/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  dashboardStats: () => apiRequest('/dashboard/stats'),
  dashboardResources: () => apiRequest('/dashboard/resources'),
  vmMetrics: (id) => apiRequest(`/vms/${encodeURIComponent(id)}/metrics`),
  recordVmMetrics: (id, metrics) => apiRequest(`/vms/${encodeURIComponent(id)}/metrics`, { method: 'POST', body: JSON.stringify(metrics) }),
  alerts: () => apiRequest('/alerts'),
  updateAlert: (id, status) => apiRequest(`/alerts/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  networks: () => apiRequest('/networks'),
  createNetwork: (network) => apiRequest('/networks', { method: 'POST', body: JSON.stringify(network) }),
  settings: () => apiRequest('/settings'),
  updateSettings: (settings) => apiRequest('/settings', { method: 'PUT', body: JSON.stringify(settings) }),
};
