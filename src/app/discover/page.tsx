'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import PageContainer from '@/components/PageContainer';
import VideoRecommendations from '@/components/search/VideoRecommendations';
import TrendingVideos from '@/components/search/TrendingVideos';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Compass, Sparkles, TrendingUp, Search } from 'lucide-react';
import Link from 'next/link';

export default function DiscoverPage(): JSX.Element {
  const { user } = useAuth();

  return (
    <PageContainer title="Discover" subtitle="Find new videos and explore your interests">
      <div className="space-y-6">
        {/* Quick Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/search">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center gap-2">
                  <Search className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-medium">Advanced Search</div>
                    <div className="text-xs text-muted-foreground">Find specific videos</div>
                  </div>
                </Button>
              </Link>

              <Link href="/playlists">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center gap-2">
                  <Compass className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-medium">My Playlists</div>
                    <div className="text-xs text-muted-foreground">Organized collections</div>
                  </div>
                </Button>
              </Link>

              <Link href="/all-events">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center gap-2">
                  <Compass className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-medium">All Events</div>
                    <div className="text-xs text-muted-foreground">Browse your history</div>
                  </div>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Discover Tabs */}
        <Tabs defaultValue="recommendations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              For You
            </TabsTrigger>
            <TabsTrigger value="trending" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Trending
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recommendations" className="space-y-6">
            <VideoRecommendations showHeader={false} />
          </TabsContent>

          <TabsContent value="trending" className="space-y-6">
            <TrendingVideos showHeader={false} />
          </TabsContent>
        </Tabs>

        {/* Stats Card */}
        {user && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Compass className="h-5 w-5" />
                Your Discovery Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">0</div>
                  <div className="text-sm text-muted-foreground">Videos Watched Today</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">0</div>
                  <div className="text-sm text-muted-foreground">New Discoveries</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">0</div>
                  <div className="text-sm text-muted-foreground">Playlists Created</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageContainer>
  );
}
