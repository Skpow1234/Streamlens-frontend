'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/apiClient';
import PageContainer from '@/components/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Filter, SortAsc, SortDesc, Clock, Play, Eye, Calendar, X } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface SearchResult {
  video_id: string;
  video_title: string;
  watch_count: number;
  total_watch_time: number;
  last_watched: string;
  average_watch_time: number;
}

export default function SearchPage(): JSX.Element {
  const { token } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [sortBy, setSortBy] = useState('last_watched');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [minWatchTime, setMinWatchTime] = useState('');
  const [maxWatchTime, setMaxWatchTime] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const searchVideos = useCallback(async () => {
    if (!token || !query.trim()) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        query: query.trim(),
        sort_by: sortBy,
        sort_order: sortOrder,
        limit: '50'
      });

      if (minWatchTime) params.append('min_watch_time', minWatchTime);
      if (maxWatchTime) params.append('max_watch_time', maxWatchTime);
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const data = await apiFetch(`/api/video-events/search?${params.toString()}`, { token });
      setResults(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('Search failed. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [token, query, sortBy, sortOrder, minWatchTime, maxWatchTime, startDate, endDate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        searchVideos();
      } else {
        setResults([]);
      }
    }, 300); // Debounce search

    return () => clearTimeout(timer);
  }, [query, searchVideos]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchVideos();
    }
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

  const clearFilters = () => {
    setMinWatchTime('');
    setMaxWatchTime('');
    setStartDate('');
    setEndDate('');
    setSortBy('last_watched');
    setSortOrder('desc');
  };

  const hasActiveFilters = minWatchTime || maxWatchTime || startDate || endDate ||
    sortBy !== 'last_watched' || sortOrder !== 'desc';

  return (
    <PageContainer title="Advanced Search" subtitle="Find videos in your watch history">
      <div className="space-y-6">
        {/* Search Input */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by video title or ID..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
                {hasActiveFilters && <Badge variant="secondary" className="ml-1">Active</Badge>}
              </Button>
              <Button onClick={searchVideos} disabled={!query.trim()}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-4 p-4 border rounded-lg bg-gray-50 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Advanced Filters</h3>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Clear All
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Sort By */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Sort By</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="last_watched">Last Watched</SelectItem>
                        <SelectItem value="watch_count">Watch Count</SelectItem>
                        <SelectItem value="total_watch_time">Total Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort Order */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Order</label>
                    <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desc">
                          <div className="flex items-center gap-2">
                            <SortDesc className="h-4 w-4" />
                            Descending
                          </div>
                        </SelectItem>
                        <SelectItem value="asc">
                          <div className="flex items-center gap-2">
                            <SortAsc className="h-4 w-4" />
                            Ascending
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Min Watch Time */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Min Watch Time (seconds)</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={minWatchTime}
                      onChange={(e) => setMinWatchTime(e.target.value)}
                    />
                  </div>

                  {/* Max Watch Time */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Max Watch Time (seconds)</label>
                    <Input
                      type="number"
                      placeholder="3600"
                      value={maxWatchTime}
                      onChange={(e) => setMaxWatchTime(e.target.value)}
                    />
                  </div>

                  {/* Date Range */}
                  <div>
                    <label className="block text-sm font-medium mb-1">From Date</label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">To Date</label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Search Results</span>
              {results.length > 0 && (
                <Badge variant="secondary">{results.length} videos found</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                    <Skeleton className="h-16 w-24 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-4">
                {results.map((video) => (
                  <div key={video.video_id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0">
                      <img
                        src={`https://img.youtube.com/vi/${video.video_id}/mqdefault.jpg`}
                        alt={video.video_title}
                        className="w-24 h-16 object-cover rounded"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-video.png'; // Fallback image
                        }}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/watch?v=${video.video_id}`}
                        className="text-lg font-medium text-blue-600 hover:text-blue-800 hover:underline block truncate"
                      >
                        {video.video_title}
                      </Link>
                      <p className="text-sm text-muted-foreground truncate">
                        Video ID: {video.video_id}
                      </p>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {video.watch_count}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDuration(video.total_watch_time)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Play className="h-4 w-4" />
                        {Math.floor(video.average_watch_time)}s avg
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(video.last_watched).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      <Link href={`/watch?v=${video.video_id}`}>
                        <Button size="sm">
                          <Play className="h-4 w-4 mr-2" />
                          Watch
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : query.trim() ? (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No videos found</p>
                <p className="text-sm">Try adjusting your search terms or filters</p>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Start searching for videos</p>
                <p className="text-sm">Enter a video title or ID to begin</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
