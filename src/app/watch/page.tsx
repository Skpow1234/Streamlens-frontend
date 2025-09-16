"use client"

import PageContainer from '../../components/PageContainer'
import MetricsTable from '@/components/events/MetricsTable'
import LikeButton from '@/components/social/LikeButton'
import ShareButton from '@/components/social/ShareButton'
import CommentsSection from '@/components/social/CommentsSection'
import SaveToPlaylistButton from '@/components/playlists/SaveToPlaylistButton'
import { useSearchParams } from 'next/navigation'
import useYouTubePlayer from '../../hooks/useYouTubePlayer'
import useWatchProgress from '../../hooks/useWatchProgress'
import KeyboardShortcutsHelp from '@/components/ui/KeyboardShortcutsHelp'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/context/AuthContext'
import { Keyboard, RotateCcw } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

export default function WatchPage(): JSX.Element {
  const params = useSearchParams()
  const videoId: string = params.get('v') || ''
  const requestedStartTime: number = parseInt(params.get('t') || '0', 10)
  const { user } = useAuth()
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false)
  const [playerReady, setPlayerReady] = useState(false)

  // Use watch progress hook
  const { hasProgress, getResumeTime, saveProgress } = useWatchProgress(videoId)

  // Determine start time - prefer resume time over URL parameter
  const startTime = hasProgress && !requestedStartTime ? getResumeTime() : requestedStartTime

  const playerState = useYouTubePlayer(videoId, 'video-player', startTime)

  // Auto-save progress every 30 seconds when playing
  useEffect(() => {
    if (!playerState.isReady || !videoId) return

    const saveInterval = setInterval(() => {
      if (playerState.current_time > 0) {
        saveProgress(playerState.current_time, 0) // Duration will be updated when available
      }
    }, 30000) // Save every 30 seconds

    return () => clearInterval(saveInterval)
  }, [playerState.isReady, playerState.current_time, videoId, saveProgress])

  // Mark player as ready
  useEffect(() => {
    if (playerState.isReady && !playerReady) {
      setPlayerReady(true)
      if (hasProgress && startTime > 0) {
        toast.info(`Resumed from ${Math.floor(startTime / 60)}:${(startTime % 60).toString().padStart(2, '0')}`)
      }
    }
  }, [playerState.isReady, playerReady, hasProgress, startTime])

  return (
    <PageContainer title="Watch Videos" subtitle="Watch and track YouTube videos with metrics">
      <div className="flex flex-col items-center w-full space-y-8">
        {/* Video Player */}
        <Card className="w-full max-w-4xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                {playerState.video_title || 'YouTube Player'}
                {hasProgress && (
                  <Badge variant="secondary" className="text-xs">
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Resume Available
                  </Badge>
                )}
              </CardTitle>
              {playerState.isReady && (
                <p className="text-sm text-muted-foreground mt-1">
                  Duration: {playerState.current_time > 0 ? `${Math.floor(playerState.current_time / 60)}:${(playerState.current_time % 60).toString().padStart(2, '0')}` : 'Loading...'}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowKeyboardHelp(true)}
                className="flex items-center gap-1"
              >
                <Keyboard className="h-4 w-4" />
                Shortcuts
              </Button>
              {user && <LikeButton videoId={videoId} size="sm" />}
              {user && <SaveToPlaylistButton videoId={videoId} videoTitle={playerState.video_title} size="sm" />}
              <ShareButton videoId={videoId} currentTime={playerState.current_time} size="sm" />
            </div>
          </CardHeader>
          <CardContent className="">
            <div id="video-player" className="w-full aspect-video bg-black rounded relative">
              {!playerState.isReady && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                    <p>Loading video...</p>
                  </div>
                </div>
              )}
            </div>
            {playerState.isReady && (
              <div className="mt-4 text-sm text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>💡 Tip: Press <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Space</kbd> to play/pause</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowKeyboardHelp(true)}
                    className="text-xs"
                  >
                    View all shortcuts
                  </Button>
                </div>
              </div>
            )}
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

        {/* Keyboard Shortcuts Help Modal */}
        <KeyboardShortcutsHelp
          isOpen={showKeyboardHelp}
          onClose={() => setShowKeyboardHelp(false)}
        />
      </div>
    </PageContainer>
  )
}