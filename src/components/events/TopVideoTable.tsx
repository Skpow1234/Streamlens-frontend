"use client"
import TimeBucketSelector from '@/components/TimeBucketSelector'
import useWatchSession from '@/hooks/useWatchSession'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import useSWR from 'swr'
import { useAuth } from '@/context/AuthContext'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { apiFetch } from '@/lib/apiClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const FASTAPI_ENDPOINT = "/api/video-events/top"

interface TopVideo {
  video_id: string
  avg_viewership: number
  max_viewership: number
  total_views: number
  total_events: number
  unique_views: number
  time: string
  [key: string]: any
}

export default function TopVideoTable(): JSX.Element {
  const [bucket, setBucket] = useState<number>(1)
  const [bucketUnit, setBucketUnit] = useState<string>('weeks')
  const timeBucket = `${bucket} ${bucketUnit}`
  const url = `${FASTAPI_ENDPOINT}?bucket=${timeBucket}`
  const session_id = useWatchSession('')
  const { token } = useAuth()

  const fetcher = (url: string) => apiFetch(url, { token, sessionId: session_id })

  const { data, error, isLoading } = useSWR(url, fetcher)
  const [query, setQuery] = useState<string>('')
  const [page, setPage] = useState<number>(1)
  const [sortKey, setSortKey] = useState<string>('time')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const pageSize = 10

  const items: TopVideo[] = useMemo(() => Array.isArray(data) ? data : [], [data])
  const filtered = useMemo(
    () => items.filter(val => !query || String(val.video_id).toLowerCase().includes(query.toLowerCase())),
    [items, query]
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

  if (error) return <div className="text-red-600 text-sm">Failed to load</div>
  if (isLoading) return (
    <div className="w-full space-y-2">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-48 w-full" />
    </div>
  )

  return (
    <div className="w-full space-y-3">
      <TimeBucketSelector bucket={bucket} setBucket={setBucket} bucketUnit={bucketUnit} setBucketUnit={setBucketUnit} />
      <div className="flex items-center justify-between gap-2">
        <Input value={query} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setQuery(e.target.value); setPage(1) }} placeholder="Search by Video ID" className="max-w-xs" type="text" />
        <div className="flex items-center gap-2">
          <Button variant="outline" className="" size="default" disabled={pageClamped <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Prev</Button>
          <span className="text-sm">Page {pageClamped} / {totalPages}</span>
          <Button variant="outline" className="" size="default" disabled={pageClamped >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</Button>
        </div>
      </div>
      <Card className="mt-1 p-2">
        <Table className="">
          <TableHeader className="">
            <TableRow className="">
              <SortHead id="time">Date</SortHead>
              <SortHead id="video_id">Video</SortHead>
              <SortHead id="total_events">Total Events</SortHead>
              <SortHead id="max_viewership">Max Viewership (min)</SortHead>
              <SortHead id="avg_viewership">Avg Viewership (min)</SortHead>
              <SortHead id="unique_views">Unique Views</SortHead>
            </TableRow>
          </TableHeader>
          <TableBody className="">
            {rows.length === 0 ? (
              <TableRow className="">
                <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">No results</TableCell>
              </TableRow>
            ) : null}
            {rows.map((val, idx) => (
              <TableRow key={idx} className="">
                <TableCell className="">{new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(val.time))}</TableCell>
                <TableCell className="">
                  <Link className="text-blue-600 underline" href={`/watch?v=${val.video_id}&t=0`}>{val.video_id}</Link>
                </TableCell>
                <TableCell className="">{val.total_events}</TableCell>
                <TableCell className="">{(val.max_viewership / 60).toFixed(2)}</TableCell>
                <TableCell className="">{(val.avg_viewership / 60).toFixed(2)}</TableCell>
                <TableCell className="">{val.unique_views}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}


