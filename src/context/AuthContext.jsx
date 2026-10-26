import { createContext, useContext, useMemo, useState } from 'react';
import { api, setAccessToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.login({ email, password });
      const token = response.token || response.accessToken;
      if (!token) throw new Error('The login response did not include an access token.');
      setAccessToken(token);
      setUser(response.user || { id: response.userId, name: response.username, email: response.email, role: response.role });
      return true;
    } finally {
      setLoading(false);
    }
  };

  const register = async (account) => {
    setLoading(true);
    try {
      const response = await api.register(account);
      const token = response.token || response.accessToken;
      if (!token) throw new Error('The registration response did not include an access token.');
      setAccessToken(token);
      setUser(response.user || { id: response.userId, name: response.username, email: response.email, role: response.role });
      return true;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setAccessToken(null);
    setUser(null);
  };

  const value = useMemo(() => ({ user, login, register, logout, loading }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
