import React, { createContext, useContext, useState, useEffect } from 'react';
import { MeResponse } from '../types/api';
import { getMe, loginUser, registerUser, loginStaff } from '../api/authApi';
import { joinWedding } from '../api/weddingsApi';
import { LoginRequest, RegisterRequest, StaffLoginRequest } from '../types/api';
import { saveAccessToken, clearAccessToken, getAccessToken } from '../storage/authStorage';

interface AuthContextData {
  user: MeResponse | null;
  loading: boolean;
  error: string | null;
  login: (data: LoginRequest, pendingWeddingCode?: string) => Promise<void>;
  register: (data: RegisterRequest, pendingWeddingCode?: string) => Promise<void>;
  staffLogin: (data: StaffLoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
  justRegistered: boolean;
  consumeJustRegistered: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [justRegistered, setJustRegistered] = useState(false);

  const consumeJustRegistered = React.useCallback(() => {
    setJustRegistered(false);
  }, []);

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

  const login = async (data: LoginRequest, pendingWeddingCode?: string) => {
    try {
      const response = await loginUser(data);
      await saveAccessToken(response.accessToken);
      
      if (pendingWeddingCode) {
        try {
          await joinWedding({ accessCode: pendingWeddingCode });
        } catch (e: any) {
          console.log('Auto-join wedding failed or already joined:', e);
        }
      }
      
      await refreshMe();
    } catch (e: any) {
      throw new Error(e.response?.data?.message || 'Login failed');
    }
  };

  const register = async (data: RegisterRequest, pendingWeddingCode?: string) => {
    try {
      const response = await registerUser(data);
      await saveAccessToken(response.accessToken);
      
      if (pendingWeddingCode) {
        try {
          await joinWedding({ accessCode: pendingWeddingCode });
        } catch (e: any) {
          console.log('Auto-join wedding failed or already joined:', e);
        }
      }
      
      setJustRegistered(true);
      await refreshMe();
    } catch (e: any) {
      throw new Error(e.response?.data?.message || 'Registration failed');
    }
  };

  const staffLogin = async (data: StaffLoginRequest) => {
    try {
      const response = await loginStaff(data);
      
      // Safety and UX check on role
      if (response.role === 'USER') {
        throw new Error('This account is not allowed to access the staff portal.');
      }
      
      if (response.role !== data.expectedRole) {
        throw new Error('Access denied. Role mismatch.');
      }
      
      await saveAccessToken(response.accessToken);
      await refreshMe();
    } catch (e: any) {
      await logout(); // Ensure no partially saved token or session remains
      
      if (e.response?.status === 403) {
        const backendMessage = e.response?.data?.message || '';
        if (backendMessage.includes('Regular users cannot use staff login')) {
          throw new Error('This account is not allowed to access the staff portal.');
        }
        if (backendMessage.includes('Role mismatch')) {
          throw new Error('Access denied. Role mismatch.');
        }
        throw new Error(backendMessage || 'Access denied.');
      }
      
      throw new Error(e.message || e.response?.data?.message || 'Staff login failed');
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
    <AuthContext.Provider value={{ user, loading, error, login, register, staffLogin, logout, refreshMe, justRegistered, consumeJustRegistered }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
