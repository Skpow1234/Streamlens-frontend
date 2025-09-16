'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Comment {
  id: number;
  user_id: number;
  username: string;
  content: string;
  timestamp?: number;
  created_at: string;
  updated_at: string;
}

interface CommentsSectionProps {
  videoId: string;
  currentTime?: number;
}

export default function CommentsSection({ videoId, currentTime }: CommentsSectionProps) {
  const { token, user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [videoId]);

  const fetchComments = async () => {
    try {
      const response = await apiFetch(`/api/social/videos/${videoId}/comments`);
      setComments(response.comments);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !token) return;

    setSubmitting(true);
    try {
      const timestamp = currentTime && currentTime > 0 ? currentTime : undefined;

      await apiFetch(`/api/social/videos/${videoId}/comments`, {
        token,
        method: 'POST',
        body: JSON.stringify({
          content: newComment.trim(),
          timestamp
        })
      });

      setNewComment('');
      toast.success('Comment posted!');
      fetchComments();
    } catch (error) {
      console.error('Failed to post comment:', error);
      toast.error('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = async (commentId: number) => {
    if (!editContent.trim() || !token) return;

    try {
      await apiFetch(`/api/social/comments/${commentId}`, {
        token,
        method: 'PUT',
        body: JSON.stringify({ content: editContent.trim() })
      });

      setEditingComment(null);
      setEditContent('');
      toast.success('Comment updated!');
      fetchComments();
    } catch (error) {
      console.error('Failed to edit comment:', error);
      toast.error('Failed to update comment');
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!token) return;

    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      await apiFetch(`/api/social/comments/${commentId}`, {
        token,
        method: 'DELETE'
      });

      toast.success('Comment deleted!');
      fetchComments();
    } catch (error) {
      console.error('Failed to delete comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  const startEditing = (comment: Comment) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
  };

  const cancelEditing = () => {
    setEditingComment(null);
    setEditContent('');
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const formatTimestamp = (timestamp?: number) => {
    if (!timestamp) return '';
    const minutes = Math.floor(timestamp / 60);
    const seconds = Math.floor(timestamp % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* New Comment Form */}
        {token && user && (
          <div className="space-y-2">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-20"
            />
            <div className="flex justify-between items-center">
              {currentTime && currentTime > 0 && (
                <Badge variant="secondary">
                  At {formatTimestamp(currentTime)}
                </Badge>
              )}
              <Button
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || submitting}
                size="sm"
                className="flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                {submitting ? 'Posting...' : 'Post Comment'}
              </Button>
            </div>
          </div>
        )}

        {!token && (
          <div className="text-center py-4 text-muted-foreground">
            Please sign in to post comments
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{comment.username}</span>
                    <Badge variant="outline" className="text-xs">
                      {formatTimeAgo(comment.created_at)}
                    </Badge>
                    {comment.timestamp && (
                      <Badge variant="secondary" className="text-xs">
                        {formatTimestamp(comment.timestamp)}
                      </Badge>
                    )}
                  </div>
                  {token && user && comment.user_id === user.id && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditing(comment)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteComment(comment.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {editingComment === comment.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="min-h-16"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleEditComment(comment.id)}
                        size="sm"
                      >
                        Save
                      </Button>
                      <Button
                        onClick={cancelEditing}
                        variant="outline"
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm">{comment.content}</p>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
