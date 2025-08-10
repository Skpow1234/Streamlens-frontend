"use client"

import { useCallback, useEffect, useState } from "react"
import { apiFetch } from '@/lib/apiClient'

const FASTAPI_ENDPOINT = "/api/watch-sessions/"
const API_WATCH_SESSION_STORAGE_KEY = "watch_session"

export default function useWatchSession (video_id) {
    const [sessionId, setSessionId] = useState(null)

    const createSession = useCallback(async () => {
        let path = ''
        if (typeof window !== 'undefined') path = window.location.pathname
        try {
            const responseData = await apiFetch(FASTAPI_ENDPOINT, {
              method: 'POST',
              body: JSON.stringify({ video_id: video_id ? video_id : '', path })
            })
            if (responseData && typeof responseData === 'object' && 'watch_session_id' in responseData) {
              sessionStorage.setItem(API_WATCH_SESSION_STORAGE_KEY, JSON.stringify(responseData))
              const { watch_session_id } = responseData
              setSessionId(watch_session_id)
            } else {
              console.warn('Unexpected response from backend:', responseData)
            }
        } catch (error) {
            console.log(error)
        }
    }, [video_id])
    

    useEffect(()=>{
        const storedWatchSessionData = sessionStorage.getItem(API_WATCH_SESSION_STORAGE_KEY)
        let loadedWatchSessionId
        try {
            const parsed = JSON.parse(storedWatchSessionData)
            loadedWatchSessionId = parsed?.watch_session_id
        } catch (error) {}
        if (loadedWatchSessionId) {
            setSessionId(loadedWatchSessionId)
            return 
        } 
        createSession()
    }, [])

    return sessionId
}