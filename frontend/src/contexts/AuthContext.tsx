import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/services/api';

interface User {
  _id: string;
  roll?: string;
  name?: string;
  department?: string;
  email: string;
  role: string;
  token?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (roll: string, name: string, department: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isUser: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUser, setIsUser] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const { data } = await api.get('/auth/me');
          setUser(data);
          setIsAdmin(data.role === 'admin');
          setIsUser(data.role === 'user');
        } catch (error) {
          console.error('Auth check failed', error);
          localStorage.removeItem('token');
          setUser(null);
          setIsAdmin(false);
          setIsUser(false);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    setUser(data);
    setIsAdmin(data.role === 'admin');
    setIsUser(data.role === 'user');
  };

  const register = async (roll: string, name: string, department: string, email: string, password: string) => {
    const { data } = await api.post('/auth/register', { roll, name, department, email, password });
    localStorage.setItem('token', data.token);
    setUser(data);
    setIsAdmin(data.role === 'admin');
    setIsUser(data.role === 'user');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAdmin(false);
    setIsUser(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin, isUser }}>
      {children}
    </AuthContext.Provider>
  );
};
