import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('docusense_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const token = localStorage.getItem('docusense_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          setUser(res.data.user);
          localStorage.setItem('docusense_user', JSON.stringify(res.data.user));
        }
      } catch (err) {
        localStorage.removeItem('docusense_token');
        localStorage.removeItem('docusense_user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      setUser(res.data.user);
      localStorage.setItem('docusense_token', res.data.token);
      localStorage.setItem('docusense_user', JSON.stringify(res.data.user));
      return res.data;
    }
  };

  const register = async (fullName, email, password, confirmPassword) => {
    const res = await api.post('/auth/register', {
      fullName,
      email,
      password,
      confirmPassword,
    });
    if (res.data.success) {
      setUser(res.data.user);
      localStorage.setItem('docusense_token', res.data.token);
      localStorage.setItem('docusense_user', JSON.stringify(res.data.user));
      return res.data;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('docusense_token');
      localStorage.removeItem('docusense_user');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
