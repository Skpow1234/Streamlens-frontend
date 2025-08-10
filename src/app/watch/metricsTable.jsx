"use client"
import TimeBucketSelector from '@/components/TimeBucketSelector'
import useWatchSession from '@/hooks/useWatchSession'
import { useState } from 'react'
import useSWR from 'swr'
import { useAuth } from '../../context/AuthContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card } from '@/components/ui/card'

const FASTAPI_ENDPOINT = "/api/video-events/"

export default function MetricsTable ({videoId}) {
    if (!videoId) {
        return 
    }
    const [bucket, setBucket ]= useState(1)
    const [bucketUnit, setBucketUnit] = useState("weeks")
    const timeBucket = `${bucket} ${bucketUnit}`
    const url = `${FASTAPI_ENDPOINT}${videoId}?bucket=${timeBucket}`
    const session_id = useWatchSession(videoId)
    const { token } = useAuth();

    const fetcher = (url) => {
        const headers = {
            'Content-Type': 'application/json',
            'X-Session-ID': session_id,
        }
        if (token) headers['Authorization'] = `Bearer ${token}`
        return fetch(process.env.NEXT_PUBLIC_API_BASE_URL ? `${process.env.NEXT_PUBLIC_API_BASE_URL}${url}` : `http://localhost:8002${url}`, { headers }).then(res => res.json())
    }


    const { data, error, isLoading } = useSWR(url, fetcher)
    const safeData = Array.isArray(data) ? data : []
    
 
    if (error) return <div>failed to load</div>
    if (isLoading) return <div>loading...</div>

    
    return (
      <div className="w-full">
        <TimeBucketSelector bucket={bucket} setBucket={setBucket} bucketUnit={bucketUnit} setBucketUnit={setBucketUnit} />
        <Card className="mt-4 p-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Total Events</TableHead>
                <TableHead>Max Viewership (min)</TableHead>
                <TableHead>Avg Viewership (min)</TableHead>
                <TableHead>Unique Views</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {safeData.map((val, idx) => (
                <TableRow key={idx}>
                  <TableCell>{new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(val.time))}</TableCell>
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