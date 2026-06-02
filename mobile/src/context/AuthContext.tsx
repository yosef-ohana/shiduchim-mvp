import React, { createContext, useContext, useState, useEffect } from 'react';
import { MeResponse } from '../types/api';
import { getMe, loginUser, registerUser } from '../api/authApi';
import { LoginRequest, RegisterRequest } from '../types/api';
import { saveAccessToken, clearAccessToken, getAccessToken } from '../storage/authStorage';

interface AuthContextData {
  user: MeResponse | null;
  loading: boolean;
  error: string | null;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    bootstrapAuth();
  }, []);

  const bootstrapAuth = async () => {
    setLoading(true);
    try {
      const token = await getAccessToken();
      if (token) {
        await refreshMe();
      }
    } catch (e) {
      console.log('Bootstrap auth failed', e);
      await logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (data: LoginRequest) => {
    try {
      const response = await loginUser(data);
      await saveAccessToken(response.accessToken);
      await refreshMe();
    } catch (e: any) {
      throw new Error(e.response?.data?.message || 'Login failed');
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      const response = await registerUser(data);
      await saveAccessToken(response.accessToken);
      await refreshMe();
    } catch (e: any) {
      throw new Error(e.response?.data?.message || 'Registration failed');
    }
  };

  const logout = async () => {
    await clearAccessToken();
    setUser(null);
  };

  const refreshMe = async () => {
    try {
      const me = await getMe();
      setUser(me);
    } catch (e) {
      console.log('Get Me failed', e);
      await logout();
      throw e;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, refreshMe }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
