'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Trash2,
  Download,
  Upload,
  CheckSquare,
  Square,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface VideoEvent {
  id: number;
  video_id: string;
  video_title: string;
  current_time: number;
  time: string;
}

interface BulkOperation {
  id: string;
  type: 'delete' | 'export';
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  total: number;
  completed: number;
  errors: string[];
}

export default function BulkOperations(): JSX.Element {
  const { token } = useAuth();
  const [events, setEvents] = useState<VideoEvent[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [operation, setOperation] = useState<BulkOperation | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [token]);

  const fetchEvents = async () => {
    if (!token) return;

    try {
      const data = await apiFetch('/api/video-events/', { token });
      setEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      toast.error('Failed to load video events');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEvents(new Set(events.map(e => e.id)));
    } else {
      setSelectedEvents(new Set());
    }
  };

  const handleSelectEvent = (eventId: number, checked: boolean) => {
    const newSelected = new Set(selectedEvents);
    if (checked) {
      newSelected.add(eventId);
    } else {
      newSelected.delete(eventId);
    }
    setSelectedEvents(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedEvents.size === 0) return;

    setShowConfirm(true);
  };

  const confirmBulkDelete = async () => {
    const eventIds = Array.from(selectedEvents);

    setOperation({
      id: `delete-${Date.now()}`,
      type: 'delete',
      status: 'running',
      progress: 0,
      total: eventIds.length,
      completed: 0,
      errors: []
    });

    setShowConfirm(false);

    try {
      // Process in batches of 50
      const batchSize = 50;
      const batches = [];

      for (let i = 0; i < eventIds.length; i += batchSize) {
        batches.push(eventIds.slice(i, i + batchSize));
      }

      let completed = 0;
      const errors: string[] = [];

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];

        try {
          await apiFetch('/api/video-events/bulk', {
            token,
            method: 'DELETE',
            body: JSON.stringify({ event_ids: batch })
          });

          completed += batch.length;
          setOperation(prev => prev ? {
            ...prev,
            progress: (completed / eventIds.length) * 100,
            completed
          } : null);

        } catch (error) {
          console.error(`Batch ${i + 1} failed:`, error);
          errors.push(`Batch ${i + 1}: ${error.message}`);
          completed += batch.length; // Count as completed even if failed
          setOperation(prev => prev ? {
            ...prev,
            progress: (completed / eventIds.length) * 100,
            completed,
            errors: [...prev.errors, ...errors]
          } : null);
        }
      }

      setOperation(prev => prev ? {
        ...prev,
        status: errors.length > 0 ? 'failed' : 'completed'
      } : null);

      if (errors.length > 0) {
        toast.error(`Bulk delete completed with ${errors.length} errors`);
      } else {
        toast.success(`Successfully deleted ${completed} events`);
      }

      // Refresh the events list
      await fetchEvents();
      setSelectedEvents(new Set());

    } catch (error) {
      console.error('Bulk delete failed:', error);
      setOperation(prev => prev ? { ...prev, status: 'failed' } : null);
      toast.error('Bulk delete failed');
    }
  };

  const handleBulkExport = async () => {
    if (selectedEvents.size === 0) return;

    const selectedEventData = events.filter(e => selectedEvents.has(e.id));

    try {
      // Create CSV content
      const csvContent = [
        'ID,Video ID,Video Title,Current Time,Timestamp',
        ...selectedEventData.map(event => [
          event.id,
          `"${event.video_id}"`,
          `"${event.video_title || ''}"`,
          event.current_time,
          `"${event.time}"`
        ].join(','))
      ].join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.download = `bulk-export-${new Date().toISOString().split('T')[0]}.csv`;
      link.href = URL.createObjectURL(blob);
      link.click();

      toast.success(`Exported ${selectedEventData.length} events to CSV`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export failed');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded animate-pulse w-1/4" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bulk Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            Bulk Operations
            {selectedEvents.size > 0 && (
              <Badge variant="secondary">{selectedEvents.size} selected</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={handleBulkExport}
              disabled={selectedEvents.size === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Selected ({selectedEvents.size})
            </Button>

            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={selectedEvents.size === 0}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected ({selectedEvents.size})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Operation Progress */}
      {operation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {operation.type === 'delete' ? <Trash2 className="h-5 w-5" /> : <Download className="h-5 w-5" />}
              Bulk {operation.type === 'delete' ? 'Delete' : 'Export'} Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {operation.completed} of {operation.total} completed
                </span>
                <Badge variant={
                  operation.status === 'completed' ? 'default' :
                  operation.status === 'failed' ? 'destructive' :
                  'secondary'
                }>
                  {operation.status}
                </Badge>
              </div>

              <Progress value={operation.progress} className="w-full" />

              {operation.errors.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-medium">Errors encountered:</div>
                    <ul className="mt-2 text-sm">
                      {operation.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {operation.status === 'completed' && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Operation completed successfully</span>
                </div>
              )}

              {operation.status === 'failed' && (
                <div className="flex items-center gap-2 text-red-600">
                  <XCircle className="h-4 w-4" />
                  <span className="text-sm">Operation failed</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog */}
      {showConfirm && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Confirm Bulk Delete
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">
              Are you sure you want to delete {selectedEvents.size} video events?
              This action cannot be undone.
            </p>
            <div className="flex items-center gap-4">
              <Button variant="destructive" onClick={confirmBulkDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete {selectedEvents.size} Events
              </Button>
              <Button variant="outline" onClick={() => setShowConfirm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Events List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              Video Events ({events.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSelectAll(selectedEvents.size !== events.length)}
              >
                {selectedEvents.size === events.length ? (
                  <>
                    <Square className="h-4 w-4 mr-2" />
                    Deselect All
                  </>
                ) : (
                  <>
                    <CheckSquare className="h-4 w-4 mr-2" />
                    Select All
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50"
              >
                <Checkbox
                  checked={selectedEvents.has(event.id)}
                  onCheckedChange={(checked) => handleSelectEvent(event.id, checked as boolean)}
                />

                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">
                    {event.video_title || `Video ${event.video_id}`}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {event.video_id} • {Math.floor(event.current_time / 60)}:{(event.current_time % 60).toString().padStart(2, '0')}
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  {new Date(event.time).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>

          {events.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No video events found</p>
              <p className="text-sm">Start watching videos to see events here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
