'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/apiClient'

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('auth');
    if (stored) {
      const { token, user } = JSON.parse(stored);
      setToken(token);
      setUser(user);
    }
  }, []);

  const saveAuth = (token, user) => {
    setToken(token);
    setUser(user);
    localStorage.setItem('auth', JSON.stringify({ token, user }));
  };

  const signUp = async (username, email, password) => {
    const data = await apiFetch('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ username, email, password })
    })
    saveAuth(data.access_token, { username, email })
    return data
  }

  const signIn = async (username, password) => {
    const data = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    })
    saveAuth(data.access_token, { username })
    return data
  }

  const signOut = () => {
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

export function useAuth() {
  return useContext(AuthContext);
}