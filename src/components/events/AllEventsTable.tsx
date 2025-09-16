import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { apiFetch } from '@/lib/apiClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Search, Filter, X } from 'lucide-react'
import { format } from 'date-fns'

const FASTAPI_ENDPOINT = "/api/video-events/"

interface Event {
  id: number
  video_id: string
  current_time: number
  time: string
  video_state_label: string
  video_state_value: number
  [key: string]: any
}

export default function AllEventsTable(): JSX.Element {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)
  const [query, setQuery] = useState<string>('')
  const [page, setPage] = useState<number>(1)
  const [sortKey, setSortKey] = useState<string>('time')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const pageSize = 10
  const { token } = useAuth()

  useEffect(() => {
    if (!token) return

    apiFetch(FASTAPI_ENDPOINT, { token })
      .then(data => {
        setEvents(Array.isArray(data) ? data : [])
        setLoading(false)
        setError(null)
      })
      .catch(err => {
        console.error('Failed to fetch events:', err)
        setError(err instanceof Error ? err : new Error('Failed to load events'))
        setLoading(false)
        setEvents([])
      })
  }, [token])

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

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const SortHead = ({ id, children }: { id: string; children: React.ReactNode }) => (
    <TableHead className="cursor-pointer select-none" onClick={() => toggleSort(id)}>
      <span className="inline-flex items-center gap-1">
        {children}
        {sortKey === id ? (sortDir === 'asc' ? '▲' : '▼') : ''}
      </span>
    </TableHead>
  )

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
          className=""
          size="default"
          onClick={async () => {
            setLoading(true)
            setError(null)
            try {
              const data = await apiFetch(FASTAPI_ENDPOINT, { token })
              setEvents(Array.isArray(data) ? data : [])
            } catch (err) {
              console.error('Retry failed:', err)
              setError(err instanceof Error ? err : new Error('Failed to load events'))
              setEvents([])
            } finally {
              setLoading(false)
            }
          }}
        >
          Retry
        </Button>
      </div>
    )
  }

  return (
    <Card className="p-2 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <Input value={query} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setQuery(e.target.value); setPage(1) }} placeholder="Search by Video ID" className="max-w-xs" type="text" />
        <div className="flex items-center gap-2">
          <Button variant="outline" className="" size="default" disabled={pageClamped <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Prev</Button>
          <span className="text-sm">Page {pageClamped} / {totalPages}</span>
          <Button variant="outline" className="" size="default" disabled={pageClamped >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</Button>
        </div>
      </div>
      <Table className="">
        <TableHeader className="">
          <TableRow className="">
            <SortHead id="id">ID</SortHead>
            <SortHead id="video_id">Video ID</SortHead>
            <SortHead id="current_time">Current Time</SortHead>
            <SortHead id="time">Time</SortHead>
          </TableRow>
        </TableHeader>
        <TableBody className="">
          {rows.length === 0 ? (
            <TableRow className="">
              <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">No events found</TableCell>
            </TableRow>
          ) : null}
          {rows.map(ev => (
            <TableRow key={ev.id} className="">
              <TableCell className="">{ev.id}</TableCell>
              <TableCell className="">{ev.video_id}</TableCell>
              <TableCell className="">{ev.current_time}</TableCell>
              <TableCell className="">{new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(ev.time))}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}


