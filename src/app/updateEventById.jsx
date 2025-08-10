import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { apiFetch } from '@/lib/apiClient'
import { toast } from 'sonner'

const FASTAPI_ENDPOINT = "/api/video-events/";

export default function UpdateEventById() {
  const [eventId, setEventId] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [videoStateLabel, setVideoStateLabel] = useState('');
  const [videoStateValue, setVideoStateValue] = useState('');
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { token } = useAuth();

  const updateEvent = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await apiFetch(`${FASTAPI_ENDPOINT}${eventId}`, {
        method: 'PUT',
        token,
        body: JSON.stringify({
          current_time: parseFloat(currentTime),
          video_state_label: videoStateLabel,
          video_state_value: parseInt(videoStateValue, 10)
        })
      })
      setSuccess('Event updated successfully!');
      toast.success('Event updated')
    } catch (err) {
      setError(err);
      toast.error(err.message || 'Failed to update event')
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-3">
      <h2 className="font-semibold">Update Event by ID</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <Input type="number" value={eventId} onChange={e => setEventId(e.target.value)} placeholder="Event ID" />
        <Input type="text" value={currentTime} onChange={e => setCurrentTime(e.target.value)} placeholder="Current Time (seconds)" />
        <Input type="text" value={videoStateLabel} onChange={e => setVideoStateLabel(e.target.value)} placeholder="Video State Label" />
        <Input type="number" value={videoStateValue} onChange={e => setVideoStateValue(e.target.value)} placeholder="Video State Value" />
      </div>
      <Button onClick={updateEvent} disabled={!eventId || loading}>{loading ? 'Updating...' : 'Update'}</Button>
      {error && <Alert variant="destructive"><AlertDescription>{error.message}</AlertDescription></Alert>}
      {success && <Alert><AlertDescription>{success}</AlertDescription></Alert>}
    </div>
  );
}