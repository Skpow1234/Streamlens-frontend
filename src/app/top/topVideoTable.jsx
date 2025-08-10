"use client"
import TimeBucketSelector from '@/components/TimeBucketSelector'
import useWatchSession from '@/hooks/useWatchSession'
import Link from 'next/link'
import { useState } from 'react'
import useSWR from 'swr'
import { useAuth } from '../../context/AuthContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { apiFetch } from '@/lib/apiClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const FASTAPI_ENDPOINT = "/api/video-events/top"

export default function TopVideoTable () {
    const [bucket, setBucket ]= useState(1)
    const [bucketUnit, setBucketUnit] = useState("weeks")
    const timeBucket = `${bucket} ${bucketUnit}`
    const url = `${FASTAPI_ENDPOINT}?bucket=${timeBucket}`
    const session_id = useWatchSession()
    const { token } = useAuth();

    const fetcher = (url) => apiFetch(url, { token, sessionId: session_id })


    const { data, error, isLoading } = useSWR(url, fetcher)
    const [query, setQuery] = useState('')
    const [page, setPage] = useState(1)
    const pageSize = 10
    
    
 
    if (error) return <div className="text-red-600 text-sm">Failed to load</div>
    if (isLoading) return (
      <div className="w-full space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-48 w-full" />
      </div>
    )

    
    const items = Array.isArray(data) ? data : []
    const filtered = items.filter(val => !query || String(val.video_id).toLowerCase().includes(query.toLowerCase()))
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
    const pageClamped = Math.min(page, totalPages)
    const start = (pageClamped - 1) * pageSize
    const rows = filtered.slice(start, start + pageSize)

    return (
      <div className="w-full space-y-3">
        <TimeBucketSelector bucket={bucket} setBucket={setBucket} bucketUnit={bucketUnit} setBucketUnit={setBucketUnit} />
        <div className="flex items-center justify-between gap-2">
          <Input value={query} onChange={e => { setQuery(e.target.value); setPage(1) }} placeholder="Search by Video ID" className="max-w-xs" />
          <div className="flex items-center gap-2">
            <Button variant="outline" disabled={pageClamped <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Prev</Button>
            <span className="text-sm">Page {pageClamped} / {totalPages}</span>
            <Button variant="outline" disabled={pageClamped >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</Button>
          </div>
        </div>
        <Card className="mt-1 p-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Video</TableHead>
                <TableHead>Total Events</TableHead>
                <TableHead>Max Viewership (min)</TableHead>
                <TableHead>Avg Viewership (min)</TableHead>
                <TableHead>Unique Views</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">No results</TableCell>
                </TableRow>
              ) : null}
              {rows.map((val, idx) => (
                <TableRow key={idx}>
                  <TableCell>{new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(val.time))}</TableCell>
                  <TableCell>
                    <Link className="text-blue-600 underline" href={`/watch?v=${val.video_id}&t=0`}>{val.video_id}</Link>
                  </TableCell>
                  <TableCell>{val.total_events}</TableCell>
                  <TableCell>{(val.max_viewership / 60).toFixed(2)}</TableCell>
                  <TableCell>{(val.avg_viewership / 60).toFixed(2)}</TableCell>
                  <TableCell>{val.unique_views}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    )
}