"use client"

import extractYouTubeInfo from "@/lib/extractYouTubeInfo"
import { redirect } from "next/navigation"
import { useState } from "react"



export default function YouTubeUrlForm() {
    const [url, setUrl] = useState('')
    const [videoData, setVideoData] = useState({
        videoId: '',
        time: '',
    })
    const handleSubmit = event => {
        event.preventDefault()
        if (!videoData.videoId) {
            alert("Needs a video id")
        } else {
            redirect(`/watch?v=${videoData.videoId}&t=${videoData.time}`)
        }
       
    }
    const handleUrlChange = event => {
        let changedUrl = event.target.value ? event.target.value : ''
        setUrl(changedUrl)
        let {videoId, time} = extractYouTubeInfo(changedUrl)
        setVideoData({videoId: videoId, time: time ? time : 0})
    }
    
    return (
        <form onSubmit={handleSubmit}>
      <div className="w-full flex justify-center">
        <div className="relative w-full max-w-2xl">
          <div className="flex items-center w-full rounded-full border border-gray-200 hover:shadow-md focus-within:shadow-md transition-shadow duration-200">
            <input
              id="url"
              name="url"
              onChange={handleUrlChange}
              value={url}
              type="text"
              required
              placeholder="Enter YouTube URL"
              className="block w-full py-4 px-6 text-lg text-gray-900 placeholder:text-gray-400 focus:outline-none rounded-full"
              style={{ minWidth: '300px', maxWidth: '600px' }}
            />
            <button 
                type='submit'
                className="ml-2 bg-black hover:bg-red-600 text-white font-medium py-2 px-8 rounded-full transition-colors duration-200 text-lg"
                style={{ minWidth: '100px' }}
            >
              Play
            </button>
          </div>
        </div>
      </div>
      </form>
    )
  }