"use client"

import { useCallback, useEffect, useState, useRef } from "react";
import { apiFetch } from '@/lib/apiClient';
import { useAuth } from '@/context/AuthContext';
import useWatchSession from './useWatchSession';
import { toast } from 'sonner';

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

    // Keyboard shortcuts handler
    const handleKeyboardShortcuts = useCallback((event: KeyboardEvent) => {
      // Only handle shortcuts when not typing in an input/textarea
      const activeElement = document.activeElement;
      const isInputFocused = activeElement?.tagName === 'INPUT' ||
                            activeElement?.tagName === 'TEXTAREA' ||
                            activeElement?.hasAttribute('contenteditable');

      if (isInputFocused || !playerRef.current) return;

      switch (event.code) {
        case 'Space':
          event.preventDefault();
          // Toggle play/pause
          if (playerRef.current.getPlayerState() === window.YT.PlayerState.PLAYING) {
            playerRef.current.pauseVideo();
            toast.info('Paused');
          } else {
            playerRef.current.playVideo();
            toast.info('Playing');
          }
          break;

        case 'KeyF':
          event.preventDefault();
          // Toggle fullscreen
          const playerElement = document.getElementById(playerElementId);
          if (playerElement) {
            if (document.fullscreenElement) {
              document.exitFullscreen();
            } else {
              playerElement.requestFullscreen();
            }
          }
          break;

        case 'KeyM':
          event.preventDefault();
          // Toggle mute
          if (playerRef.current.isMuted()) {
            playerRef.current.unMute();
            toast.info('Unmuted');
          } else {
            playerRef.current.mute();
            toast.info('Muted');
          }
          break;

        case 'ArrowLeft':
          event.preventDefault();
          // Rewind 10 seconds
          const currentTime = playerRef.current.getCurrentTime();
          playerRef.current.seekTo(Math.max(0, currentTime - 10));
          toast.info('Rewound 10s');
          break;

        case 'ArrowRight':
          event.preventDefault();
          // Forward 10 seconds
          const currentTimeForward = playerRef.current.getCurrentTime();
          playerRef.current.seekTo(currentTimeForward + 10);
          toast.info('Forwarded 10s');
          break;

        case 'ArrowUp':
          event.preventDefault();
          // Increase volume
          const currentVolume = playerRef.current.getVolume();
          playerRef.current.setVolume(Math.min(100, currentVolume + 10));
          toast.info(`Volume: ${Math.min(100, currentVolume + 10)}%`);
          break;

        case 'ArrowDown':
          event.preventDefault();
          // Decrease volume
          const currentVolumeDown = playerRef.current.getVolume();
          playerRef.current.setVolume(Math.max(0, currentVolumeDown - 10));
          toast.info(`Volume: ${Math.max(0, currentVolumeDown - 10)}%`);
          break;

        case 'Digit0':
          event.preventDefault();
          // Restart video
          playerRef.current.seekTo(0);
          toast.info('Restarted video');
          break;

        case 'Digit1':
        case 'Digit2':
        case 'Digit3':
        case 'Digit4':
        case 'Digit5':
        case 'Digit6':
        case 'Digit7':
        case 'Digit8':
        case 'Digit9':
          event.preventDefault();
          // Jump to percentage of video
          const percentage = parseInt(event.code.replace('Digit', '')) * 10;
          const duration = playerRef.current.getDuration();
          playerRef.current.seekTo((duration * percentage) / 100);
          toast.info(`Jumped to ${percentage}%`);
          break;
      }
    }, [playerElementId]);

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

    // Add keyboard event listeners
    useEffect(() => {
      document.addEventListener('keydown', handleKeyboardShortcuts);
      return () => {
        document.removeEventListener('keydown', handleKeyboardShortcuts);
      };
    }, [handleKeyboardShortcuts]);

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