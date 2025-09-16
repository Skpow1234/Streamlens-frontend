'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';

interface WatchProgress {
  videoId: string;
  currentTime: number;
  duration: number;
  lastWatched: string;
  completed: boolean;
}

const STORAGE_KEY = 'watchProgress';

export function useWatchProgress(videoId: string) {
  const { user } = useAuth();
  const [progress, setProgress] = useState<WatchProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load progress from localStorage
  useEffect(() => {
    if (!user || !videoId) {
      setIsLoading(false);
      return;
    }

    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_${user.id}`);
      if (stored) {
        const allProgress = JSON.parse(stored);
        const videoProgress = allProgress[videoId];
        if (videoProgress) {
          setProgress(videoProgress);
        }
      }
    } catch (error) {
      console.warn('Failed to load watch progress:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, videoId]);

  // Save progress to localStorage
  const saveProgress = useCallback((currentTime: number, duration: number) => {
    if (!user || !videoId || duration === 0) return;

    const completed = currentTime / duration > 0.9; // Consider 90% watched as completed
    const newProgress: WatchProgress = {
      videoId,
      currentTime,
      duration,
      lastWatched: new Date().toISOString(),
      completed
    };

    setProgress(newProgress);

    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_${user.id}`);
      const allProgress = stored ? JSON.parse(stored) : {};
      allProgress[videoId] = newProgress;
      localStorage.setItem(`${STORAGE_KEY}_${user.id}`, JSON.stringify(allProgress));
    } catch (error) {
      console.warn('Failed to save watch progress:', error);
    }
  }, [user, videoId]);

  // Get resume time (with some buffer to avoid starting at exact end)
  const getResumeTime = useCallback(() => {
    if (!progress) return 0;

    // If completed, don't resume
    if (progress.completed) return 0;

    // Add 5 second buffer to avoid starting at the exact end
    const resumeTime = Math.min(progress.currentTime + 5, progress.duration - 10);
    return Math.max(0, resumeTime);
  }, [progress]);

  // Clear progress for a video
  const clearProgress = useCallback(() => {
    if (!user || !videoId) return;

    setProgress(null);
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_${user.id}`);
      if (stored) {
        const allProgress = JSON.parse(stored);
        delete allProgress[videoId];
        localStorage.setItem(`${STORAGE_KEY}_${user.id}`, JSON.stringify(allProgress));
      }
    } catch (error) {
      console.warn('Failed to clear watch progress:', error);
    }
  }, [user, videoId]);

  // Get all progress for current user
  const getAllProgress = useCallback(() => {
    if (!user) return {};

    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_${user.id}`);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.warn('Failed to get all progress:', error);
      return {};
    }
  }, [user]);

  return {
    progress,
    isLoading,
    saveProgress,
    getResumeTime,
    clearProgress,
    getAllProgress,
    hasProgress: !!progress && !progress.completed
  };
}

export default useWatchProgress;
