import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const FASTAPI_ENDPOINT = "http://localhost:8002/api/video-events/";

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
      const res = await fetch(`${FASTAPI_ENDPOINT}${eventId}`, { headers });
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
    <div>
      <h2>Get Event by ID</h2>
      <input type="number" value={eventId} onChange={e => setEventId(e.target.value)} placeholder="Event ID" />
      <button onClick={fetchEvent} disabled={!eventId || loading}>Fetch</button>
      {loading && <div>Loading...</div>}
      {error && <div style={{color:'red'}}>Error: {error.message}</div>}
      {event && (
        <div>
          <div>ID: {event.id}</div>
          <div>Video ID: {event.video_id}</div>
          <div>Current Time: {event.current_time}</div>
          <div>Time: {new Date(event.time).toLocaleString()}</div>
        </div>
      )}
    </div>
  );
}