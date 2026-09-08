import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, RoleplaySession, Scorecard } from '../types';
import { apiService } from '../services/api';
import { useAuth } from './AuthContext';

interface AppContextType {
  user: UserProfile;
  isLoading: boolean;
  isOnboarded: boolean;
  activeSession: RoleplaySession | null;
  lastScorecard: Scorecard | null;
  isPaywallVisible: boolean;
  unlockedBadge: { title: string; description: string; icon: string } | null;
  setUser: (user: UserProfile) => void;
  setActiveSession: (session: RoleplaySession | null) => void;
  setLastScorecard: (scorecard: Scorecard | null) => void;
  setIsPaywallVisible: (visible: boolean) => void;
  setUnlockedBadge: (badge: { title: string; description: string; icon: string } | null) => void;
  refreshProfile: () => Promise<void>;
  completeOnboarding: (role: string, experienceLevel: string, primaryDreadCategory: string) => Promise<void>;
  upgradeSubscription: (plan: 'monthly' | 'annual') => Promise<void>;
}

const createDynamicProfile = (userId: string, role = 'Executive Leader'): UserProfile => ({
  id: userId,
  role,
  experienceLevel: 'Mid-Senior',
  primaryDreadCategory: 'negotiation',
  totalRehearsals: 0,
  totalXP: 0,
  currentStreak: 1,
  longestStreak: 1,
  lastPracticeDate: new Date().toISOString().split('T')[0],
  subscription: {
    status: 'free_trial',
    rehearsalsRemaining: 2,
    trialEndsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    planName: '5-Day Free Trial'
  },
  createdAt: new Date().toISOString()
});

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: authUser, isGuest, signInAsGuest, isAuthenticated } = useAuth();
  const currentUserId = authUser?.id || (isGuest ? 'guest-session' : 'user-session');

  const [user, setUserState] = useState<UserProfile>(() =>
    createDynamicProfile(currentUserId, authUser?.user_metadata?.role || 'Executive Leader')
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(true);
  const [activeSession, setActiveSession] = useState<RoleplaySession | null>(null);
  const [lastScorecard, setLastScorecard] = useState<Scorecard | null>(null);
  const [isPaywallVisible, setIsPaywallVisible] = useState(false);
  const [unlockedBadge, setUnlockedBadge] = useState<{ title: string; description: string; icon: string } | null>(null);

  const loadUserState = useCallback(async (userId: string) => {
    setIsLoading(true);
    try {
      const onboardedKey = `@rehearse_onboarded_${userId}`;
      const userKey = `@rehearse_user_${userId}`;

      const storedOnboarded = await AsyncStorage.getItem(onboardedKey);
      if (storedOnboarded === null) {
        setIsOnboarded(false);
      } else {
        setIsOnboarded(storedOnboarded === 'true');
      }

      let activeProfile: UserProfile = createDynamicProfile(
        userId,
        authUser?.user_metadata?.role || 'Executive Leader'
      );

      const storedUser = await AsyncStorage.getItem(userKey);
      if (storedUser) {
        try {
          activeProfile = JSON.parse(storedUser);
        } catch (e) {}
      }

      // Sync with backend API dynamically
      try {
        const { user: apiUser } = await apiService.getProfile(userId);
        if (apiUser) {
          activeProfile = { ...activeProfile, ...apiUser, id: userId };
          await AsyncStorage.setItem(userKey, JSON.stringify(activeProfile));
        }
      } catch (err) {
        // Fallback to local profile
      }

      setUserState(activeProfile);
    } catch (e) {
      console.warn('Failed to load dynamic user state', e);
    } finally {
      setIsLoading(false);
    }
  }, [authUser]);

  useEffect(() => {
    loadUserState(currentUserId);
  }, [currentUserId, loadUserState]);

  const setUser = async (updated: UserProfile) => {
    setUserState(updated);
    try {
      const userKey = `@rehearse_user_${updated.id}`;
      await AsyncStorage.setItem(userKey, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save user profile', e);
    }
  };

  const refreshProfile = async () => {
    try {
      const { user: refreshed } = await apiService.getProfile(user.id);
      if (refreshed) {
        await setUser(refreshed);
      }
    } catch (e) {
      console.warn('Could not refresh profile from server', e);
    }
  };

  const completeOnboarding = async (
    role: string,
    experienceLevel: string,
    primaryDreadCategory: string
  ) => {
    try {
      const { user: updated } = await apiService.completeOnboarding({
        userId: user.id,
        role,
        experienceLevel,
        primaryDreadCategory
      });
      await setUser(updated);
    } catch (e) {
      // Local dynamic fallback
      await setUser({
        ...user,
        role,
        experienceLevel,
        primaryDreadCategory
      });
    } finally {
      setIsOnboarded(true);
      await AsyncStorage.setItem(`@rehearse_onboarded_${user.id}`, 'true');
      if (!isAuthenticated && signInAsGuest) {
        await signInAsGuest();
      }
    }
  };

  const upgradeSubscription = async (plan: 'monthly' | 'annual') => {
    try {
      const { subscription } = await apiService.upgradePlan(user.id, plan);
      const updatedUser = {
        ...user,
        subscription
      };
      await setUser(updatedUser);
      setIsPaywallVisible(false);
    } catch (e) {
      const updatedUser: UserProfile = {
        ...user,
        subscription: {
          status: plan === 'annual' ? 'active_annual' : 'active_monthly',
          rehearsalsRemaining: 99999,
          planName: plan === 'annual' ? 'Annual Masterclass Pass' : 'Monthly Professional'
        }
      };
      await setUser(updatedUser);
      setIsPaywallVisible(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        isLoading,
        isOnboarded,
        activeSession,
        lastScorecard,
        isPaywallVisible,
        unlockedBadge,
        setUser,
        setActiveSession,
        setLastScorecard,
        setIsPaywallVisible,
        setUnlockedBadge,
        refreshProfile,
        completeOnboarding,
        upgradeSubscription
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
