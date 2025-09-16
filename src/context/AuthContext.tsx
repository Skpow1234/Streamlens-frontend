'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/apiClient'

interface User {
  username: string
  email?: string
}

interface AuthContextType {
  token: string | null
  user: User | null
  signUp: (username: string, email: string, password: string) => Promise<any>
  signIn: (username: string, password: string) => Promise<any>
  signOut: () => void
}

interface AuthProviderProps {
  children: ReactNode
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('auth');
    if (stored) {
      const { token, user } = JSON.parse(stored);
      setToken(token);
      setUser(user);
    }
  }, []);

  const saveAuth = (token: string, user: User) => {
    setToken(token);
    setUser(user);
    localStorage.setItem('auth', JSON.stringify({ token, user }));
  };

  const signUp = async (username: string, email: string, password: string) => {
    const data = await apiFetch('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ username, email, password })
    })
    saveAuth(data.access_token, { username, email })
    return data
  }

  const signIn = async (username: string, password: string) => {
    const data = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    })
    saveAuth(data.access_token, { username })
    return data
  }

  const signOut = (): void => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth');
    router.push('/sign-in');
  };

  return (
    <AuthContext.Provider value={{ token, user, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}