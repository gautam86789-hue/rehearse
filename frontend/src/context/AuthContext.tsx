import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Session, User } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as ExpoLinking from 'expo-linking';
import { supabase } from '../services/supabase';
import { apiService } from '../services/api';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  // Unique per device once isGuest is true — never the literal string
  // 'guest-session'. Every install that opens the app without signing up
  // used to share that one hardcoded id, which meant every anonymous
  // install's rehearsal history, streak, and milestones collided into a
  // single backend account. Generated once on first guest sign-in and
  // persisted locally, so it survives app restarts but is never shared.
  guestId: string | null;
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
  // Reads (or generates + persists) the per-device guest id without
  // flipping any session state — lets a caller that's about to trigger
  // signInAsGuest() know in advance exactly which id it will resolve to,
  // so both agree on the same id rather than each generating their own.
  ensureGuestId: () => Promise<string>;
}

const GUEST_KEY = '@rehearse_is_guest';
const GUEST_ID_KEY = '@rehearse_guest_id';
const AUTH_TOKEN_KEY = '@rehearse_auth_token';
const AUTH_USER_KEY = '@rehearse_auth_user';

// Doesn't need cryptographic uniqueness (`uuid`/`expo-crypto` aren't
// dependencies of this project) — just needs to not collide across real
// devices in practice, which a timestamp plus a long random suffix
// comfortably achieves for a locally-generated, locally-persisted id.
function generateGuestId(): string {
  return `guest-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

// Manual split/decode rather than relying on the global URL/URLSearchParams
// (inconsistent Hermes support across RN versions) — extracts key=value
// pairs from a deep-link URL's hash fragment, e.g.
// "rehearse://auth/callback#access_token=x&refresh_token=y".
function parseFragmentParams(url: string): Record<string, string> {
  const hashIndex = url.indexOf('#');
  if (hashIndex === -1) return {};
  const fragment = url.slice(hashIndex + 1);
  const params: Record<string, string> = {};
  for (const pair of fragment.split('&')) {
    if (!pair) continue;
    const [key, value] = pair.split('=');
    if (key) params[decodeURIComponent(key)] = decodeURIComponent(value || '');
  }
  return params;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [guestId, setGuestId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Initial Session Hydration from Local DB / Backend or Supabase
    const initAuth = async () => {
      try {
        const guestStored = await AsyncStorage.getItem(GUEST_KEY);
        if (guestStored === 'true') {
          setIsGuest(true);
          // Anyone who was already a guest before this fix existed has no
          // stored id yet — generate one now rather than continuing to
          // resolve to the old shared literal.
          setGuestId(await ensureGuestId());
        }

        const storedToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
        const storedUser = await AsyncStorage.getItem(AUTH_USER_KEY);
        if (storedToken && storedUser) {
          apiService.setAuthToken(storedToken);
          const parsedUser = JSON.parse(storedUser);
          const adaptedUser: User = {
            id: parsedUser.id,
            email: parsedUser.email,
            user_metadata: {
              fullName: parsedUser.fullName || parsedUser.name,
              name: parsedUser.name || parsedUser.fullName,
              role: parsedUser.role
            },
            app_metadata: {},
            aud: 'authenticated',
            created_at: parsedUser.createdAt
          } as User;
          setUser(adaptedUser);
          setSession({ access_token: storedToken, user: adaptedUser } as any);
          setIsGuest(false);
          setIsLoading(false);
          return;
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

  // If the server no longer recognises our sign-in token, sign out with a clear
  // message so the user just signs in again (their progress is kept on their
  // account and comes straight back).
  const signOutRef = useRef<() => Promise<void>>(async () => {});
  useEffect(() => {
    apiService.setSessionExpiredHandler(() => {
      setAuthError('Your session expired. Please sign in again.');
      signOutRef.current();
    });
    return () => apiService.setSessionExpiredHandler(null);
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    setAuthError(null);
    const cleanEmail = email.trim().toLowerCase();

    try {
      // 1. Try our dedicated backend DB auth
      try {
        const res = await apiService.login({ email: cleanEmail, password });
        if (res?.token && res?.user) {
          await AsyncStorage.setItem(AUTH_TOKEN_KEY, res.token);
          await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(res.user));
          apiService.setAuthToken(res.token);

          const adaptedUser: User = {
            id: res.user.id,
            email: res.user.email || cleanEmail,
            user_metadata: {
              fullName: res.user.fullName || res.user.name,
              name: res.user.name || res.user.fullName,
              role: res.user.role
            },
            app_metadata: {},
            aud: 'authenticated',
            created_at: res.user.createdAt
          } as User;

          setUser(adaptedUser);
          setSession({ access_token: res.token, user: adaptedUser } as any);
          setIsGuest(false);
          await AsyncStorage.removeItem(GUEST_KEY);
          return { error: null };
        }
      } catch (backendErr: any) {
        // If credentials are invalid, return backend error immediately
        const errMsg = backendErr?.message || '';
        if (errMsg.includes('Invalid credentials') || errMsg.includes('password') || errMsg.includes('email') || errMsg.includes('deactivated')) {
          setAuthError(errMsg);
          return { error: new Error(errMsg) };
        }
        console.warn('Backend login fallback to Supabase:', errMsg);
      }

      // 2. Fallback to Supabase
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
      // 1. Try our dedicated backend DB registration
      try {
        const res = await apiService.register({
          email: cleanEmail,
          password,
          fullName: metadata?.fullName || cleanEmail.split('@')[0],
          role: metadata?.role || 'Executive Leader'
        });

        if (res?.token && res?.user) {
          await AsyncStorage.setItem(AUTH_TOKEN_KEY, res.token);
          await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(res.user));
          apiService.setAuthToken(res.token);

          const adaptedUser: User = {
            id: res.user.id,
            email: res.user.email || cleanEmail,
            user_metadata: {
              fullName: res.user.fullName || res.user.name,
              name: res.user.name || res.user.fullName,
              role: res.user.role
            },
            app_metadata: {},
            aud: 'authenticated',
            created_at: res.user.createdAt
          } as User;

          setUser(adaptedUser);
          setSession({ access_token: res.token, user: adaptedUser } as any);
          setIsGuest(false);
          await AsyncStorage.removeItem(GUEST_KEY);
          return { error: null, user: adaptedUser };
        }
      } catch (backendErr: any) {
        const errMsg = backendErr?.message || '';
        if (errMsg.includes('already registered') || errMsg.includes('Password') || errMsg.includes('Email') || errMsg.includes('required')) {
          setAuthError(errMsg);
          return { error: new Error(errMsg), user: null };
        }
        console.warn('Backend register fallback to Supabase:', errMsg);
      }

      // 2. Fallback to Supabase
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
      // On native this must be the app's own registered scheme (see "scheme"
      // in app.json / the resulting AndroidManifest intent-filter) — Supabase
      // redirects the in-app browser here once the provider finishes, which is
      // how control returns to the app at all. It also must be added to this
      // Supabase project's Authentication > URL Configuration > Redirect URLs
      // allowlist, or Supabase will refuse the redirect regardless.
      const redirectUrl = Platform.OS === 'web' && typeof window !== 'undefined'
        ? window.location.origin
        : ExpoLinking.createURL('auth/callback');

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
          // We drive the browser ourselves below (WebBrowser.openAuthSessionAsync
          // on native, a full-page redirect on web) rather than letting the SDK
          // auto-redirect, since native has no "current page" to redirect from.
          skipBrowserRedirect: true
        }
      });

      if (error) {
        setAuthError(error.message);
        return { error, url: null };
      }

      if (!data?.url) {
        const msg = `${provider} authentication could not be initiated`;
        setAuthError(msg);
        return { error: new Error(msg), url: null };
      }

      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.location.href = data.url;
        return { error: null, url: data.url };
      }

      // Opens a Custom Tab / SFSafariViewController that Android/iOS closes
      // automatically once it navigates to redirectUrl, handing the resulting
      // URL (with the auth code) straight back here — no separate deep-link
      // listener needed.
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

      if (result.type === 'success' && result.url) {
        const { queryParams } = ExpoLinking.parse(result.url);
        const code = typeof queryParams?.code === 'string' ? queryParams.code : undefined;
        const fragment = parseFragmentParams(result.url);
        const accessToken = (typeof queryParams?.access_token === 'string' && queryParams.access_token) || fragment.access_token;
        const refreshToken = (typeof queryParams?.refresh_token === 'string' && queryParams.refresh_token) || fragment.refresh_token;

        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (!exchangeError) return { error: null, url: result.url };
        } else if (accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          if (!sessionError) return { error: null, url: result.url };
        }
      }
    } catch (err: any) {
      console.warn('OAuth flow warning, executing provider fallback:', err);
    }

    // The provider flow didn't complete (cancelled, or this project has no
    // OAuth keys configured). Never fabricate an account here — a made-up
    // identity isn't in the database, so nothing would sync and every attempt
    // would start from scratch. Email sign-in is the path that's always real.
    const msg = 'That sign-in option isn\'t available right now. Please continue with your email instead.';
    setAuthError(msg);
    return { error: new Error(msg), url: null };
  };

  const signOut = async () => {
    try {
      await apiService.logout();
    } catch (err) {
      console.warn('Backend logout error:', err);
    }
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Supabase sign out error:', err);
    } finally {
      await AsyncStorage.multiRemove([
        AUTH_TOKEN_KEY,
        AUTH_USER_KEY,
        GUEST_KEY,
        GUEST_ID_KEY
      ]);
      apiService.setAuthToken(null);
      if (isGuest && guestId) {
        await AsyncStorage.multiRemove([
          `@rehearse_user_${guestId}`,
          `@rehearse_onboarded_${guestId}`,
          `@rehearse_reminders_${guestId}`,
          `@rehearse_history_${guestId}`,
          `@rehearse_notifications_${guestId}`
        ]);
      }
      setSession(null);
      setUser(null);
      setIsGuest(false);
      setGuestId(null);
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

  const ensureGuestId = async (): Promise<string> => {
    const existing = await AsyncStorage.getItem(GUEST_ID_KEY);
    if (existing) return existing;
    const fresh = generateGuestId();
    await AsyncStorage.setItem(GUEST_ID_KEY, fresh);
    return fresh;
  };

  const signInAsGuest = async () => {
    setIsGuest(true);
    await AsyncStorage.setItem(GUEST_KEY, 'true');
    setGuestId(await ensureGuestId());
    setSession(null);
    setUser(null);
  };

  signOutRef.current = signOut;

  const isAuthenticated = !!session || !!user || isGuest;

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        isAuthenticated,
        isGuest,
        guestId,
        ensureGuestId,
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
