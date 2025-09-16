"use client"

import PageContainer from '../../components/PageContainer'
import MetricsTable from '@/components/events/MetricsTable'
import { useSearchParams } from 'next/navigation'
import useYouTubePlayer from '../../hooks/useYouTubePlayer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function WatchPage(): JSX.Element {
  const params = useSearchParams()
  const videoId: string = params.get('v') || ''
  const startTime: number = parseInt(params.get('t') || '0', 10)
  const playerState = useYouTubePlayer(videoId, 'video-player', startTime)

  return (
    <PageContainer title="Watch Videos" subtitle="Watch and track YouTube videos with metrics">
      <div className="flex flex-col items-center w-full space-y-8">
        <Card className="w-full max-w-4xl">
          <CardHeader>
            <CardTitle>{playerState.video_title || 'YouTube Player'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div id="video-player" className="w-full aspect-video bg-black" />
          </CardContent>
        </Card>
        {videoId ? <MetricsTable videoId={videoId} /> : null}
      </div>
    </PageContainer>
  )
}