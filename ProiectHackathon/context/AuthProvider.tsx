import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  refreshSession: () => void; // Funcție pentru a reîncărca sesiunea
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const setData = useCallback(async (session: Session | null) => {
    setLoading(true);
    setSession(session);
    setUser(session?.user ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    // Forțăm ștergerea sesiunii la pornirea aplicației pentru a afișa mereu formularul de login/signup
    supabase.auth.signOut();
    setData(null);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setData(session);
    });

    return () => subscription.unsubscribe();
  }, [setData]);

  const refreshSession = async () => {
    // Nu mai setăm loading aici pentru a evita flicker-ul UI
    const { data: { session }, error } = await supabase.auth.refreshSession();
    if (error) console.error('Eroare la reîmprospătarea sesiunii:', error);
    setData(session ?? null); // Apelăm direct setData, care gestionează starea de loading
  };

  const value = { 
    session, 
    user, 
    loading, 
    refreshSession,
    signOut: () => supabase.auth.signOut() 
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};