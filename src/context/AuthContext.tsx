import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { checkIsAdmin, ensureAdminProvisioned, DESIGNATED_ADMIN_EMAIL } from '../services/adminService';

interface AuthContextType {
  currentUser: User | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  designatedAdminEmail: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const adminStatus = await checkIsAdmin(user.uid, user.email);
          setIsAdmin(adminStatus);
          if (user.email && user.email.toLowerCase() === DESIGNATED_ADMIN_EMAIL.toLowerCase()) {
            await ensureAdminProvisioned(user.uid, user.email);
          }
        } catch {
          setIsAdmin(user.email?.toLowerCase() === DESIGNATED_ADMIN_EMAIL.toLowerCase());
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    if (cred.user) {
      const adminStatus = await checkIsAdmin(cred.user.uid, cred.user.email);
      setIsAdmin(adminStatus);
    }
  };

  const signUp = async (email: string, pass: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (cred.user) {
      const adminStatus = await checkIsAdmin(cred.user.uid, cred.user.email);
      setIsAdmin(adminStatus);
      if (cred.user.email && cred.user.email.toLowerCase() === DESIGNATED_ADMIN_EMAIL.toLowerCase()) {
        await ensureAdminProvisioned(cred.user.uid, cred.user.email);
      }
    }
  };

  const logout = async () => {
    await signOut(auth);
    setIsAdmin(false);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAdmin,
        loading,
        login,
        signUp,
        logout,
        resetPassword,
        designatedAdminEmail: DESIGNATED_ADMIN_EMAIL,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
