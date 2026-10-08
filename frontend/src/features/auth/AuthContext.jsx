import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../../lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('bookstore_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('bookstore_token'));
  const [loading, setLoading] = useState(true);

  // Restore session
  useEffect(() => {
    const fetchMe = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.success) {
            setUser(res.data);
            localStorage.setItem('bookstore_user', JSON.stringify(res.data));
          }
        } catch (err) {
          logout();
        }
      }
      setLoading(false);
    };
    fetchMe();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('bookstore_token', res.data.token);
      localStorage.setItem('bookstore_user', JSON.stringify(res.data.user));
      return res.data;
    }
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('bookstore_token', res.data.token);
      localStorage.setItem('bookstore_user', JSON.stringify(res.data.user));
      return res.data;
    }
  };

  const logout = () => {
    api.post('/auth/logout').catch(() => {});
    setToken(null);
    setUser(null);
    localStorage.removeItem('bookstore_token');
    localStorage.removeItem('bookstore_user');
  };

  const refreshUser = async () => {
    if (token) {
      try {
        const res = await api.get('/auth/me');
        if (res.success) {
          setUser(res.data);
          localStorage.setItem('bookstore_user', JSON.stringify(res.data));
        }
      } catch (err) {}
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
