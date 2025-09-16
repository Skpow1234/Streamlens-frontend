import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { apiFetch } from '@/lib/apiClient'
import { toast } from 'sonner'

const FASTAPI_ENDPOINT = "/api/video-events/";

export default function DeleteEventById(): JSX.Element {
  const [eventId, setEventId] = useState<string>('');
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { token } = useAuth();

  const deleteEvent = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await apiFetch(`${FASTAPI_ENDPOINT}${eventId}`, { method: 'DELETE', token })
      setSuccess('Event deleted successfully!');
      toast.success('Event deleted')
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete event'));
      toast.error((err as Error).message || 'Failed to delete event')
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-3">
      <h2 className="font-semibold">Delete Event by ID</h2>
      <Input type="number" value={eventId} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEventId(e.target.value)} placeholder="Event ID" className="" />
      <Button onClick={deleteEvent} disabled={!eventId || loading} variant="destructive" className="" size="default">{loading ? 'Deleting...' : 'Delete'}</Button>
      {error && <Alert variant="destructive" className=""><AlertDescription className="">{error.message}</AlertDescription></Alert>}
      {success && <Alert className="" variant="default"><AlertDescription className="">{success}</AlertDescription></Alert>}
    </div>
  );
}