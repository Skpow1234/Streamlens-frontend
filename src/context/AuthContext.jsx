'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
    const res = await fetch('http://localhost:8002/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    saveAuth(data.access_token, { username, email });
    return data;
  };

  const signIn = async (username, password) => {
    const res = await fetch('http://localhost:8002/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    saveAuth(data.access_token, { username });
    return data;
  };

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