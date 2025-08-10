import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

const FASTAPI_ENDPOINT = "/api/video-events/";

export default function GetEventById() {
  const [eventId, setEventId] = useState('');
  const [event, setEvent] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const fetchEvent = async () => {
    setLoading(true);
    setError(null);
    setEvent(null);
    try {
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8002'
      const res = await fetch(`${base}${FASTAPI_ENDPOINT}${eventId}`, { headers });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setEvent(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-3">
      <h2 className="font-semibold">Get Event by ID</h2>
      <div className="flex gap-2">
        <Input type="number" value={eventId} onChange={e => setEventId(e.target.value)} placeholder="Event ID" />
        <Button onClick={fetchEvent} disabled={!eventId || loading}>{loading ? 'Loading...' : 'Fetch'}</Button>
      </div>
      {error && <Alert variant="destructive"><AlertDescription>{error.message}</AlertDescription></Alert>}
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