import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { usePreferences } from '@/context/PreferencesContext'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { apiFetch } from '@/lib/apiClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { CalendarIcon, Search, Filter, X, Download, FileText, File } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

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
  const [videoTitleSearch, setVideoTitleSearch] = useState<string>('')
  const [dateFrom, setDateFrom] = useState<Date | undefined>()
  const [dateTo, setDateTo] = useState<Date | undefined>()
  const [videoStateFilter, setVideoStateFilter] = useState<string>('all')
  const [page, setPage] = useState<number>(1)
  const [sortKey, setSortKey] = useState<string>('time')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [showFilters, setShowFilters] = useState<boolean>(false)
  const { token } = useAuth()
  const { preferences } = usePreferences()
  const pageSize = preferences.itemsPerPage
  const showExportNotifications = preferences.notifications.exportComplete

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
    () => events.filter(ev => {
      // Video ID search (legacy)
      if (query && !String(ev.video_id).toLowerCase().includes(query.toLowerCase())) {
        return false
      }

      // Video title search
      if (videoTitleSearch && !String(ev.video_title || '').toLowerCase().includes(videoTitleSearch.toLowerCase())) {
        return false
      }

      // Date range filter
      if (dateFrom || dateTo) {
        const eventDate = new Date(ev.time)
        if (dateFrom && eventDate < dateFrom) return false
        if (dateTo && eventDate > dateTo) return false
      }

      // Video state filter
      if (videoStateFilter !== 'all' && ev.video_state_label !== videoStateFilter) {
        return false
      }

      return true
    }),
    [events, query, videoTitleSearch, dateFrom, dateTo, videoStateFilter]
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

  const clearFilters = () => {
    setQuery('')
    setVideoTitleSearch('')
    setDateFrom(undefined)
    setDateTo(undefined)
    setVideoStateFilter('all')
    setPage(1)
  }

  const hasActiveFilters = query || videoTitleSearch || dateFrom || dateTo || videoStateFilter !== 'all'

  const exportToCSV = (data: Event[]) => {
    const headers = ['ID', 'Video ID', 'Video Title', 'Current Time', 'Video State', 'Time']
    const csvContent = [
      headers.join(','),
      ...data.map(event => [
        event.id,
        `"${event.video_id}"`,
        `"${(event.video_title || '').replace(/"/g, '""')}"`,
        event.current_time,
        `"${event.video_state_label}"`,
        `"${event.time}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `video_events_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportToJSON = (data: Event[]) => {
    const jsonContent = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `video_events_${new Date().toISOString().split('T')[0]}.json`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      if (showExportNotifications) {
        toast.info('Preparing export...')
      }

      // For large datasets, we might want to fetch all data or use pagination
      // For now, we'll export the current filtered view
      const dataToExport = filtered.length > 0 ? filtered : events

      if (format === 'csv') {
        exportToCSV(dataToExport)
        if (showExportNotifications) {
          toast.success('CSV export completed!')
        }
      } else {
        exportToJSON(dataToExport)
        if (showExportNotifications) {
          toast.success('JSON export completed!')
        }
      }
    } catch (error) {
      console.error('Export failed:', error)
      toast.error('Export failed. Please try again.')
    }
  }

  return (
    <Card className="p-4 space-y-4">
      {/* Search and Filter Controls */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Video Events</h3>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleExport('csv')} className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('json')} className="flex items-center gap-2">
                  <File className="h-4 w-4" />
                  Export as JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters && <span className="ml-1 bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">Active</span>}
            </Button>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-red-600 hover:text-red-700">
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Basic Search */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={query}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setQuery(e.target.value); setPage(1) }}
              placeholder="Search by Video ID"
              className="pl-9"
              type="text"
            />
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            {/* Video Title Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Video Title</label>
              <Input
                value={videoTitleSearch}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setVideoTitleSearch(e.target.value); setPage(1) }}
                placeholder="Search by title"
                type="text"
              />
            </div>

            {/* Date From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={(date) => { setDateFrom(date); setPage(1) }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={(date) => { setDateTo(date); setPage(1) }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Video State Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Video State</label>
              <Select value={videoStateFilter} onValueChange={(value) => { setVideoStateFilter(value); setPage(1) }}>
                <SelectTrigger>
                  <SelectValue placeholder="All states" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  <SelectItem value="PLAYING">Playing</SelectItem>
                  <SelectItem value="PAUSED">Paused</SelectItem>
                  <SelectItem value="ENDED">Ended</SelectItem>
                  <SelectItem value="BUFFERING">Buffering</SelectItem>
                  <SelectItem value="CUED">Cued</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          {filtered.length === events.length
            ? `Showing all ${events.length} events`
            : `Showing ${filtered.length} of ${events.length} events`
          }
          {hasActiveFilters && ' (filtered)'}
        </span>
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


