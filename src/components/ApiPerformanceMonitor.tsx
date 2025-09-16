'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch, apiCacheStats } from '@/lib/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Activity,
  Database,
  Zap,
  RefreshCw,
  Trash2,
  Clock,
  Server,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

interface PerformanceMetrics {
  metrics: Record<string, {
    request_count: number;
    avg_response_time: number;
    total_response_time: number;
  }>;
  total_endpoints: number;
  slow_query_threshold: number;
}

interface CacheStats {
  redis_enabled: boolean;
  memory_cache_size: number;
  cache_hit_ratio: string;
  uptime: string;
}

export default function ApiPerformanceMonitor(): JSX.Element {
  const { token } = useAuth();
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchPerformanceData = async () => {
    if (!token) return;

    try {
      const [metricsData, cacheData] = await Promise.all([
        apiFetch('/api/performance/metrics', { token }),
        apiFetch('/api/cache/stats', { token })
      ]);

      setMetrics(metricsData);
      setCacheStats(cacheData);
    } catch (error) {
      console.error('Failed to fetch performance data:', error);
      toast.error('Failed to load performance data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformanceData();
  }, [token]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchPerformanceData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [autoRefresh, token]);

  const handleClearCache = async () => {
    try {
      await apiFetch('/api/cache/clear', { token, method: 'POST' });
      await fetchPerformanceData();
      toast.success('Cache cleared successfully');
    } catch (error) {
      console.error('Failed to clear cache:', error);
      toast.error('Failed to clear cache');
    }
  };

  const getPerformanceColor = (avgTime: number, threshold: number) => {
    if (avgTime > threshold * 2) return 'text-red-600';
    if (avgTime > threshold) return 'text-yellow-600';
    return 'text-green-600';
  };

  const formatTime = (milliseconds: number) => {
    return `${(milliseconds * 1000).toFixed(1)}ms`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded animate-pulse w-1/3" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              API Performance Monitor
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={autoRefresh ? "bg-green-50 border-green-200" : ""}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
                {autoRefresh ? 'Auto' : 'Manual'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchPerformanceData}
                disabled={autoRefresh}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Cache Statistics */}
      {cacheStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Cache Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {cacheStats.redis_enabled ? 'Redis' : 'Memory'}
                </div>
                <div className="text-sm text-muted-foreground">Cache Type</div>
                <Badge variant={cacheStats.redis_enabled ? "default" : "secondary"} className="mt-1">
                  {cacheStats.redis_enabled ? 'External' : 'Local'}
                </Badge>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {cacheStats.memory_cache_size}
                </div>
                <div className="text-sm text-muted-foreground">Cached Items</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {apiCacheStats.size()}
                </div>
                <div className="text-sm text-muted-foreground">Frontend Cache</div>
              </div>
            </div>

            <div className="mt-4 flex justify-center">
              <Button variant="outline" onClick={handleClearCache}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All Cache
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* API Endpoint Performance */}
      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              API Endpoint Performance
              <Badge variant="secondary">{metrics.total_endpoints} endpoints</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(metrics.metrics)
                .sort(([, a], [, b]) => b.request_count - a.request_count)
                .slice(0, 10)
                .map(([endpoint, data]) => (
                  <div key={endpoint} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{endpoint}</div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                        <span>{data.request_count} requests</span>
                        <span className={getPerformanceColor(data.avg_response_time, metrics.slow_query_threshold)}>
                          {formatTime(data.avg_response_time)} avg
                        </span>
                        <span>{formatTime(data.total_response_time)} total</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {data.avg_response_time > metrics.slow_query_threshold && (
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      )}
                      <div className="text-right text-xs">
                        <div className="font-medium">{data.request_count}</div>
                        <div className="text-muted-foreground">calls</div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-sm">
                <div className="font-medium">Performance Threshold</div>
                <div className="text-muted-foreground">
                  Slow queries: >{formatTime(metrics.slow_query_threshold)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Real-time Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <div className="font-medium">API Status</div>
                <div className="text-sm text-muted-foreground">Operational</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div>
                <div className="font-medium">Cache Status</div>
                <div className="text-sm text-muted-foreground">
                  {cacheStats?.redis_enabled ? 'Redis Connected' : 'Memory Cache'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <div>
                <div className="font-medium">Rate Limiting</div>
                <div className="text-sm text-muted-foreground">Active</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <div>
                <div className="font-medium">Auto-refresh</div>
                <div className="text-sm text-muted-foreground">
                  {autoRefresh ? 'Enabled' : 'Disabled'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
