'use client';

import PageContainer from '../components/PageContainer';
import YouTubeUrlForm from '../components/YouTubeUrlForm';
import Link from 'next/link';

export default function Home() {
  return (
    <PageContainer
      title="Streamlens"
      subtitle="Track and analyze YouTube video watch events and sessions"
    >
      <div className="flex flex-col items-center w-full space-y-8">
        <YouTubeUrlForm />
        <div className="flex flex-wrap gap-4 justify-center w-full mt-2 mb-2">
          <Link href="/all-events"><button className="streamlens-btn w-48">All Events</button></Link>
          <Link href="/get-event-by-id"><button className="streamlens-btn w-48">Get Event by ID</button></Link>
        </div>
        <div className="flex flex-col gap-4 w-full items-center">
          <Link href="/update-event-by-id"><button className="streamlens-btn w-64">Update Event by ID</button></Link>
          <Link href="/delete-event-by-id"><button className="streamlens-btn w-64">Delete Event by ID</button></Link>
        </div>
        <button className="streamlens-btn w-48 bg-red-500 hover:bg-red-600 mt-6">Sign Out</button>
      </div>
    </PageContainer>
  );
}