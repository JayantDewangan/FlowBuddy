import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    // Check if user is already logged in
    authAPI.me()
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem('token');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (credentials) => {
    const res = await authAPI.login(credentials);
    const { token, ...userData } = res.data;
    localStorage.setItem('token', token);
    setUser(userData);
    return res.data;
  };

  const register = async (data) => {
    const res = await authAPI.register(data);
    const { token, ...userData } = res.data;
    localStorage.setItem('token', token);
    setUser(userData);
    return res.data;
  };

  const requestOtp = async (data) => {
    const res = await authAPI.requestOtp(data);
    return res.data;
  };

  const verifyOtp = async (data) => {
    const res = await authAPI.verifyOtp(data);
    if (!res.data.isNewUser) {
      const { token, ...userData } = res.data;
      localStorage.setItem('token', token);
      setUser(userData);
    }
    return res.data;
  };

  const googleLogin = async (data) => {
    const res = await authAPI.google(data);
    const { token, ...userData } = res.data;
    localStorage.setItem('token', token);
    setUser(userData);
    return res.data;
  };

  const registerViewer = async (data) => {
    const res = await authAPI.registerViewer(data);
    const { token, ...userData } = res.data;
    localStorage.setItem('token', token);
    setUser(userData);
    return res.data;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, registerViewer, logout, setUser, requestOtp, verifyOtp, googleLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
