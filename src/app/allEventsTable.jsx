import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const FASTAPI_ENDPOINT = "http://localhost:8002/api/video-events/";

export default function AllEventsTable() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    fetch(FASTAPI_ENDPOINT, { headers })
      .then(res => res.json())
      .then(data => {
        setEvents(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, [token]);

  if (loading) return <div>Loading all events...</div>;
  if (error) return <div>Error loading events: {error.message}</div>;

  return (
    <div>
      <h2>All YouTube Watch Events</h2>
      <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th>ID</th>
            <th>Video ID</th>
            <th>Current Time</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {events.map(ev => (
            <tr key={ev.id}>
              <td>{ev.id}</td>
              <td>{ev.video_id}</td>
              <td>{ev.current_time}</td>
              <td>{new Date(ev.time).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}