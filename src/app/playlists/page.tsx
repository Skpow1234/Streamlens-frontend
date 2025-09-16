'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/apiClient';
import PageContainer from '@/components/PageContainer';
import PlaylistManager from '@/components/playlists/PlaylistManager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { List, Plus, Play } from 'lucide-react';
import Link from 'next/link';

interface Playlist {
  id: number;
  name: string;
  description: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  item_count: number;
}

export default function PlaylistsPage(): JSX.Element {
  const { token } = useAuth();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showManager, setShowManager] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);

  useEffect(() => {
    if (!token) return;
    fetchPlaylists();
  }, [token]);

  const fetchPlaylists = async () => {
    try {
      const response = await apiFetch('/api/playlists/', { token });
      setPlaylists(response.playlists);
    } catch (err) {
      console.error('Failed to fetch playlists:', err);
      setError('Failed to load playlists');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlaylist = () => {
    setSelectedPlaylist(null);
    setShowManager(true);
  };

  const handleEditPlaylist = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setShowManager(true);
  };

  const handlePlaylistSaved = () => {
    setShowManager(false);
    setSelectedPlaylist(null);
    fetchPlaylists();
  };

  if (showManager) {
    return (
      <PlaylistManager
        playlist={selectedPlaylist}
        onClose={() => setShowManager(false)}
        onSaved={handlePlaylistSaved}
      />
    );
  }

  if (loading) {
    return (
      <PageContainer title="My Playlists" subtitle="Organize your favorite videos">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-20 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="My Playlists" subtitle="Organize your favorite videos">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Playlists</h2>
          <p className="text-muted-foreground">Create and manage your video collections</p>
        </div>
        <Button onClick={handleCreatePlaylist} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Playlist
        </Button>
      </div>

      {/* Playlists Grid */}
      {playlists.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <List className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No playlists yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first playlist to start organizing your favorite videos
            </p>
            <Button onClick={handleCreatePlaylist} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Your First Playlist
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.map((playlist) => (
            <Card key={playlist.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{playlist.name}</CardTitle>
                    {playlist.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {playlist.description}
                      </p>
                    )}
                  </div>
                  {playlist.is_public && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Public
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {playlist.item_count} video{playlist.item_count !== 1 ? 's' : ''}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditPlaylist(playlist)}
                    >
                      Edit
                    </Button>
                    <Link href={`/playlists/${playlist.id}`}>
                      <Button variant="default" size="sm" className="flex items-center gap-1">
                        <Play className="h-3 w-3" />
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  Updated {new Date(playlist.updated_at).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Stats Footer */}
      {playlists.length > 0 && (
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{playlists.length}</div>
              <p className="text-xs text-muted-foreground">Total Playlists</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {playlists.reduce((sum, p) => sum + p.item_count, 0)}
              </div>
              <p className="text-xs text-muted-foreground">Total Videos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {playlists.filter(p => p.is_public).length}
              </div>
              <p className="text-xs text-muted-foreground">Public Playlists</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {Math.max(...playlists.map(p => new Date(p.updated_at).getTime())) > 0
                  ? new Date(Math.max(...playlists.map(p => new Date(p.updated_at).getTime()))).toLocaleDateString()
                  : 'N/A'
                }
              </div>
              <p className="text-xs text-muted-foreground">Last Updated</p>
            </CardContent>
          </Card>
        </div>
      )}
    </PageContainer>
  );
}
