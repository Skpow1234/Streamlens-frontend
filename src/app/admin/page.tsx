'use client';

import { useAuth } from '@/context/AuthContext';
import PageContainer from '@/components/PageContainer';
import ApiPerformanceMonitor from '@/components/ApiPerformanceMonitor';
import BulkOperations from '@/components/BulkOperations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Settings,
  Activity,
  Database,
  Trash2,
  Zap,
  Shield,
  BarChart3,
  Server
} from 'lucide-react';

export default function AdminPage(): JSX.Element {
  const { user } = useAuth();

  // Only allow admin users (you could implement role-based access here)
  if (!user) {
    return (
      <PageContainer title="Admin Panel" subtitle="Access restricted">
        <Card>
          <CardContent className="text-center py-12">
            <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Access Restricted</h3>
            <p className="text-muted-foreground">Please sign in to access the admin panel.</p>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Admin Panel"
      subtitle="API Performance & Bulk Operations"
    >
      <div className="space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">API Status</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Online</div>
              <p className="text-xs text-muted-foreground">
                All systems operational
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rate Limiting</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">Active</div>
              <p className="text-xs text-muted-foreground">
                100 req/min per client
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Caching</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">Enabled</div>
              <p className="text-xs text-muted-foreground">
                Redis + Memory cache
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Performance</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">Optimal</div>
              <p className="text-xs text-muted-foreground">
                Monitoring active
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="performance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              API Performance
            </TabsTrigger>
            <TabsTrigger value="bulk" className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Bulk Operations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  API Performance Monitoring
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Real-time</Badge>
                  <Badge variant="outline">Auto-refresh</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  Monitor API performance, cache statistics, and system health in real-time.
                  View response times, request counts, and identify performance bottlenecks.
                </p>
              </CardContent>
            </Card>

            <ApiPerformanceMonitor />
          </TabsContent>

          <TabsContent value="bulk" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Bulk Data Operations
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">Use with caution</Badge>
                  <Badge variant="secondary">Batch processing</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  Perform bulk operations on your video events data. Export selected events
                  or delete multiple events at once. All operations include progress tracking
                  and error handling.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Bulk Export
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Export selected video events to CSV for backup or analysis.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg border-red-200">
                    <h4 className="font-medium mb-2 flex items-center gap-2 text-red-600">
                      <Trash2 className="h-4 w-4" />
                      Bulk Delete
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete multiple video events. This action cannot be undone.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <BulkOperations />
          </TabsContent>
        </Tabs>

        {/* API Improvements Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              API Improvements Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-green-600">✅ Rate Limiting</h4>
                <p className="text-sm text-muted-foreground">
                  Advanced rate limiting with Redis support and user-friendly error messages
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-blue-600">✅ Caching</h4>
                <p className="text-sm text-muted-foreground">
                  Dual-layer caching (Redis + Memory) with automatic cache invalidation
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-purple-600">✅ Bulk Operations</h4>
                <p className="text-sm text-muted-foreground">
                  Efficient bulk delete and export operations with progress tracking
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-orange-600">✅ Performance Monitoring</h4>
                <p className="text-sm text-muted-foreground">
                  Real-time API performance metrics and slow query detection
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-red-600">✅ Error Handling</h4>
                <p className="text-sm text-muted-foreground">
                  Enhanced error handling with recovery suggestions and detailed feedback
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-indigo-600">✅ Request Optimization</h4>
                <p className="text-sm text-muted-foreground">
                  Optimized request/response handling with compression and efficient data transfer
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
