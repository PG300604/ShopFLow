import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { api, ApiServiceError } from '../services/api';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  defaultShippingAddress?: string;
}

interface AuthResponse {
  id: number;
  name: string;
  email: string;
  role: string;
  token: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateAddress: (address: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'shopflow-token';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_KEY);
  });
  const [isLoading, setIsLoading] = useState(true);

  const saveToken = (newToken: string) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
  };

  const clearAuth = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  // On mount, if we have a stored token, fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const profile = await api.get<User>('/auth/me');
        setUser(profile);
      } catch (err) {
        // If token is expired/invalid, clear it
        if (err instanceof ApiServiceError && (err.status === 401 || err.status === 403)) {
          clearAuth();
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [token, clearAuth]);

  const login = async (email: string, password: string): Promise<void> => {
    const response = await api.post<AuthResponse>('/auth/login', { email, password });
    saveToken(response.token);
    setUser({
      id: response.id,
      name: response.name,
      email: response.email,
      role: response.role,
    });
  };

  const register = async (name: string, email: string, password: string): Promise<void> => {
    const response = await api.post<AuthResponse>('/auth/register', {
      name,
      email,
      password,
      role: 'CUSTOMER',
    });
    saveToken(response.token);
    setUser({
      id: response.id,
      name: response.name,
      email: response.email,
      role: response.role,
    });
  };

  const logout = () => {
    clearAuth();
  };

  const updateAddress = async (address: string): Promise<void> => {
    await api.put('/auth/profile/address', { defaultShippingAddress: address });
    setUser((prev) => (prev ? { ...prev, defaultShippingAddress: address } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        logout,
        updateAddress,
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
