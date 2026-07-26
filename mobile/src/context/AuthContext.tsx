import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { MeResponse, LoginRequest, RegisterRequest, StaffLoginRequest } from '../types/api';
import { getMe, loginUser, registerUser, loginStaff } from '../api/authApi';
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
  pendingWeddingCode: string | null;
  setPendingWeddingCode: (code: string | null) => void;
  claimPendingWeddingCode: () => string | null;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [justRegistered, setJustRegistered] = useState(false);

  const pendingWeddingCodeRef = useRef<string | null>(null);
  const [pendingWeddingCode, setPendingWeddingCodeState] = useState<string | null>(null);

  const consumeJustRegistered = React.useCallback(() => {
    setJustRegistered(false);
  }, []);

  const setPendingWeddingCode = React.useCallback((code: string | null) => {
    pendingWeddingCodeRef.current = code;
    setPendingWeddingCodeState(code);
  }, []);

  const claimPendingWeddingCode = React.useCallback((): string | null => {
    const code = pendingWeddingCodeRef.current;
    if (!code) return null;
    pendingWeddingCodeRef.current = null;
    setPendingWeddingCodeState(null);
    return code;
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

  const login = async (data: LoginRequest, pendingCode?: string) => {
    try {
      if (pendingCode) {
        setPendingWeddingCode(pendingCode);
      }

      const response = await loginUser(data);
      await saveAccessToken(response.accessToken);
      
      const me = await getMe();
      if (me.role !== 'USER' && me.role !== 'ADMIN' && me.role !== 'EVENT_MANAGER') {
        await logout();
        throw new Error('Invalid account role.');
      }

      if (me.role !== 'USER') {
        setPendingWeddingCode(null);
      }

      setUser(me);
    } catch (e: any) {
      throw new Error(e.response?.data?.message || e.message || 'Login failed');
    }
  };

  const register = async (data: RegisterRequest, pendingCode?: string) => {
    try {
      if (pendingCode) {
        setPendingWeddingCode(pendingCode);
      }

      const response = await registerUser(data);
      await saveAccessToken(response.accessToken);
      setJustRegistered(true);

      const me = await getMe();
      if (me.role !== 'USER' && me.role !== 'ADMIN' && me.role !== 'EVENT_MANAGER') {
        await logout();
        throw new Error('Invalid account role.');
      }

      if (me.role !== 'USER') {
        setPendingWeddingCode(null);
      }

      setUser(me);
    } catch (e: any) {
      throw new Error(e.response?.data?.message || e.message || 'Registration failed');
    }
  };

  const staffLogin = async (data: StaffLoginRequest) => {
    try {
      setPendingWeddingCode(null);
      const response = await loginStaff(data);
      
      if (response.role === 'USER') {
        throw new Error('This account is not allowed to access the staff portal.');
      }
      
      if (response.role !== data.expectedRole) {
        throw new Error('Access denied. Role mismatch.');
      }
      
      await saveAccessToken(response.accessToken);
      await refreshMe();
    } catch (e: any) {
      await logout();
      
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
    setPendingWeddingCode(null);
    setUser(null);
  };

  const refreshMe = async () => {
    try {
      const me = await getMe();
      if (me.role !== 'USER' && me.role !== 'ADMIN' && me.role !== 'EVENT_MANAGER') {
        console.warn('Unknown role detected during session refresh:', me.role);
        await logout();
        return;
      }
      if (me.role !== 'USER') {
        setPendingWeddingCode(null);
      }
      setUser(me);
    } catch (e) {
      console.log('Get Me failed', e);
      await logout();
      throw e;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        staffLogin,
        logout,
        refreshMe,
        justRegistered,
        consumeJustRegistered,
        pendingWeddingCode,
        setPendingWeddingCode,
        claimPendingWeddingCode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
