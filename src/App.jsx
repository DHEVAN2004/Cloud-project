import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { VMProvider } from './context/VMContext';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import VirtualMachines from './pages/VirtualMachines';
import VMDetails from './pages/VMDetails';
import VMConsole from './pages/VMConsole';
import CreateVM from './pages/CreateVM';
import EditVM from './pages/EditVM';
import Monitoring from './pages/Monitoring';
import Alerts from './pages/Alerts';
import SystemResources from './pages/SystemResources';
import NetworkTopology from './pages/NetworkTopology';
import Settings from './pages/Settings';
import ProtectedRoute from './routes/ProtectedRoute';
import { CheckCircle2, XCircle } from 'lucide-react';

function ToastStack() {
  const { toasts } = useToast();

  return (
    <div className="toast-stack">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast-item ${toast.type}`}>
          {toast.type === 'error' ? <XCircle size={18} color="#ef4444" /> : <CheckCircle2 size={18} color="#22c55e" />}
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/virtual-machines" element={<VirtualMachines />} />
            <Route path="/virtual-machines/:id" element={<VMDetails />} />
            <Route path="/virtual-machines/:id/edit" element={<EditVM />} />
            <Route path="/virtual-machines/:id/console" element={<VMConsole />} />
            <Route path="/create-vm" element={<CreateVM />} />
            <Route path="/monitoring" element={<Monitoring />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/system-resources" element={<SystemResources />} />
            <Route path="/network-topology" element={<NetworkTopology />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
      </Routes>
      <ToastStack />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <VMProvider>
        <ToastProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ToastProvider>
      </VMProvider>
    </AuthProvider>
  );
}
