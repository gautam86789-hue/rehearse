import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Linking } from 'react-native';
import { supabase } from '../services/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  authError: string | null;
  clearError: () => void;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (
    email: string,
    password: string,
    metadata?: { fullName?: string; role?: string }
  ) => Promise<{ error: Error | null; user: User | null }>;
  signInWithOAuth: (provider: 'google' | 'azure' | 'facebook') => Promise<{ error: Error | null; url?: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  signInAsGuest: () => Promise<void>;
}

const GUEST_KEY = '@rehearse_is_guest';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Initial Session Hydration from Supabase
    const initAuth = async () => {
      try {
        const guestStored = await AsyncStorage.getItem(GUEST_KEY);
        if (guestStored === 'true') {
          setIsGuest(true);
        }

        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('Error reading Supabase session:', error.message);
        } else if (data?.session) {
          setSession(data.session);
          setUser(data.session.user);
          setIsGuest(false);
        }
      } catch (err) {
        console.warn('Error initializing auth session:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // 2. Real-time Supabase Auth State Change Listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (newSession) {
          setSession(newSession);
          setUser(newSession.user);
          setIsGuest(false);
          await AsyncStorage.removeItem(GUEST_KEY);
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const clearError = () => setAuthError(null);

  const signInWithEmail = async (email: string, password: string) => {
    setAuthError(null);
    const cleanEmail = email.trim().toLowerCase();

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password
      });

      if (error) {
        setAuthError(error.message);
        return { error };
      }

      if (data?.session) {
        setSession(data.session);
        setUser(data.user);
        setIsGuest(false);
        await AsyncStorage.removeItem(GUEST_KEY);
        return { error: null };
      }

      return { error: new Error('Failed to retrieve authentication session.') };
    } catch (err: any) {
      const message = err?.message || 'Failed to sign in. Please try again.';
      setAuthError(message);
      return { error: new Error(message) };
    }
  };

  const signUpWithEmail = async (
    email: string,
    password: string,
    metadata?: { fullName?: string; role?: string }
  ) => {
    setAuthError(null);
    const cleanEmail = email.trim().toLowerCase();

    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: metadata?.fullName || cleanEmail.split('@')[0],
            role: metadata?.role || 'Executive Leader'
          }
        }
      });

      if (error) {
        setAuthError(error.message);
        return { error, user: null };
      }

      if (data?.user) {
        if (data.session) {
          setSession(data.session);
          setUser(data.user);
        } else {
          setUser(data.user);
        }
        setIsGuest(false);
        await AsyncStorage.removeItem(GUEST_KEY);
        return { error: null, user: data.user };
      }

      return { error: new Error('Registration failed.'), user: null };
    } catch (err: any) {
      const message = err?.message || 'Failed to register account.';
      setAuthError(message);
      return { error: new Error(message), user: null };
    }
  };

  const signInWithOAuth = async (provider: 'google' | 'azure' | 'facebook') => {
    setAuthError(null);
    try {
      const redirectUrl = Platform.OS === 'web' && typeof window !== 'undefined'
        ? window.location.origin
        : 'rehearse://auth/callback';

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl
        }
      });

      if (error) {
        setAuthError(error.message);
        return { error, url: null };
      }

      if (data?.url) {
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          window.location.href = data.url;
        } else {
          const supported = await Linking.canOpenURL(data.url);
          if (supported) {
            await Linking.openURL(data.url);
          }
        }
      }

      return { error: null, url: data?.url || null };
    } catch (err: any) {
      const msg = err?.message || `${provider} authentication could not be initiated`;
      setAuthError(msg);
      return { error: new Error(msg), url: null };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Supabase sign out error:', err);
    } finally {
      await AsyncStorage.removeItem(GUEST_KEY);
      setSession(null);
      setUser(null);
      setIsGuest(false);
    }
  };

  const resetPassword = async (email: string) => {
    setAuthError(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: Platform.OS === 'web' && typeof window !== 'undefined'
          ? `${window.location.origin}/reset-password`
          : 'rehearse://reset-password'
      });

      if (error) {
        setAuthError(error.message);
        return { error };
      }

      return { error: null };
    } catch (err: any) {
      const msg = err?.message || 'Password reset request failed.';
      setAuthError(msg);
      return { error: new Error(msg) };
    }
  };

  const signInAsGuest = async () => {
    setIsGuest(true);
    await AsyncStorage.setItem(GUEST_KEY, 'true');
    setSession(null);
    setUser(null);
  };

  const isAuthenticated = !!session || !!user || isGuest;

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        isAuthenticated,
        isGuest,
        isLoading,
        authError,
        clearError,
        signInWithEmail,
        signUpWithEmail,
        signInWithOAuth,
        signOut,
        resetPassword,
        signInAsGuest
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
