"use client"

import PageContainer from '../../components/PageContainer'
import MetricsTable from '@/components/events/MetricsTable'
import LikeButton from '@/components/social/LikeButton'
import ShareButton from '@/components/social/ShareButton'
import CommentsSection from '@/components/social/CommentsSection'
import SaveToPlaylistButton from '@/components/playlists/SaveToPlaylistButton'
import { useSearchParams } from 'next/navigation'
import useYouTubePlayer from '../../hooks/useYouTubePlayer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/context/AuthContext'

export default function WatchPage(): JSX.Element {
  const params = useSearchParams()
  const videoId: string = params.get('v') || ''
  const startTime: number = parseInt(params.get('t') || '0', 10)
  const playerState = useYouTubePlayer(videoId, 'video-player', startTime)
  const { user } = useAuth()

  return (
    <PageContainer title="Watch Videos" subtitle="Watch and track YouTube videos with metrics">
      <div className="flex flex-col items-center w-full space-y-8">
        {/* Video Player */}
        <Card className="w-full max-w-4xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex-1">{playerState.video_title || 'YouTube Player'}</CardTitle>
            <div className="flex items-center gap-2">
              {user && <LikeButton videoId={videoId} size="sm" />}
              {user && <SaveToPlaylistButton videoId={videoId} videoTitle={playerState.video_title} size="sm" />}
              <ShareButton videoId={videoId} currentTime={playerState.current_time} size="sm" />
            </div>
          </CardHeader>
          <CardContent className="">
            <div id="video-player" className="w-full aspect-video bg-black rounded" />
          </CardContent>
        </Card>

        {/* Video Analytics */}
        {videoId ? <MetricsTable videoId={videoId} /> : null}

        {/* Social Features */}
        {videoId && (
          <div className="w-full max-w-4xl">
            <CommentsSection videoId={videoId} currentTime={playerState.current_time} />
          </div>
        )}
      </div>
    </PageContainer>
  )
}