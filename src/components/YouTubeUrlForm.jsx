"use client"

import extractYouTubeInfo from "@/lib/extractYouTubeInfo"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'



export default function YouTubeUrlForm() {
    const [url, setUrl] = useState('')
    const [videoData, setVideoData] = useState({
        videoId: '',
        time: '',
    })
    const router = useRouter()
    const handleSubmit = event => {
        event.preventDefault()
        if (!videoData.videoId) {
            alert("Needs a video id")
        } else {
            router.push(`/watch?v=${videoData.videoId}&t=${videoData.time}`)
        }
       
    }
    const handleUrlChange = event => {
        let changedUrl = event.target.value ? event.target.value : ''
        setUrl(changedUrl)
        let {videoId, time} = extractYouTubeInfo(changedUrl)
        setVideoData({videoId: videoId, time: time ? time : 0})
    }
    
    return (
        <form onSubmit={handleSubmit} className="w-full flex justify-center">
          <div className="flex items-center gap-2 w-full max-w-2xl">
            <Input
              id="url"
              name="url"
              onChange={handleUrlChange}
              value={url}
              type="text"
              required
              placeholder="Enter YouTube URL"
            />
            <Button type='submit'>Play</Button>
          </div>
        </form>
    )
  }