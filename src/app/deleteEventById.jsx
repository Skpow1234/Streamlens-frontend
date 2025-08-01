import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const FASTAPI_ENDPOINT = "http://localhost:8002/api/video-events/";

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
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${FASTAPI_ENDPOINT}${eventId}`, {
        method: 'DELETE',
        headers
      });
      if (!res.ok) throw new Error(await res.text());
      setSuccess('Event deleted successfully!');
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Delete Event by ID</h2>
      <input type="number" value={eventId} onChange={e => setEventId(e.target.value)} placeholder="Event ID" />
      <button onClick={deleteEvent} disabled={!eventId || loading}>Delete</button>
      {loading && <div>Deleting...</div>}
      {error && <div style={{color:'red'}}>Error: {error.message}</div>}
      {success && <div style={{color:'green'}}>{success}</div>}
    </div>
  );
}