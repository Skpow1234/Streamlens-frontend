'use client';

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { usePreferences } from '@/context/PreferencesContext';
import SessionTimeoutWarning from '@/components/SessionTimeoutWarning';

export interface NotificationPreferences {
  sessionWarnings: boolean;
  exportCompletion: boolean;
  errorRecovery: boolean;
  systemStatus: boolean;
  progressIndicators: boolean;
  autoHideDelay: number;
}

export interface NotificationOptions {
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

interface NotificationContextType {
  showSessionWarning: (remainingTime: number) => void;
  showExportComplete: (format: 'csv' | 'json', itemCount: number) => void;
  showErrorWithRecovery: (error: string, recoveryAction?: () => void) => void;
  showSystemStatus: (message: string, type: 'info' | 'success' | 'warning' | 'error') => void;
  showProgress: (message: string, progress?: number) => string;
  updateProgress: (id: string, progress: number, message?: string) => void;
  dismissProgress: (id: string) => void;
  preferences: NotificationPreferences;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

const DEFAULT_PREFERENCES: NotificationPreferences = {
  sessionWarnings: true,
  exportCompletion: true,
  errorRecovery: true,
  systemStatus: true,
  progressIndicators: true,
  autoHideDelay: 5000,
};

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const { preferences: userPrefs } = usePreferences();
  const [activeProgressIds, setActiveProgressIds] = useState<Set<string>>(new Set());
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const [sessionTimeLeft, setSessionTimeLeft] = useState(0);

  const preferences: NotificationPreferences = {
    ...DEFAULT_PREFERENCES,
    ...(userPrefs?.notifications || {}),
    autoHideDelay: userPrefs?.autoHideDelay || DEFAULT_PREFERENCES.autoHideDelay,
  };

  const showSessionWarning = useCallback((remainingTime: number) => {
    if (!preferences.sessionWarnings) return;

    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;

    toast.warning(`Session expires in ${minutes}:${seconds.toString().padStart(2, '0')}`, {
      duration: 10000,
      action: {
        label: 'Extend Session',
        onClick: () => {
          // This would typically refresh the token
          toast.success('Session extended');
        },
      },
      description: 'Your session will expire soon. Save your work!',
    });
  }, [preferences.sessionWarnings]);

  const showExportComplete = useCallback((format: 'csv' | 'json', itemCount: number) => {
    if (!preferences.exportCompletion) return;

    toast.success(`Export completed!`, {
      description: `${itemCount} items exported as ${format.toUpperCase()}`,
      action: {
        label: 'Download',
        onClick: () => {
          // This would trigger the actual download
          toast.info('Download started...');
        },
      },
    });
  }, [preferences.exportCompletion]);

  const showErrorWithRecovery = useCallback((error: string, recoveryAction?: () => void) => {
    if (!preferences.errorRecovery) {
      toast.error(error);
      return;
    }

    toast.error(error, {
      duration: 8000,
      action: recoveryAction ? {
        label: 'Try Again',
        onClick: recoveryAction,
      } : undefined,
      description: recoveryAction ? 'Click "Try Again" to retry the operation' : undefined,
    });
  }, [preferences.errorRecovery]);

  const showSystemStatus = useCallback((message: string, type: 'info' | 'success' | 'warning' | 'error') => {
    if (!preferences.systemStatus) return;

    const toastFn = {
      info: toast.info,
      success: toast.success,
      warning: toast.warning,
      error: toast.error,
    }[type];

    toastFn(message, {
      duration: preferences.autoHideDelay,
    });
  }, [preferences.systemStatus, preferences.autoHideDelay]);

  const showProgress = useCallback((message: string, progress = 0) => {
    if (!preferences.progressIndicators) return '';

    const id = `progress-${Date.now()}-${Math.random()}`;
    setActiveProgressIds(prev => new Set([...prev, id]));

    toast.loading(message, {
      id,
      duration: Infinity,
      description: progress > 0 ? `${progress}% complete` : 'Processing...',
    });

    return id;
  }, [preferences.progressIndicators]);

  const updateProgress = useCallback((id: string, progress: number, message?: string) => {
    if (!activeProgressIds.has(id)) return;

    toast.loading(message || 'Processing...', {
      id,
      duration: Infinity,
      description: `${progress}% complete`,
    });

    if (progress >= 100) {
      setTimeout(() => dismissProgress(id), 1000);
    }
  }, [activeProgressIds]);

  const dismissProgress = useCallback((id: string) => {
    if (!activeProgressIds.has(id)) return;

    toast.dismiss(id);
    setActiveProgressIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, [activeProgressIds]);

  // Session timeout monitoring
  useEffect(() => {
    if (!user || !preferences.sessionWarnings) {
      setShowSessionWarning(false);
      return;
    }

    const checkSessionExpiry = () => {
      // This is a simplified example - in a real app you'd check the actual token expiry
      // For demo purposes, we'll simulate a 10-minute session with 5-minute warning
      const warningTime = 5 * 60; // 5 minutes before expiry

      if (!showSessionWarning) {
        setSessionTimeLeft(warningTime);
        setShowSessionWarning(true);
      }
    };

    // Check every minute for the last 10 minutes of session
    const interval = setInterval(checkSessionExpiry, 60000);

    return () => clearInterval(interval);
  }, [user, preferences.sessionWarnings, showSessionWarning]);

  const value: NotificationContextType = {
    showSessionWarning,
    showExportComplete,
    showErrorWithRecovery,
    showSystemStatus,
    showProgress,
    updateProgress,
    dismissProgress,
    preferences,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <SessionTimeoutWarning
        isOpen={showSessionWarning}
        onClose={() => setShowSessionWarning(false)}
        remainingTime={sessionTimeLeft}
      />
    </NotificationContext.Provider>
  );
}
