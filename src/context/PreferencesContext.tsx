'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  itemsPerPage: number;
  defaultTimeRange: number; // in days
  notifications: {
    enabled: boolean;
    sessionWarnings: boolean;
    exportCompletion: boolean;
    errorRecovery: boolean;
    systemStatus: boolean;
    progressIndicators: boolean;
  };
  dashboard: {
    showDailyStats: boolean;
    showRecentActivity: boolean;
    showMostWatched: boolean;
  };
  autoHideDelay: number;
}

interface PreferencesContextType {
  preferences: UserPreferences;
  updatePreferences: (newPrefs: Partial<UserPreferences>) => void;
  resetToDefaults: () => void;
}

const defaultPreferences: UserPreferences = {
  theme: 'system',
  itemsPerPage: 10,
  defaultTimeRange: 30,
  notifications: {
    enabled: true,
    sessionWarnings: true,
    exportCompletion: true,
    errorRecovery: true,
    systemStatus: true,
    progressIndicators: true,
  },
  dashboard: {
    showDailyStats: true,
    showRecentActivity: true,
    showMostWatched: true,
  },
  autoHideDelay: 5000,
};

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

interface PreferencesProviderProps {
  children: ReactNode;
}

export function PreferencesProvider({ children }: PreferencesProviderProps) {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('userPreferences');
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferences({ ...defaultPreferences, ...parsed });
      }
    } catch (error) {
      console.warn('Failed to load preferences from localStorage:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('userPreferences', JSON.stringify(preferences));
      } catch (error) {
        console.warn('Failed to save preferences to localStorage:', error);
      }
    }
  }, [preferences, isLoaded]);

  const updatePreferences = (newPrefs: Partial<UserPreferences>) => {
    setPreferences(prev => ({ ...prev, ...newPrefs }));
  };

  const resetToDefaults = () => {
    setPreferences(defaultPreferences);
  };

  return (
    <PreferencesContext.Provider value={{ preferences, updatePreferences, resetToDefaults }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences(): PreferencesContextType {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
}
