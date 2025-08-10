import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { apiFetch } from '@/lib/apiClient'

const FASTAPI_ENDPOINT = "/api/video-events/";

export default function AllEventsTable() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    apiFetch(FASTAPI_ENDPOINT, { token })
      .then(data => {
        setEvents(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, [token]);

  if (loading) return (
    <div className="w-full space-y-2">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-48 w-full" />
    </div>
  )
  if (error) return <div>Error loading events: {error.message}</div>;

  return (
    <Card className="p-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Video ID</TableHead>
            <TableHead>Current Time</TableHead>
            <TableHead>Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map(ev => (
            <TableRow key={ev.id}>
              <TableCell>{ev.id}</TableCell>
              <TableCell>{ev.video_id}</TableCell>
              <TableCell>{ev.current_time}</TableCell>
              <TableCell>{new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(ev.time))}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}