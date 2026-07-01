import React, { createContext, useContext, useState, useEffect } from 'react';
import { getStorage, setStorage, removeStorage } from '../utils/localStorage';

export interface User {
  nome: string;
  email: string;
  role: string;
  loggedIn: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const session = getStorage<User | null>('fiorella_session', null);
    if (session && session.loggedIn) {
      setUser(session);
    }
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    setStorage('fiorella_session', userData);
  };

  const logout = () => {
    setUser(null);
    removeStorage('fiorella_session');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
