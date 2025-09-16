'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Play, Eye, Users, Clock, Flame } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface TrendingVideo {
  video_id: string;
  video_title: string;
  total_views: number;
  unique_watchers: number;
  average_watch_time: number;
  trending_score: number;
  last_activity: string;
  timeframe: string;
}

interface TrendingVideosProps {
  limit?: number;
  showHeader?: boolean;
  className?: string;
}

export default function TrendingVideos({
  limit = 20,
  showHeader = true,
  className = ''
}: TrendingVideosProps): JSX.Element {
  const { token } = useAuth();
  const [videos, setVideos] = useState<TrendingVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('week');

  const fetchTrendingVideos = async (selectedTimeframe: string = timeframe) => {
    if (!token) return;

    setLoading(true);
    try {
      const data = await apiFetch(
        `/api/video-events/trending?timeframe=${selectedTimeframe}&limit=${limit}`,
        { token }
      );
      setVideos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch trending videos:', error);
      toast.error('Failed to load trending videos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrendingVideos();
  }, [token, limit]);

  const handleTimeframeChange = (newTimeframe: 'day' | 'week' | 'month') => {
    setTimeframe(newTimeframe);
    fetchTrendingVideos(newTimeframe);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const getTrendingIcon = (score: number) => {
    if (score > 80) return <Flame className="h-4 w-4 text-red-500" />;
    if (score > 60) return <Flame className="h-4 w-4 text-orange-500" />;
    return <TrendingUp className="h-4 w-4 text-blue-500" />;
  };

  if (loading) {
    return (
      <Card className={className}>
        {showHeader && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Trending Videos
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-16 w-24 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Trending Videos
            </CardTitle>
            <Select value={timeframe} onValueChange={handleTimeframeChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      )}
      <CardContent>
        {videos.length > 0 ? (
          <div className="space-y-4">
            {videos.map((video, index) => (
              <div
                key={`${video.video_id}-${index}`}
                className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                {/* Ranking */}
                <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full text-sm font-bold">
                  {index + 1}
                </div>

                {/* Thumbnail */}
                <div className="flex-shrink-0 relative">
                  <img
                    src={`https://img.youtube.com/vi/${video.video_id}/mqdefault.jpg`}
                    alt={video.video_title}
                    className="w-20 h-14 object-cover rounded"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-video.png';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/20 rounded flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Play className="h-6 w-6 text-white" />
                  </div>
                </div>

                {/* Video Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/watch?v=${video.video_id}`}
                    className="font-medium text-blue-600 hover:text-blue-800 hover:underline block truncate"
                  >
                    {video.video_title}
                  </Link>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {video.total_views} views
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {video.unique_watchers} watchers
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDuration(video.average_watch_time)} avg
                    </div>
                  </div>
                </div>

                {/* Trending Score & Actions */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {getTrendingIcon(video.trending_score)}
                    <Badge variant="secondary" className="text-xs">
                      {video.trending_score}
                    </Badge>
                  </div>
                  <Link href={`/watch?v=${video.video_id}`}>
                    <Button size="sm" variant="outline">
                      <Play className="h-3 w-3 mr-1" />
                      Watch
                    </Button>
                  </Link>
                </div>
              </div>
            ))}

            <div className="pt-4 border-t">
              <Link href="/search">
                <Button variant="outline" className="w-full">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Explore More Videos
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No trending videos</p>
            <p className="text-sm">Videos need more activity to appear in trending</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
