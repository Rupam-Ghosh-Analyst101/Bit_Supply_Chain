import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, signInWithGoogle, signOut } from './lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  role: 'client' | 'operator';
  isAdmin: boolean;
  signIn: (name?: string, country?: string) => Promise<any>;
  logout: () => Promise<void>;
  toggleRole: () => void;
  enrollmentDetails: { name: string; country: string } | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<'client' | 'operator'>('client');
  const [isAdmin, setIsAdmin] = useState(false);
  const [enrollmentDetails, setEnrollmentDetails] = useState<{ name: string; country: string } | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        console.log("User detected:", u.email, u.uid);
        const adminStatus = await import('./lib/firebase').then(m => m.checkIsAdmin(u));
        console.log("Admin status check:", adminStatus);
        setIsAdmin(adminStatus);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = async (name?: string, country?: string) => {
    try {
      if (name && country) {
        setEnrollmentDetails({ name, country });
      }
      return await signInWithGoogle();
    } catch (error) {
      console.error("Auth error:", error);
    }
  };

  const logout = async () => {
    await signOut();
  };

  const toggleRole = () => {
    setRole(prev => prev === 'client' ? 'operator' : 'client');
  };

  return (
    <AuthContext.Provider value={{ user, loading, role, isAdmin, signIn, logout, toggleRole, enrollmentDetails }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
