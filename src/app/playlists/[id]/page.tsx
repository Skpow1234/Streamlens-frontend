'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/apiClient';
import PageContainer from '@/components/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Play, Clock, Calendar, Edit } from 'lucide-react';
import Link from 'next/link';

interface Playlist {
  id: number;
  name: string;
  description: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

interface PlaylistItem {
  id: number;
  video_id: string;
  video_title: string;
  added_at: string;
  position: number;
}

interface PlaylistDetails {
  playlist: Playlist;
  items: PlaylistItem[];
  total_items: number;
}

export default function PlaylistViewPage(): JSX.Element {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const [playlistDetails, setPlaylistDetails] = useState<PlaylistDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const playlistId = params.id as string;

  useEffect(() => {
    if (!token || !playlistId) return;
    fetchPlaylistDetails();
  }, [token, playlistId]);

  const fetchPlaylistDetails = async () => {
    try {
      const response = await apiFetch(`/api/playlists/${playlistId}`, { token });
      setPlaylistDetails(response);
    } catch (err) {
      console.error('Failed to fetch playlist details:', err);
      setError('Failed to load playlist');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    // For now, just navigate back to playlists page
    // In the future, we could open the manager in edit mode
    router.push('/playlists');
  };

  if (loading) {
    return (
      <PageContainer title="Loading Playlist..." subtitle="">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-16 w-24" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    );
  }

  if (error || !playlistDetails) {
    return (
      <PageContainer title="Playlist Not Found" subtitle="Unable to load playlist">
        <div className="max-w-4xl mx-auto">
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-red-500 text-lg mb-4">
                {error || 'Playlist not found or access denied'}
              </div>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => router.push('/playlists')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Playlists
                </Button>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    );
  }

  const { playlist, items } = playlistDetails;

  return (
    <PageContainer title={playlist.name} subtitle={playlist.description || 'Your curated video collection'}>
      <div className="max-w-4xl mx-auto">
        {/* Playlist Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => router.push('/playlists')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Playlists
          </Button>
          <Button onClick={handleEdit} variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit Playlist
          </Button>
        </div>

        {/* Playlist Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{playlist.name}</CardTitle>
                {playlist.description && (
                  <p className="text-muted-foreground mt-2">{playlist.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {playlist.is_public && (
                  <Badge variant="secondary">Public</Badge>
                )}
                <Badge variant="outline">{items.length} videos</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Created {new Date(playlist.created_at).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Updated {new Date(playlist.updated_at).toLocaleDateString()}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Videos List */}
        {items.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-muted-foreground">
                <Play className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No videos yet</h3>
                <p className="mb-4">This playlist is empty. Add some videos to get started!</p>
                <Button onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Add Videos
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Videos in this playlist</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {/* Video Number */}
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-lg font-bold text-blue-600">
                      {index + 1}
                    </div>

                    {/* Video Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium truncate">
                        {item.video_title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Added {new Date(item.added_at).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex-shrink-0 flex gap-2">
                      <Link href={`/watch?v=${item.video_id}`}>
                        <Button>
                          <Play className="h-4 w-4 mr-2" />
                          Watch
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="mt-6 flex gap-4 justify-center">
          <Button variant="outline" onClick={() => router.push('/playlists')}>
            View All Playlists
          </Button>
          <Button onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit This Playlist
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
