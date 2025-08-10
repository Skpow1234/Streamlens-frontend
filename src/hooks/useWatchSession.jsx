"use client"

import { useCallback, useEffect, useState } from "react"

const FASTAPI_ENDPOINT = "/api/watch-sessions/"
const API_WATCH_SESSION_STORAGE_KEY = "watch_session"

export default function useWatchSession (video_id) {
    const [sessionId, setSessionId] = useState(null)

    const createSession = useCallback(async () => {
        const headers = {'Content-Type': 'application/json'}
        let path = ''
        if (typeof window !== 'undefined') path = window.location.pathname
        try {
            const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8002'
            const response = await fetch(`${base}${FASTAPI_ENDPOINT}`, {
                method: "POST",
                headers: headers,
                body: JSON.stringify({video_id: video_id ? video_id : '', path})
            })
            if (!response.ok) {
                console.log(await response.text())
                console.log("error with watch session")
            } else {
                const responseData = await response.json()
                if (responseData && typeof responseData === 'object' && 'watch_session_id' in responseData) {
                    sessionStorage.setItem(API_WATCH_SESSION_STORAGE_KEY, JSON.stringify(responseData))
                    const {watch_session_id} = responseData
                    setSessionId(watch_session_id)
                } else {
                    console.warn('Unexpected response from backend:', responseData)
                }
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