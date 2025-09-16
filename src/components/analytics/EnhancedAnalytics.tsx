'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { CalendarDays, Clock, TrendingUp, Activity, BarChart3 } from 'lucide-react';

interface AnalyticsData {
  user_id: number;
  username: string;
  total_videos_watched: number;
  total_sessions: number;
  total_watch_time_seconds: number;
  recent_activity: any[];
  most_watched_videos: any[];
  daily_stats: any[];
  hourly_patterns: any[];
  video_engagement: any[];
  session_analysis: any;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function EnhancedAnalytics() {
  const { token } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    const fetchAnalytics = async () => {
      try {
        const data = await apiFetch('/api/video-events/stats/user', { token });
        setAnalyticsData(data);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [token]);

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const prepareHeatmapData = () => {
    if (!analyticsData?.hourly_patterns) return [];

    // Create a 7x24 grid for the heatmap
    const heatmap = Array(7).fill(null).map(() => Array(24).fill(0));

    analyticsData.hourly_patterns.forEach((pattern: any) => {
      const day = pattern.day_of_week - 1; // Convert to 0-based index
      const hour = pattern.hour;
      heatmap[day][hour] = pattern.activity_count;
    });

    return heatmap;
  };

  const prepareEngagementChartData = () => {
    if (!analyticsData?.video_engagement) return [];

    return analyticsData.video_engagement.slice(0, 8).map((video: any) => ({
      name: video.video_title?.substring(0, 30) + '...' || `Video ${video.video_id}`,
      avgTime: Math.round(video.avg_watch_time),
      maxTime: Math.round(video.max_watch_time),
      events: video.total_events
    }));
  };

  const prepareDailyActivityData = () => {
    if (!analyticsData?.daily_stats) return [];

    return analyticsData.daily_stats.map((stat: any) => ({
      date: formatDate(stat.date),
      events: stat.events_count,
      watchTime: Math.round(stat.total_time / 60) // Convert to minutes
    }));
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-gray-200 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !analyticsData) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-lg mb-4">
          {error || 'Failed to load analytics data'}
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  const heatmapData = prepareHeatmapData();
  const engagementData = prepareEngagementChartData();
  const dailyActivityData = prepareDailyActivityData();

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Session Analysis</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(analyticsData.session_analysis.avg_session_time)}
            </div>
            <p className="text-xs text-muted-foreground">
              Avg session duration
            </p>
            <div className="mt-2 text-xs">
              <div>Min: {formatDuration(analyticsData.session_analysis.min_session_time)}</div>
              <div>Max: {formatDuration(analyticsData.session_analysis.max_session_time)}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Video Engagement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.video_engagement.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Videos with engagement data
            </p>
            <div className="mt-2 text-xs">
              <div>Most engaged: {analyticsData.most_watched_videos[0]?.watch_count || 0} views</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activity Patterns</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.hourly_patterns.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Hourly activity points
            </p>
            <div className="mt-2 text-xs">
              <div>Daily active days: {analyticsData.daily_stats.filter(d => d.events_count > 0).length}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Watch Consistency</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.daily_stats.length > 0
                ? Math.round((analyticsData.daily_stats.filter(d => d.events_count > 0).length / analyticsData.daily_stats.length) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Daily activity consistency
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="activity">Daily Activity</TabsTrigger>
          <TabsTrigger value="engagement">Video Engagement</TabsTrigger>
          <TabsTrigger value="patterns">Activity Patterns</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Activity Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyActivityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => [
                      name === 'events' ? `${value} events` : `${value} minutes`,
                      name === 'events' ? 'Events' : 'Watch Time'
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="events"
                    stroke="#8884d8"
                    strokeWidth={2}
                    name="events"
                  />
                  <Line
                    type="monotone"
                    dataKey="watchTime"
                    stroke="#82ca9d"
                    strokeWidth={2}
                    name="watchTime"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Video Engagement Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => [
                      name === 'avgTime' ? `${Math.round(Number(value) / 60)}m` : `${value} events`,
                      name === 'avgTime' ? 'Avg Watch Time' : 'Total Events'
                    ]}
                  />
                  <Bar dataKey="avgTime" fill="#8884d8" name="avgTime" />
                  <Bar dataKey="events" fill="#82ca9d" name="events" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Activity Heatmap</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="min-w-max">
                  {/* Heatmap Header */}
                  <div className="flex mb-2">
                    <div className="w-16"></div>
                    {Array(24).fill(0).map((_, hour) => (
                      <div key={hour} className="w-6 text-xs text-center text-gray-500">
                        {hour}
                      </div>
                    ))}
                  </div>

                  {/* Heatmap Grid */}
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, dayIndex) => (
                    <div key={day} className="flex items-center mb-1">
                      <div className="w-16 text-xs font-medium text-gray-700">{day}</div>
                      {Array(24).fill(0).map((_, hour) => {
                        const intensity = heatmapData[dayIndex][hour] || 0;
                        const maxIntensity = Math.max(...heatmapData.flat());
                        const opacity = maxIntensity > 0 ? intensity / maxIntensity : 0;

                        return (
                          <div
                            key={hour}
                            className="w-6 h-6 border border-gray-200"
                            style={{
                              backgroundColor: intensity > 0 ? `rgba(59, 130, 246, ${opacity})` : '#f3f4f6'
                            }}
                            title={`${day} ${hour}:00 - ${intensity} activities`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span>Less</span>
                  <div className="flex gap-1">
                    {[0, 0.25, 0.5, 0.75, 1].map(opacity => (
                      <div
                        key={opacity}
                        className="w-4 h-4 border border-gray-300"
                        style={{ backgroundColor: `rgba(59, 130, 246, ${opacity})` }}
                      />
                    ))}
                  </div>
                  <span>More Activity</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
                  <span className="text-sm">Most active day</span>
                  <span className="font-medium">
                    {dailyActivityData.reduce((max, day) =>
                      day.events > (max.events || 0) ? day : max,
                      dailyActivityData[0] || { events: 0, date: 'N/A' }
                    ).date}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                  <span className="text-sm">Longest session</span>
                  <span className="font-medium">
                    {formatDuration(analyticsData.session_analysis.max_session_time)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 rounded">
                  <span className="text-sm">Most watched video</span>
                  <span className="font-medium truncate max-w-32">
                    {analyticsData.most_watched_videos[0]?.video_title?.substring(0, 20) + '...' || 'N/A'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded">
                  <span className="text-sm">Avg engagement time</span>
                  <span className="font-medium">
                    {engagementData.length > 0
                      ? formatDuration(engagementData.reduce((sum, video) => sum + video.avgTime, 0) / engagementData.length)
                      : '0s'
                    }
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-red-50 rounded">
                  <span className="text-sm">Peak activity hour</span>
                  <span className="font-medium">
                    {analyticsData.hourly_patterns.reduce((max, pattern) =>
                      pattern.activity_count > (max.activity_count || 0) ? pattern : max,
                      analyticsData.hourly_patterns[0] || { hour: 0, activity_count: 0 }
                    ).hour}:00
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-indigo-50 rounded">
                  <span className="text-sm">Consistency score</span>
                  <span className="font-medium">
                    {analyticsData.daily_stats.length > 0
                      ? Math.round((analyticsData.daily_stats.filter(d => d.events_count > 0).length / analyticsData.daily_stats.length) * 100)
                      : 0}%
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
