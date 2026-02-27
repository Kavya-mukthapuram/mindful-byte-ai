import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  archetype?: string;
  disciplineScore: number;
  onboardingComplete: boolean;
  profile?: {
    age: number;
    gender: string;
    goals: string[];
    dietary: string[];
    stressLevel: number;
    sleepHours: number;
    nudgeStyle: string;
  };
  joinDate: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('mindbite_user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setIsLoading(false);
  }, []);

  const persist = (u: User) => {
    localStorage.setItem('mindbite_user', JSON.stringify(u));
    setUser(u);
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    const stored = localStorage.getItem(`mindbite_account_${email}`);
    if (stored) {
      const account = JSON.parse(stored);
      if (account.password === password) {
        persist(account.user);
        setIsLoading(false);
        return true;
      }
    }
    setIsLoading(false);
    return false;
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    const newUser: User = {
      id: `user_${Date.now()}`,
      name,
      email,
      disciplineScore: 50,
      onboardingComplete: false,
      joinDate: new Date().toISOString(),
    };
    localStorage.setItem(`mindbite_account_${email}`, JSON.stringify({ password, user: newUser }));
    persist(newUser);
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    localStorage.removeItem('mindbite_user');
    setUser(null);
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    persist(updated);
    // Also update in account storage
    const stored = localStorage.getItem(`mindbite_account_${user.email}`);
    if (stored) {
      const account = JSON.parse(stored);
      account.user = updated;
      localStorage.setItem(`mindbite_account_${user.email}`, JSON.stringify(account));
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
