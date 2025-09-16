"use client"

import extractYouTubeInfo from "@/lib/extractYouTubeInfo"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'



interface VideoData {
    videoId: string
    time: string | number
}

export default function YouTubeUrlForm(): JSX.Element {
    const [url, setUrl] = useState<string>('')
    const [videoData, setVideoData] = useState<VideoData>({
        videoId: '',
        time: '',
    })
    const [error, setError] = useState<string>('')
    const router = useRouter()
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError('')

        if (!url.trim()) {
            setError("Please enter a YouTube URL")
            return
        }

        if (!videoData.videoId) {
            setError("Invalid YouTube URL. Please enter a valid YouTube video URL.")
            return
        }

        // Basic validation for YouTube video ID format
        if (!/^[a-zA-Z0-9_-]{11}$/.test(videoData.videoId)) {
            setError("Invalid YouTube video ID format.")
            return
        }

        router.push(`/watch?v=${videoData.videoId}&t=${videoData.time}`)
    }
    const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        let changedUrl = event.target.value ? event.target.value : ''
        setUrl(changedUrl)
        let {videoId, time} = extractYouTubeInfo(changedUrl)
        setVideoData({videoId: videoId, time: time ? time : 0})

        // Clear error when user starts typing
        if (error) setError('')
    }
    
    return (
        <form onSubmit={handleSubmit} className="w-full flex justify-center">
          <div className="flex flex-col gap-2 w-full max-w-2xl">
            <div className="flex items-center gap-2">
              <Input
                id="url"
                name="url"
                onChange={handleUrlChange}
                value={url}
                type="text"
                required
                placeholder="Enter YouTube URL"
                className={error ? "border-red-500" : ""}
              />
              <Button type='submit'>Play</Button>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        </form>
    )
  }