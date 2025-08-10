import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { apiFetch } from '@/lib/apiClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const FASTAPI_ENDPOINT = "/api/video-events/";

export default function AllEventsTable() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 10
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
  if (error) return (
    <div className="space-y-2">
      <div className="text-red-600 text-sm">Error loading events: {error.message}</div>
      <Button variant="outline" onClick={() => { setLoading(true); setError(null); apiFetch(FASTAPI_ENDPOINT, { token }).then(d=>{ setEvents(Array.isArray(d)?d:[]); setLoading(false)}).catch(e=>{ setError(e); setLoading(false)}) }}>Retry</Button>
    </div>
  )

  const filtered = events.filter(ev => !query || String(ev.video_id).toLowerCase().includes(query.toLowerCase()))
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageClamped = Math.min(page, totalPages)
  const start = (pageClamped - 1) * pageSize
  const rows = filtered.slice(start, start + pageSize)

  return (
    <Card className="p-2 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <Input value={query} onChange={e => { setQuery(e.target.value); setPage(1) }} placeholder="Search by Video ID" className="max-w-xs" />
        <div className="flex items-center gap-2">
          <Button variant="outline" disabled={pageClamped <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Prev</Button>
          <span className="text-sm">Page {pageClamped} / {totalPages}</span>
          <Button variant="outline" disabled={pageClamped >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</Button>
        </div>
      </div>
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
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">No events found</TableCell>
            </TableRow>
          ) : null}
          {rows.map(ev => (
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