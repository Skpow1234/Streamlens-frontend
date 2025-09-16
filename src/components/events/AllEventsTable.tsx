import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { apiFetch } from '@/lib/apiClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const FASTAPI_ENDPOINT = "/api/video-events/"

export default function AllEventsTable() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [sortKey, setSortKey] = useState('time')
  const [sortDir, setSortDir] = useState('desc')
  const pageSize = 10
  const { token } = useAuth()

  useEffect(() => {
    apiFetch(FASTAPI_ENDPOINT, { token })
      .then(data => {
        setEvents(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(err => {
        setError(err)
        setLoading(false)
      })
  }, [token])

  if (loading) {
    return (
      <div className="w-full space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-2">
        <div className="text-red-600 text-sm">Error loading events: {error.message}</div>
        <Button
          variant="outline"
          onClick={() => {
            setLoading(true)
            setError(null)
            apiFetch(FASTAPI_ENDPOINT, { token })
              .then(d => {
                setEvents(Array.isArray(d) ? d : [])
                setLoading(false)
              })
              .catch(e => {
                setError(e)
                setLoading(false)
              })
          }}
        >
          Retry
        </Button>
      </div>
    )
  }

  const filtered = useMemo(
    () => events.filter(ev => !query || String(ev.video_id).toLowerCase().includes(query.toLowerCase())),
    [events, query]
  )

  const sorted = useMemo(() => {
    const arr = [...filtered]
    arr.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1
      let av = a[sortKey]
      let bv = b[sortKey]
      if (sortKey === 'time') {
        av = new Date(a.time).getTime()
        bv = new Date(b.time).getTime()
      }
      if (typeof av === 'string') av = av.toLowerCase()
      if (typeof bv === 'string') bv = bv.toLowerCase()
      if (av < bv) return -1 * dir
      if (av > bv) return 1 * dir
      return 0
    })
    return arr
  }, [filtered, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const pageClamped = Math.min(page, totalPages)
  const start = (pageClamped - 1) * pageSize
  const rows = sorted.slice(start, start + pageSize)

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const SortHead = ({ id, children }) => (
    <TableHead className="cursor-pointer select-none" onClick={() => toggleSort(id)}>
      <span className="inline-flex items-center gap-1">
        {children}
        {sortKey === id ? (sortDir === 'asc' ? '▲' : '▼') : ''}
      </span>
    </TableHead>
  )

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
            <SortHead id="id">ID</SortHead>
            <SortHead id="video_id">Video ID</SortHead>
            <SortHead id="current_time">Current Time</SortHead>
            <SortHead id="time">Time</SortHead>
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
  )
}


