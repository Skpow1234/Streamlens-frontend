import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { apiFetch } from '@/lib/apiClient'
import { toast } from 'sonner'

const FASTAPI_ENDPOINT = "/api/video-events/";

interface Event {
  id: number
  video_id: string
  current_time: number
  time: string
}

export default function GetEventById(): JSX.Element {
  const [eventId, setEventId] = useState<string>('');
  const [event, setEvent] = useState<Event | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { token } = useAuth();

  const fetchEvent = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    setEvent(null);
    try {
      const data = await apiFetch(`${FASTAPI_ENDPOINT}${eventId}`, { token })
      setEvent(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch event'));
      toast.error((err as Error).message || 'Failed to fetch event')
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-3">
      <h2 className="font-semibold">Get Event by ID</h2>
      <div className="flex gap-2">
        <Input type="number" value={eventId} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEventId(e.target.value)} placeholder="Event ID" className="" />
        <Button onClick={fetchEvent} disabled={!eventId || loading} className="" variant="default" size="default">{loading ? 'Loading...' : 'Fetch'}</Button>
      </div>
      {error && <Alert variant="destructive" className=""><AlertDescription className="">{error.message}</AlertDescription></Alert>}
      {event && (
        <Card className="p-3 space-y-1">
          <div><span className="font-medium">ID:</span> {event.id}</div>
          <div><span className="font-medium">Video ID:</span> {event.video_id}</div>
          <div><span className="font-medium">Current Time:</span> {event.current_time}</div>
          <div><span className="font-medium">Time:</span> {new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(event.time))}</div>
        </Card>
      )}
    </div>
  );
}