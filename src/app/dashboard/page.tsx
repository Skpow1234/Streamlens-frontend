'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/apiClient';
import PageContainer from '@/components/PageContainer';
import EnhancedAnalytics from '@/components/analytics/EnhancedAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Clock, Play, Users, TrendingUp, Calendar, Video, Download, FileText, File, Search } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface UserStats {
  user_id: number;
  username: string;
  total_videos_watched: number;
  total_sessions: number;
  total_watch_time_seconds: number;
  recent_activity: Array<{
    id: number;
    video_id: string;
    video_title: string;
    current_time: number;
    time: string;
    video_state_label: string;
  }>;
  most_watched_videos: Array<{
    video_id: string;
    video_title: string;
    watch_count: number;
    max_time: number;
  }>;
  daily_stats: Array<{
    date: string;
    events_count: number;
    total_time: number;
  }>;
}

export default function DashboardPage(): JSX.Element {
  const { token, user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quickSearch, setQuickSearch] = useState('');

  useEffect(() => {
    if (!token) return;

    const fetchStats = async () => {
      try {
        const data = await apiFetch('/api/video-events/stats/user', { token });
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch user stats:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  if (loading) {
    return (
      <PageContainer title="Dashboard" subtitle="Loading your statistics...">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    );
  }

  if (error || !stats) {
    return (
      <PageContainer title="Dashboard" subtitle="Your viewing statistics">
        <div className="text-center py-12">
          <div className="text-red-500 text-lg mb-4">
            {error || 'Failed to load dashboard data'}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </PageContainer>
    );
  }

  const exportUserData = async (format: 'csv' | 'json') => {
    try {
      toast.info('Preparing export...')

      // Get all user events for export
      const eventsResponse = await apiFetch('/api/video-events/', { token })
      const events = Array.isArray(eventsResponse) ? eventsResponse : []

      if (format === 'csv') {
        // Export user stats and events
        const csvContent = [
          // User stats header
          'Section,Metric,Value',
          `User Stats,Username,${stats.username}`,
          `User Stats,Total Videos Watched,${stats.total_videos_watched}`,
          `User Stats,Total Sessions,${stats.total_sessions}`,
          `User Stats,Total Watch Time (seconds),${stats.total_watch_time_seconds}`,
          '',
          // Events header
          'Event ID,Video ID,Video Title,Current Time,Video State,Time',
          // Events data
          ...events.map((event: any) => [
            event.id,
            `"${event.video_id}"`,
            `"${(event.video_title || '').replace(/"/g, '""')}"`,
            event.current_time,
            `"${event.video_state_label}"`,
            `"${event.time}"`
          ].join(','))
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `user_data_${stats.username}_${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        toast.success('CSV export completed!')
      } else {
        // Export as JSON
        const userData = {
          user_stats: stats,
          events: events,
          export_date: new Date().toISOString()
        }

        const jsonContent = JSON.stringify(userData, null, 2)
        const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `user_data_${stats.username}_${new Date().toISOString().split('T')[0]}.json`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        toast.success('JSON export completed!')
      }
    } catch (error) {
      console.error('Export failed:', error)
      toast.error('Export failed. Please try again.')
    }
  }

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearch.trim()) {
      router.push(`/search?query=${encodeURIComponent(quickSearch.trim())}`);
    }
  }

  return (
    <PageContainer title="Dashboard" subtitle={`Welcome back, ${stats.username}!`}>
      {/* Export Button */}
      <div className="flex justify-end mb-6">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export My Data
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => exportUserData('csv')} className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Export as CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportUserData('json')} className="flex items-center gap-2">
              <File className="h-4 w-4" />
              Export as JSON
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Advanced Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Search */}
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleQuickSearch} className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Quick search your videos..."
                    value={quickSearch}
                    onChange={(e) => setQuickSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <Button type="submit" disabled={!quickSearch.trim()}>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Videos Watched</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_videos_watched}</div>
            <p className="text-xs text-muted-foreground">
              Unique videos viewed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_sessions}</div>
            <p className="text-xs text-muted-foreground">
              Watch sessions created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Watch Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(stats.total_watch_time_seconds)}</div>
            <p className="text-xs text-muted-foreground">
              Total time spent watching
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Session</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.total_sessions > 0
                ? formatDuration(stats.total_watch_time_seconds / stats.total_sessions)
                : '0s'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Average session duration
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recent_activity.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No recent activity. Start watching some videos!
              </div>
            ) : (
              <div className="space-y-4">
                {stats.recent_activity.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {activity.video_title || `Video ${activity.video_id}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.video_state_label} at {formatDuration(activity.current_time)}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <Badge variant="secondary" className="text-xs">
                        {formatTimeAgo(activity.time)}
                      </Badge>
                    </div>
                  </div>
                ))}
                {stats.recent_activity.length > 5 && (
                  <Link
                    href="/all-events"
                    className="text-sm text-blue-600 hover:underline block text-center"
                  >
                    View all activity →
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Most Watched Videos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Most Watched Videos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.most_watched_videos.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No videos watched yet. Start watching!
              </div>
            ) : (
              <div className="space-y-4">
                {stats.most_watched_videos.map((video, index) => (
                  <div key={video.video_id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {video.video_title || `Video ${video.video_id}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Watched {video.watch_count} times • Last at {formatDuration(video.max_time)}
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/watch?v=${video.video_id}`}
                      className="ml-3 text-blue-600 hover:text-blue-800"
                    >
                      <Play className="h-4 w-4" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Daily Stats Preview */}
      {stats.daily_stats.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Last 30 Days Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {stats.daily_stats.reduce((sum, day) => sum + day.events_count, 0)}
                </div>
                <p className="text-sm text-muted-foreground">Total Events</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {formatDuration(stats.daily_stats.reduce((sum, day) => sum + day.total_time, 0))}
                </div>
                <p className="text-sm text-muted-foreground">Total Watch Time</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(stats.daily_stats.reduce((sum, day) => sum + day.total_time, 0) / Math.max(stats.daily_stats.length, 1))}
                </div>
                <p className="text-sm text-muted-foreground">Avg Daily Time</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {stats.daily_stats.filter(day => day.events_count > 0).length}
                </div>
                <p className="text-sm text-muted-foreground">Active Days</p>
              </div>
            </div>
          </CardContent>
        </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <EnhancedAnalytics />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
