"use client"

import PageContainer from '../../components/PageContainer';
import MetricsTable from './metricsTable';
import { useAuth } from '../../context/AuthContext';
import { useSearchParams } from 'next/navigation';
import useWatchSession from '../../hooks/useWatchSession';
import useYouTubePlayer from '../../hooks/useYouTubePlayer';

const FASTAPI_ENDPOINT = "http://localhost:8002/api/video-events/"

export default function WatchPage() {
  // ...existing logic for video_id, session_id, playerState, etc.
  // Place your main content inside the PageContainer below
  return (
    <PageContainer title="Watch Videos" subtitle="Watch and track YouTube videos with metrics">
      <div className="flex flex-col items-center w-full space-y-8">
        {/* Existing content goes here */}
        {/* ... existing code ... */}
        <MetricsTable />
      </div>
    </PageContainer>
  );
}