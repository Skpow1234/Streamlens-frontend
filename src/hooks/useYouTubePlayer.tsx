"use client"

import { useCallback, useEffect, useState, useRef } from "react";
import { apiFetch } from '@/lib/apiClient';
import { useAuth } from '@/context/AuthContext';
import useWatchSession from './useWatchSession';

interface PlayerState {
  isReady: boolean
  current_time: number
  video_title: string
  video_state_label: string
  video_state_value: number
}

interface YTPlayer {
  getVideoData(): { title?: string }
  getCurrentTime(): number
  getPlayerState(): number
  destroy(): void
}

interface YTPlayerState {
  [key: string]: number
}

declare global {
  interface Window {
    YT: {
      Player: new (elementId: string, options: any) => YTPlayer
      PlayerState: YTPlayerState
    }
    onYouTubeIframeAPIReady?: () => void
  }
}

function getKeyByValue(object: YTPlayerState, value: number): string | undefined {
    return Object.keys(object).find(key => object[key] === value);
}

const useYouTubePlayer = (videoId: string, elementId?: string, startTime: number = 200, interval: number = 5000): PlayerState => {
    const playerElementId = elementId || "video-player"
    const playerRef = useRef<YTPlayer | null>(null)
    const [playerState, setPlayerState] = useState<PlayerState>({
        isReady: false,
        current_time: 0,
        video_title: '',
        video_state_label: '',
        video_state_value: -10,
    })
    const { token } = useAuth()
    const sessionId = useWatchSession(videoId)

    // Function to send player state to backend
    const sendPlayerEvent = useCallback(async (state: PlayerState) => {
        if (!token || !videoId || !state.isReady) return

        try {
            await apiFetch('/api/video-events/', {
                method: 'POST',
                token,
                sessionId,
                body: JSON.stringify({
                    is_ready: state.isReady,
                    video_id: videoId,
                    video_title: state.video_title,
                    current_time: Math.floor(state.current_time),
                    video_state_label: state.video_state_label,
                    video_state_value: Math.floor(state.video_state_value)
                })
            })
        } catch (error) {
            // Silently fail to avoid interrupting user experience
            console.warn('Failed to send player event:', error)
        }
    }, [token, videoId, sessionId])
    const handleOnStateChange = useCallback(
        () => {
          if (!playerRef.current || !window.YT) return
          const YTPlayerStateObj = window.YT.PlayerState
          const videoData = playerRef.current.getVideoData()
          const currentTimeSeconds = playerRef.current.getCurrentTime()
          const videoStateValue = playerRef.current.getPlayerState()
          const videoStateLabel = getKeyByValue(YTPlayerStateObj, videoStateValue)

          const newState = {
            isReady: true,
            video_title: videoData?.title || '',
            current_time: currentTimeSeconds || 0,
            video_state_label: videoStateLabel || '',
            video_state_value: typeof videoStateValue === 'number' ? videoStateValue : -10,
          }

          setPlayerState(prevState => ({
            ...prevState,
            ...newState
          }))

          // Send event to backend
          sendPlayerEvent(newState)
        },
    [sendPlayerEvent])

    const handleOnReady = useCallback(() => {
      setPlayerState(prevState => ({ ...prevState, isReady: true }))
      handleOnStateChange()
    }, [handleOnStateChange])

    // load the youtube api script
    // embed youtube video player
    // track changes to video

    useEffect(() => {
      if (!videoId) return
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      const firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)

      const prevHandler = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => {
        const videoOptions = {
          height: '390',
          width: '640',
          videoId: videoId,
          playerVars: { playsinline: 1, start: startTime },
          events: { onReady: handleOnReady, onStateChange: handleOnStateChange },
        }
        playerRef.current = new window.YT.Player(playerElementId, videoOptions)
      }

      return () => {
        window.onYouTubeIframeAPIReady = prevHandler
        try {
          if (playerRef.current && playerRef.current.destroy) {
            playerRef.current.destroy()
          }
        } catch {}
        // best-effort remove script
        try { tag.parentNode && tag.parentNode.removeChild(tag) } catch {}
      }
    }, [videoId, playerElementId, startTime, handleOnReady, handleOnStateChange])

    useEffect(() => {
      if (!playerRef.current) return
      const intervalId = setInterval(() => {
        handleOnStateChange()
      }, interval)
      return () => clearInterval(intervalId)
    }, [interval, handleOnStateChange])


    return playerState
}

export default useYouTubePlayer;