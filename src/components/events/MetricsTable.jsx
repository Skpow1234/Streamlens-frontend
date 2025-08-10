"use client"
import TimeBucketSelector from '@/components/TimeBucketSelector'
import useWatchSession from '@/hooks/useWatchSession'
import { useMemo, useState } from 'react'
import useSWR from 'swr'
import { useAuth } from '@/context/AuthContext'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { apiFetch } from '@/lib/apiClient'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip as RTooltip, CartesianGrid } from 'recharts'

const FASTAPI_ENDPOINT = "/api/video-events/"

export default function MetricsTable ({videoId}) {
  if (!videoId) return null

  const [bucket, setBucket] = useState(1)
  const [bucketUnit, setBucketUnit] = useState('weeks')
  const timeBucket = `${bucket} ${bucketUnit}`
  const url = `${FASTAPI_ENDPOINT}${videoId}?bucket=${timeBucket}`
  const session_id = useWatchSession(videoId)
  const { token } = useAuth()

  const fetcher = (url) => apiFetch(url, { headers: {}, token, sessionId: session_id })

  const { data, error, isLoading } = useSWR(url, fetcher)
  const rows = Array.isArray(data) ? data : []

  const chartData = useMemo(
    () => rows.map(d => ({
      time: new Date(d.time).toLocaleString(),
      avgMin: Number((d.avg_viewership / 60).toFixed(2)),
      maxMin: Number((d.max_viewership / 60).toFixed(2))
    })),
    [rows]
  )

  if (error) return <div className="text-red-600 text-sm">Failed to load</div>
  if (isLoading) return (
    <div className="w-full space-y-2">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-48 w-full" />
    </div>
  )

  return (
    <div className="w-full space-y-4">
      <TimeBucketSelector bucket={bucket} setBucket={setBucket} bucketUnit={bucketUnit} setBucketUnit={setBucketUnit} />
      <Card className="p-4">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" minTickGap={20} />
              <YAxis />
              <RTooltip />
              <Line type="monotone" dataKey="avgMin" stroke="#8884d8" dot={false} name="Avg (min)" />
              <Line type="monotone" dataKey="maxMin" stroke="#82ca9d" dot={false} name="Max (min)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card className="mt-2 p-2">
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
            {rows.map((val, idx) => (
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


