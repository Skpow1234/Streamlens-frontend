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
    
    
 
    if (error) return <div>failed to load</div>
    if (isLoading) return (
      <div className="w-full space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-48 w-full" />
      </div>
    )

    
    return (
      <div className="w-full">
        <TimeBucketSelector bucket={bucket} setBucket={setBucket} bucketUnit={bucketUnit} setBucketUnit={setBucketUnit} />
        <Card className="mt-4 p-2">
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
              {data.map((val, idx) => (
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