import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const FASTAPI_ENDPOINT = "http://localhost:8002/api/video-events/";

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
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${FASTAPI_ENDPOINT}${eventId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          current_time: parseFloat(currentTime),
          video_state_label: videoStateLabel,
          video_state_value: parseInt(videoStateValue, 10)
        })
      });
      if (!res.ok) throw new Error(await res.text());
      setSuccess('Event updated successfully!');
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Update Event by ID</h2>
      <input type="number" value={eventId} onChange={e => setEventId(e.target.value)} placeholder="Event ID" />
      <input type="text" value={currentTime} onChange={e => setCurrentTime(e.target.value)} placeholder="Current Time" />
      <input type="text" value={videoStateLabel} onChange={e => setVideoStateLabel(e.target.value)} placeholder="Video State Label" />
      <input type="number" value={videoStateValue} onChange={e => setVideoStateValue(e.target.value)} placeholder="Video State Value" />
      <button onClick={updateEvent} disabled={!eventId || loading}>Update</button>
      {loading && <div>Updating...</div>}
      {error && <div style={{color:'red'}}>Error: {error.message}</div>}
      {success && <div style={{color:'green'}}>{success}</div>}
    </div>
  );
}