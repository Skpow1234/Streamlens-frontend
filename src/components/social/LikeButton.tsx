'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { Heart, HeartOff } from 'lucide-react';
import { toast } from 'sonner';

interface LikeButtonProps {
  videoId: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
}

export default function LikeButton({ videoId, size = 'md', variant = 'outline' }: LikeButtonProps) {
  const { token } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;

    // Check if user already liked this video
    const checkLikeStatus = async () => {
      try {
        const response = await apiFetch(`/api/social/videos/${videoId}/like/status`, { token });
        setLiked(response.liked);
      } catch (error) {
        console.warn('Failed to check like status:', error);
      }
    };

    // Get likes count
    const getLikesCount = async () => {
      try {
        const response = await apiFetch(`/api/social/videos/${videoId}/likes/count`);
        setLikesCount(response.likes_count);
      } catch (error) {
        console.warn('Failed to get likes count:', error);
      }
    };

    checkLikeStatus();
    getLikesCount();
  }, [videoId, token]);

  const handleLikeToggle = async () => {
    if (!token) {
      toast.error('Please sign in to like videos');
      return;
    }

    setLoading(true);
    try {
      if (liked) {
        await apiFetch(`/api/social/videos/${videoId}/like`, {
          token,
          method: 'DELETE'
        });
        setLiked(false);
        setLikesCount(prev => Math.max(0, prev - 1));
        toast.success('Video unliked');
      } else {
        await apiFetch(`/api/social/videos/${videoId}/like`, {
          token,
          method: 'POST'
        });
        setLiked(true);
        setLikesCount(prev => prev + 1);
        toast.success('Video liked');
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
      toast.error('Failed to update like status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLikeToggle}
      disabled={loading || !token}
      className={`flex items-center gap-2 ${liked ? 'text-red-500 hover:text-red-600' : ''}`}
    >
      {liked ? <Heart className="fill-current" /> : <HeartOff />}
      <span>{likesCount}</span>
    </Button>
  );
}
