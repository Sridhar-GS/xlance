import React, { createContext, useContext, useEffect, useState } from 'react';

// Lightweight in-memory/localStorage auth stub.
// We'll replace this with Firebase integration later.

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // try to restore a cached user from localStorage
    try {
      const raw = localStorage.getItem('xlance_user');
      if (raw) {
        setUser(JSON.parse(raw));
      }
    } catch (err) {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  const persistUser = (u) => {
    try {
      if (u) localStorage.setItem('xlance_user', JSON.stringify(u));
      else localStorage.removeItem('xlance_user');
    } catch (err) {
      // ignore
    }
  };

  const signUp = async (email, password, name, role) => {
    setError(null);
    // create a lightweight local user object
    const newUser = {
      id: `local-${Date.now()}`,
      email,
      name,
      role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setUser(newUser);
    persistUser(newUser);
    // mimic async behavior
    return Promise.resolve();
  };

  const signIn = async (email, password) => {
    setError(null);
    // naive local sign-in: restore existing cached user if emails match
    try {
      const raw = localStorage.getItem('xlance_user');
      if (raw) {
        const cached = JSON.parse(raw);
        if (cached.email === email) {
          setUser(cached);
          return Promise.resolve();
        }
      }
      // if no cached user, create a dummy session
      const sessionUser = {
        id: `local-${Date.now()}`,
        email,
        name: email.split('@')[0],
        role: 'client',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setUser(sessionUser);
      persistUser(sessionUser);
      return Promise.resolve();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign in failed';
      setError(message);
      return Promise.reject(err);
    }
  };

  const signOut = async () => {
    setError(null);
    setUser(null);
    persistUser(null);
    return Promise.resolve();
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
