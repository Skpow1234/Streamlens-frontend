'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
  Pie,
  AreaChart,
  Area,
  ComposedChart,
  Legend,
  Brush
} from 'recharts';
import {
  CalendarDays,
  Clock,
  TrendingUp,
  Activity,
  BarChart3,
  Download,
  RefreshCw,
  Filter,
  Settings,
  Play,
  Pause,
  Calendar as CalendarIcon,
  FileImage,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

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

interface ChartConfig {
  type: 'line' | 'bar' | 'area' | 'pie' | 'scatter' | 'composed';
  dataKey: string;
  color: string;
  showBrush?: boolean;
  showLegend?: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658', '#ff7300'];

export default function EnhancedAnalytics() {
  const { token } = useAuth();
  const chartRef = useRef<HTMLDivElement>(null);

  // Data state
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [activeTab, setActiveTab] = useState('overview');
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area'>('line');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'custom'>('30d');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Auto-refresh functionality
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (autoRefresh && token) {
      interval = setInterval(() => {
        fetchAnalyticsData();
      }, 30000); // Refresh every 30 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, token]);

  const fetchAnalyticsData = async (showLoadingState = true) => {
    if (!token) return;

    if (showLoadingState) setIsRefreshing(true);

    try {
      const data = await apiFetch('/api/video-events/stats/user', { token });
      setAnalyticsData(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
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

  // Enhanced data preparation with filtering
  const getFilteredData = (data: any[], dateField = 'date') => {
    if (!data || timeRange === 'custom') return data;

    const now = new Date();
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;

    return data.filter(item => {
      const itemDate = new Date(item[dateField]);
      const diffTime = now.getTime() - itemDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= days;
    });
  };

  // Chart export functionality
  const exportChartAsPNG = async (chartId: string) => {
    try {
      const canvas = document.querySelector(`[data-chart-id="${chartId}"] canvas`) as HTMLCanvasElement;
      if (!canvas) {
        toast.error('Chart not found for export');
        return;
      }

      const link = document.createElement('a');
      link.download = `${chartId}-${format(new Date(), 'yyyy-MM-dd')}.png`;
      link.href = canvas.toDataURL();
      link.click();

      toast.success('Chart exported as PNG');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export chart');
    }
  };

  const exportChartAsSVG = async (chartId: string) => {
    try {
      const svgElement = document.querySelector(`[data-chart-id="${chartId}"] svg`) as SVGElement;
      if (!svgElement) {
        toast.error('Chart not found for export');
        return;
      }

      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });

      const link = document.createElement('a');
      link.download = `${chartId}-${format(new Date(), 'yyyy-MM-dd')}.svg`;
      link.href = URL.createObjectURL(svgBlob);
      link.click();

      toast.success('Chart exported as SVG');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export chart');
    }
  };

  const exportDataAsCSV = (data: any[], filename: string) => {
    try {
      const headers = Object.keys(data[0] || {});
      const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.download = `${filename}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      link.href = URL.createObjectURL(blob);
      link.click();

      toast.success('Data exported as CSV');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export data');
    }
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.name}: ${entry.value}${entry.name.includes('Time') ? ' min' : ''}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Chart rendering functions
  const renderChart = (data: any[], config: ChartConfig, height = 300) => {
    const ChartComponent = {
      line: LineChart,
      bar: BarChart,
      area: AreaChart,
      composed: ComposedChart
    }[config.type] || LineChart;

    const DataComponent = {
      line: Line,
      bar: Bar,
      area: Area,
      composed: Line
    }[config.type] || Line;

    return (
      <ResponsiveContainer width="100%" height={height}>
        <ChartComponent data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          {config.showLegend && <Legend />}
          {config.showBrush && <Brush />}
          <DataComponent
            type="monotone"
            dataKey={config.dataKey}
            stroke={config.color}
            fill={config.color}
            fillOpacity={config.type === 'area' ? 0.3 : 1}
          />
        </ChartComponent>
      </ResponsiveContainer>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded animate-pulse w-1/4" />
          </CardHeader>
          <CardContent>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2 mb-4" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !analyticsData) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="text-red-500 text-lg mb-4">
            {error || 'Failed to load analytics data'}
          </div>
          <Button onClick={() => fetchAnalyticsData()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const heatmapData = prepareHeatmapData();
  const engagementData = prepareEngagementChartData();
  const dailyActivityData = prepareDailyActivityData();

  return (
    <div className="space-y-6" ref={chartRef}>
      {/* Controls Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Analytics Dashboard
              {isRefreshing && <RefreshCw className="h-4 w-4 animate-spin" />}
            </CardTitle>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Time Range Selector */}
              <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="custom">Custom range</SelectItem>
                </SelectContent>
              </Select>

              {/* Chart Type Selector */}
              <Select value={chartType} onValueChange={(value: any) => setChartType(value)}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">Line</SelectItem>
                  <SelectItem value="bar">Bar</SelectItem>
                  <SelectItem value="area">Area</SelectItem>
                </SelectContent>
              </Select>

              {/* Control Buttons */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={autoRefresh ? "bg-green-50 border-green-200" : ""}
              >
                {autoRefresh ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchAnalyticsData(false)}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Custom Date Range */}
          {timeRange === 'custom' && (
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                <span className="text-sm font-medium">From:</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      {startDate ? format(startDate, 'MMM dd, yyyy') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">To:</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      {endDate ? format(endDate, 'MMM dd, yyyy') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          {/* Status Badge */}
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="text-xs">
              Last updated: {format(new Date(), 'HH:mm:ss')}
            </Badge>
            {autoRefresh && (
              <Badge variant="outline" className="text-xs text-green-600">
                Auto-refresh ON
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>

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

      {/* Interactive Charts */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="activity">Daily Activity</TabsTrigger>
          <TabsTrigger value="engagement">Video Engagement</TabsTrigger>
          <TabsTrigger value="patterns">Activity Patterns</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" />
                  Daily Activity Overview
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportChartAsPNG('daily-activity')}
                  >
                    <FileImage className="h-4 w-4 mr-2" />
                    PNG
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportChartAsSVG('daily-activity')}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    SVG
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportDataAsCSV(getFilteredData(dailyActivityData), 'daily-activity')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    CSV
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div data-chart-id="daily-activity" className="w-full">
                {renderChart(
                  getFilteredData(dailyActivityData),
                  {
                    type: chartType,
                    dataKey: 'events',
                    color: '#8884d8',
                    showBrush: dailyActivityData.length > 10,
                    showLegend: true
                  },
                  350
                )}
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                <p>Shows your daily video watching activity and total watch time over the selected period.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Video Engagement Analysis
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportChartAsPNG('video-engagement')}
                  >
                    <FileImage className="h-4 w-4 mr-2" />
                    PNG
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportDataAsCSV(engagementData, 'video-engagement')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    CSV
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div data-chart-id="video-engagement" className="w-full">
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={engagementData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="avgTime" fill="#8884d8" name="Avg Watch Time (s)" />
                    <Bar dataKey="maxTime" fill="#82ca9d" name="Max Watch Time (s)" />
                    <Line type="monotone" dataKey="events" stroke="#ff7300" name="Total Events" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                <p>Analyzes engagement across your most watched videos, showing average and maximum watch times.</p>
              </div>
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
