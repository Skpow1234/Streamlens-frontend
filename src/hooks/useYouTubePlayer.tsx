"use client"

import { useCallback, useEffect, useState, useRef } from "react";

function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
  }

const useYouTubePlayer = (videoId, elementId, startTime=200, interval=5000) => {
    const playerElementId = elementId || "video-player"
    const playerRef = useRef(null)
    const [playerState, setPlayerState] = useState({
        isReady: false,
        current_time: 0,
        video_title: '',
        video_state_label: '',
        video_state_value: -10,
    })
    const handleOnStateChange = useCallback(
        () => {
          if (!playerRef.current || !window.YT) return
          const YTPlayerStateObj = window.YT.PlayerState
          const videoData = playerRef.current.getVideoData()
          const currentTimeSeconds = playerRef.current.getCurrentTime()
          const videoStateValue = playerRef.current.getPlayerState()
          const videoStateLabel = getKeyByValue(YTPlayerStateObj, videoStateValue)

          setPlayerState(prevState => ({
            ...prevState,
            video_title: videoData?.title || '',
            current_time: currentTimeSeconds || 0,
            video_state_label: videoStateLabel || '',
            video_state_value: typeof videoStateValue === 'number' ? videoStateValue : -10,
          }))
        },
    [])

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