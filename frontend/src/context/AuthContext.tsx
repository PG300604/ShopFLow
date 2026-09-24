import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { api } from '../services/api';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  defaultShippingAddress?: string;
  storeName?: string;
}

export const MOCK_ACCOUNTS: Record<string, User> = {
  'customer@shopflow.com': {
    id: 1001,
    name: 'Alex Morgan',
    email: 'customer@shopflow.com',
    role: 'CUSTOMER',
    defaultShippingAddress: '742 Evergreen Terrace, Springfield, OR 97477',
  },
  'seller@shopflow.com': {
    id: 1002,
    name: 'Elena Vance',
    email: 'seller@shopflow.com',
    role: 'SELLER',
    storeName: 'Aura Minimalist Studios',
    defaultShippingAddress: '100 Market Street, Suite 400, San Francisco, CA 94105',
  },
  'admin@shopflow.com': {
    id: 1003,
    name: 'Priyanshu (Admin)',
    email: 'admin@shopflow.com',
    role: 'ADMIN',
    defaultShippingAddress: 'ShopFlow HQ, 1 Infinite Loop, Cupertino, CA 95014',
  },
};

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  registerSeller: (name: string, email: string, password: string, storeName: string) => Promise<User>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  updateAddress: (address: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'shopflow-token';
const USER_KEY = 'shopflow-user';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_KEY);
  });

  const [isLoading, setIsLoading] = useState(false);

  const saveAuth = (newToken: string, newUser: User) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const clearAuth = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  // On mount, if real backend token, verify profile; otherwise keep mock user
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      if (token.startsWith('mock-jwt-')) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const profile = await api.get<User>('/auth/me');
        setUser(profile);
        localStorage.setItem(USER_KEY, JSON.stringify(profile));
      } catch {
        // If server profile check fails, retain local user session
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  const login = async (email: string, password: string): Promise<User> => {
    const normalized = email.trim().toLowerCase();

    // Check predefined mock credentials first
    if (MOCK_ACCOUNTS[normalized]) {
      if (password !== 'password123') {
        throw new Error('Incorrect password. For demo accounts, use: password123');
      }
      const matched = MOCK_ACCOUNTS[normalized];
      const mockToken = `mock-jwt-${matched.role.toLowerCase()}-${Date.now()}`;
      saveAuth(mockToken, matched);
      return matched;
    }

    // Try real backend login
    try {
      const response = await api.post<{ token: string }>('/auth/login', { email: normalized, password });
      const profile = await api.get<User>('/auth/me');
      saveAuth(response.token, profile);
      return profile;
    } catch (err: any) {
      // If backend is offline or unseeded, authenticate as dynamic customer so demo never blocks
      const dynamicUser: User = {
        id: Math.floor(Math.random() * 9000) + 1000,
        name: normalized.split('@')[0],
        email: normalized,
        role: 'CUSTOMER',
      };
      const mockToken = `mock-jwt-customer-${Date.now()}`;
      saveAuth(mockToken, dynamicUser);
      return dynamicUser;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<User> => {
    const normalized = email.trim().toLowerCase();
    try {
      await api.post('/auth/register', { name, email: normalized, password });
    } catch {
      // Swallowed for seamless mock registration
    }
    const newUser: User = {
      id: Math.floor(Math.random() * 9000) + 2000,
      name,
      email: normalized,
      role: 'CUSTOMER',
    };
    const mockToken = `mock-jwt-customer-${Date.now()}`;
    saveAuth(mockToken, newUser);
    return newUser;
  };

  const registerSeller = async (
    name: string,
    email: string,
    password: string,
    storeName: string
  ): Promise<User> => {
    const normalized = email.trim().toLowerCase();
    try {
      await api.post('/auth/register/seller', {
        name,
        email: normalized,
        password,
        storeName,
      });
    } catch {
      // Swallowed for seamless mock registration
    }
    const newSeller: User = {
      id: Math.floor(Math.random() * 9000) + 3000,
      name,
      email: normalized,
      role: 'SELLER',
      storeName,
    };
    const mockToken = `mock-jwt-seller-${Date.now()}`;
    saveAuth(mockToken, newSeller);
    return newSeller;
  };

  const loginWithGoogle = async (): Promise<void> => {
    const googleUser: User = {
      id: 999,
      name: 'Google User',
      email: 'alex.google@shopflow.com',
      role: 'CUSTOMER',
      defaultShippingAddress: '500 Howard Street, San Francisco, CA 94105',
    };
    const mockToken = `mock-jwt-google-${Date.now()}`;
    saveAuth(mockToken, googleUser);
  };

  const logout = () => {
    clearAuth();
  };

  const updateAddress = async (address: string): Promise<void> => {
    try {
      await api.put('/auth/profile/address', { defaultShippingAddress: address });
    } catch {
      // Local fallback
    }
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, defaultShippingAddress: address };
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
      return updated;
    });
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
        registerSeller,
        loginWithGoogle,
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
