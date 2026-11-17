import { useQueryClient } from '@tanstack/react-query';
import { isPanelUser } from '@/types/panel';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '@/types';
import { api } from '@/services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logout = useCallback(async () => {
    try {
      if (api.getToken()) {
        await api.logout();
      }
    } catch {
      // Ignore network errors on logout
    } finally {
      api.clearSession();
      queryClient.clear();
      setUser(null);
    }
  }, [queryClient]);

  const refreshProfile = useCallback(async () => {
    if (!api.getToken()) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.getMe();
      if (res.success && isPanelUser(res.data)) {
        setUser(res.data);
        api.setStoredUser(res.data);
      } else {
        await logout();
      }
    } catch {
      await logout();
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    api.setUnauthorizedHandler(() => {
      queryClient.clear();
      setUser(null);
    });
    refreshProfile();
  }, [refreshProfile, queryClient]);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    setUser(null);
    queryClient.clear();
    try {
      const res = await api.login(username, password);
      if (res.success && isPanelUser(res.data?.user)) {
        setUser(res.data.user);
      } else {
        api.clearSession();
        throw new Error('Akses hanya untuk dm1 (Ketua), dm2 dan dm3 (Anggota).');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
