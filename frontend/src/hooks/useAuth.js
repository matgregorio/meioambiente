import React, { createContext, useContext, useMemo, useState } from 'react';
import api, { configureClient } from '../lib/api';

const AuthContext = createContext(null);

let tokenRef = null;
configureClient(() => tokenRef);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    tokenRef = data.token;
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    tokenRef = null;
    setToken(null);
    setUser(null);
  };

  const value = useMemo(() => ({ token, user, login, logout }), [token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return context;
}
