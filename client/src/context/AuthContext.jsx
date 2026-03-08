import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('transfast_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem('transfast_token'));

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('transfast_token');
      if (savedToken) {
        try {
          const res = await authAPI.getMe();
          setUser(res.data.user);
          localStorage.setItem('transfast_user', JSON.stringify(res.data.user));
        } catch {
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token, user } = res.data;
    localStorage.setItem('transfast_token', token);
    localStorage.setItem('transfast_user', JSON.stringify(user));
    setToken(token);
    setUser(user);
    return user;
  };

  const register = async (data) => {
    const res = await authAPI.register(data);
    const { token, user } = res.data;
    localStorage.setItem('transfast_token', token);
    localStorage.setItem('transfast_user', JSON.stringify(user));
    setToken(token);
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('transfast_token');
    localStorage.removeItem('transfast_user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('transfast_user', JSON.stringify(updatedUser));
  };

  const isAdmin = user?.role === 'admin';
  const isCompliance = ['admin', 'compliance'].includes(user?.role);
  const isKYCApproved = user?.kycStatus === 'approved';

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser, isAdmin, isCompliance, isKYCApproved }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
