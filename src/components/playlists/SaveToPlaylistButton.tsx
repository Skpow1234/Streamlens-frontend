'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, List } from 'lucide-react';
import { toast } from 'sonner';

interface Playlist {
  id: number;
  name: string;
  description: string;
  item_count: number;
}

interface SaveToPlaylistButtonProps {
  videoId: string;
  videoTitle: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
}

export default function SaveToPlaylistButton({
  videoId,
  videoTitle,
  size = 'md',
  variant = 'outline'
}: SaveToPlaylistButtonProps) {
  const { token } = useAuth();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (!token || !dropdownOpen) return;
    fetchPlaylists();
  }, [token, dropdownOpen]);

  const fetchPlaylists = async () => {
    try {
      const response = await apiFetch('/api/playlists/', { token });
      setPlaylists(response.playlists);
    } catch (error) {
      console.error('Failed to fetch playlists:', error);
    }
  };

  const handleSaveToPlaylist = async (playlistId: number) => {
    try {
      setLoading(true);
      await apiFetch(`/api/playlists/${playlistId}/items`, {
        token,
        method: 'POST',
        body: JSON.stringify({
          video_id: videoId,
          video_title: videoTitle
        })
      });

      toast.success('Video saved to playlist!');
      setDropdownOpen(false);
    } catch (error: any) {
      console.error('Failed to save to playlist:', error);
      if (error.message?.includes('already in playlist')) {
        toast.error('Video is already in this playlist');
      } else {
        toast.error('Failed to save video to playlist');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!token) return null;

  return (
    <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className="flex items-center gap-2">
          <List className="h-4 w-4" />
          Save to Playlist
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64">
        {playlists.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No playlists yet. Create one first!
          </div>
        ) : (
          <>
            {playlists.map((playlist) => (
              <DropdownMenuItem
                key={playlist.id}
                onClick={() => handleSaveToPlaylist(playlist.id)}
                disabled={loading}
                className="flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{playlist.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {playlist.item_count} videos
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
            <div className="border-t mt-2 pt-2">
              <DropdownMenuItem
                onClick={() => window.location.href = '/playlists'}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create New Playlist
              </DropdownMenuItem>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
