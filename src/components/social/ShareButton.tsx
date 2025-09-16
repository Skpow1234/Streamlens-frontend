'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface ShareButtonProps {
  videoId: string;
  currentTime?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
}

export default function ShareButton({
  videoId,
  currentTime,
  size = 'md',
  variant = 'outline'
}: ShareButtonProps) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleShare = async () => {
    setLoading(true);
    try {
      let shareUrl: string;

      if (token && currentTime && currentTime > 0) {
        // Get share URL from backend with timestamp
        const response = await apiFetch(`/api/social/videos/${videoId}/share`, {
          token,
          method: 'POST',
          body: JSON.stringify({ timestamp: currentTime })
        });
        shareUrl = response.share_url;
      } else {
        // Generate basic share URL
        const baseUrl = window.location.origin;
        shareUrl = currentTime && currentTime > 0
          ? `${baseUrl}/watch?v=${videoId}&t=${Math.floor(currentTime)}`
          : `${baseUrl}/watch?v=${videoId}`;
      }

      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied to clipboard!');
    } catch (error) {
      console.error('Failed to share video:', error);
      toast.error('Failed to generate share link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleShare}
      disabled={loading}
      className="flex items-center gap-2"
    >
      <Share2 />
      Share
    </Button>
  );
}
