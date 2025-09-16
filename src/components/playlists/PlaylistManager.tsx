'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Trash2, Plus, Search, X } from 'lucide-react';
import { toast } from 'sonner';

interface Playlist {
  id: number;
  name: string;
  description: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

interface VideoItem {
  id: number;
  video_id: string;
  video_title: string;
  added_at: string;
  position: number;
}

interface PlaylistManagerProps {
  playlist: Playlist | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function PlaylistManager({ playlist, onClose, onSaved }: PlaylistManagerProps) {
  const { token } = useAuth();
  const [name, setName] = useState(playlist?.name || '');
  const [description, setDescription] = useState(playlist?.description || '');
  const [isPublic, setIsPublic] = useState(playlist?.is_public || false);
  const [items, setItems] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    if (playlist) {
      fetchPlaylistDetails();
    }
  }, [playlist]);

  const fetchPlaylistDetails = async () => {
    if (!playlist || !token) return;

    try {
      setLoading(true);
      const response = await apiFetch(`/api/playlists/${playlist.id}`, { token });
      setItems(response.items);
    } catch (error) {
      console.error('Failed to fetch playlist details:', error);
      toast.error('Failed to load playlist details');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Playlist name is required');
      return;
    }

    try {
      setSaving(true);

      if (playlist) {
        // Update existing playlist
        await apiFetch(`/api/playlists/${playlist.id}`, {
          token,
          method: 'PUT',
          body: JSON.stringify({
            name: name.trim(),
            description: description.trim(),
            is_public: isPublic
          })
        });
        toast.success('Playlist updated successfully!');
      } else {
        // Create new playlist
        await apiFetch('/api/playlists/', {
          token,
          method: 'POST',
          body: JSON.stringify({
            name: name.trim(),
            description: description.trim(),
            is_public: isPublic
          })
        });
        toast.success('Playlist created successfully!');
      }

      onSaved();
    } catch (error) {
      console.error('Failed to save playlist:', error);
      toast.error('Failed to save playlist');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!playlist || !confirm('Are you sure you want to delete this playlist? This action cannot be undone.')) {
      return;
    }

    try {
      await apiFetch(`/api/playlists/${playlist.id}`, {
        token,
        method: 'DELETE'
      });
      toast.success('Playlist deleted successfully!');
      onSaved();
    } catch (error) {
      console.error('Failed to delete playlist:', error);
      toast.error('Failed to delete playlist');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      // For now, we'll search in user's recent videos
      // In a real app, you might have a dedicated search endpoint
      const response = await apiFetch('/api/video-events/', { token });
      const videos = Array.isArray(response) ? response : [];

      // Simple search by video title
      const results = videos
        .filter((video: any) =>
          video.video_title?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 10); // Limit results

      setSearchResults(results);
    } catch (error) {
      console.error('Failed to search videos:', error);
      toast.error('Failed to search videos');
    }
  };

  const handleAddVideo = async (video: any) => {
    if (!playlist) return;

    try {
      await apiFetch(`/api/playlists/${playlist.id}/items`, {
        token,
        method: 'POST',
        body: JSON.stringify({
          video_id: video.video_id,
          video_title: video.video_title
        })
      });

      toast.success('Video added to playlist!');
      fetchPlaylistDetails();
      setSearchResults([]);
      setSearchQuery('');
      setShowSearch(false);
    } catch (error) {
      console.error('Failed to add video:', error);
      toast.error('Failed to add video to playlist');
    }
  };

  const handleRemoveVideo = async (itemId: number) => {
    if (!playlist) return;

    try {
      await apiFetch(`/api/playlists/${playlist.id}/items/${itemId}`, {
        token,
        method: 'DELETE'
      });

      toast.success('Video removed from playlist!');
      fetchPlaylistDetails();
    } catch (error) {
      console.error('Failed to remove video:', error);
      toast.error('Failed to remove video from playlist');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading playlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onClose}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Playlists
            </Button>
            <div>
              <h1 className="text-2xl font-bold">
                {playlist ? 'Edit Playlist' : 'Create New Playlist'}
              </h1>
              <p className="text-muted-foreground">
                {playlist ? 'Update your playlist details' : 'Create a new playlist for your videos'}
              </p>
            </div>
          </div>
          {playlist && (
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Playlist
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Playlist Settings */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Playlist Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="My Awesome Playlist"
                    maxLength={100}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell others about this playlist..."
                    maxLength={500}
                    rows={3}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Public Playlist</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow others to view this playlist
                    </p>
                  </div>
                  <Switch checked={isPublic} onCheckedChange={setIsPublic} />
                </div>

                <Button onClick={handleSave} disabled={saving} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : (playlist ? 'Update Playlist' : 'Create Playlist')}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Playlist Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Playlist Videos ({items.length})</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSearch(!showSearch)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Videos
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search/Add Videos */}
                {showSearch && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <div className="flex gap-2 mb-4">
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search your watched videos..."
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      />
                      <Button onClick={handleSearch}>
                        <Search className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" onClick={() => setShowSearch(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Search Results */}
                    {searchResults.length > 0 && (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {searchResults.map((video: any) => (
                          <div
                            key={video.id}
                            className="flex items-center justify-between p-2 bg-white rounded border"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {video.video_title || `Video ${video.video_id}`}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Watched {new Date(video.time).toLocaleDateString()}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleAddVideo(video)}
                              disabled={items.some(item => item.video_id === video.video_id)}
                            >
                              Add
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Video List */}
                {items.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="mb-4">No videos in this playlist yet</p>
                    <Button onClick={() => setShowSearch(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Video
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {items.map((item, index) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Badge variant="secondary" className="flex-shrink-0">
                            {index + 1}
                          </Badge>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {item.video_title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Added {new Date(item.added_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`/watch?v=${item.video_id}`, '_blank')}
                          >
                            Watch
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveVideo(item.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
