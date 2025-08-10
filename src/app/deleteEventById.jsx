import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { apiFetch } from '@/lib/apiClient'

const FASTAPI_ENDPOINT = "/api/video-events/";

export default function DeleteEventById() {
  const [eventId, setEventId] = useState('');
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const deleteEvent = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await apiFetch(`${FASTAPI_ENDPOINT}${eventId}`, { method: 'DELETE', token })
      setSuccess('Event deleted successfully!');
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-3">
      <h2 className="font-semibold">Delete Event by ID</h2>
      <Input type="number" value={eventId} onChange={e => setEventId(e.target.value)} placeholder="Event ID" />
      <Button onClick={deleteEvent} disabled={!eventId || loading} variant="destructive">{loading ? 'Deleting...' : 'Delete'}</Button>
      {error && <Alert variant="destructive"><AlertDescription>{error.message}</AlertDescription></Alert>}
      {success && <Alert><AlertDescription>{success}</AlertDescription></Alert>}
    </div>
  );
}