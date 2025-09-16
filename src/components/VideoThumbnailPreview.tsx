'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Clock, Eye } from 'lucide-react';

interface VideoThumbnailPreviewProps {
  videoId: string;
  title?: string;
  showStats?: boolean;
  className?: string;
}

interface VideoStats {
  watchCount: number;
  totalTime: number;
  lastWatched?: string;
}

export default function VideoThumbnailPreview({
  videoId,
  title,
  showStats = false,
  className = ''
}: VideoThumbnailPreviewProps) {
  const [stats, setStats] = useState<VideoStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!showStats || !videoId) return;

    const fetchStats = async () => {
      setIsLoading(true);
      try {
        // This would normally fetch from your backend
        // For now, we'll simulate with localStorage data
        const storedStats = localStorage.getItem(`videoStats_${videoId}`);
        if (storedStats) {
          setStats(JSON.parse(storedStats));
        }
      } catch (error) {
        console.warn('Failed to fetch video stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [videoId, showStats]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  return (
    <Card className={`overflow-hidden ${className}`}>
      <div className="relative">
        <img
          src={thumbnailUrl}
          alt={title || 'Video thumbnail'}
          className="w-full h-32 object-cover"
          onError={(e) => {
            // Fallback to medium quality if maxres fails
            const target = e.target as HTMLImageElement;
            if (target.src.includes('maxresdefault')) {
              target.src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
            }
          }}
        />
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <Play className="h-8 w-8 text-white" />
        </div>
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="text-xs">
            YouTube
          </Badge>
        </div>
      </div>

      {title && (
        <div className="p-3">
          <h4 className="text-sm font-medium line-clamp-2 mb-2">{title}</h4>

          {showStats && (
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {stats && (
                <>
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {stats.watchCount}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDuration(stats.totalTime)}
                  </div>
                  {stats.lastWatched && (
                    <div>
                      {new Date(stats.lastWatched).toLocaleDateString()}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
