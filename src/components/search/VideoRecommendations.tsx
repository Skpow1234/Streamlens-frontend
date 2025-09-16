'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, Play, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface Recommendation {
  video_id: string;
  video_title: string;
  similarity_score: number;
  reason: string;
}

interface VideoRecommendationsProps {
  limit?: number;
  showHeader?: boolean;
  className?: string;
}

export default function VideoRecommendations({
  limit = 10,
  showHeader = true,
  className = ''
}: VideoRecommendationsProps): JSX.Element {
  const { token } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!token) return;

      try {
        const data = await apiFetch(`/api/video-events/recommendations?limit=${limit}`, { token });
        setRecommendations(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
        toast.error('Failed to load recommendations');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [token, limit]);

  if (loading) {
    return (
      <Card className={className}>
        {showHeader && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Recommended for You
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
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Recommended for You
          </CardTitle>
        </CardHeader>
      )}
      <CardContent>
        {recommendations.length > 0 ? (
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div
                key={`${rec.video_id}-${index}`}
                className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-shrink-0 relative">
                  <img
                    src={`https://img.youtube.com/vi/${rec.video_id}/mqdefault.jpg`}
                    alt={rec.video_title}
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

                <div className="flex-1 min-w-0">
                  <Link
                    href={`/watch?v=${rec.video_id}`}
                    className="font-medium text-blue-600 hover:text-blue-800 hover:underline block truncate"
                  >
                    {rec.video_title}
                  </Link>
                  <p className="text-sm text-muted-foreground truncate">
                    {rec.reason}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant={rec.similarity_score > 80 ? "default" : rec.similarity_score > 60 ? "secondary" : "outline"}
                    className="text-xs"
                  >
                    {rec.similarity_score}% match
                  </Badge>
                  <Link href={`/watch?v=${rec.video_id}`}>
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
                  <Sparkles className="h-4 w-4 mr-2" />
                  View More Recommendations
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No recommendations yet</p>
            <p className="text-sm">Watch more videos to get personalized recommendations</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
