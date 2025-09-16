'use client';

import PageContainer from '../components/PageContainer';
import YouTubeUrlForm from '../components/YouTubeUrlForm';
import Link from 'next/link';
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { Badge } from '@/components/ui/badge'

export default function Home(): JSX.Element {
  const { signOut, user } = useAuth()
  return (
    <PageContainer
      title="Streamlens"
      subtitle="Track and analyze YouTube video watch events and sessions"
    >
      <div className="flex flex-col items-center w-full space-y-8">
        <YouTubeUrlForm />
        {user ? <Badge variant="secondary" className="">Signed in as {user.username}</Badge> : null}
        <div className="flex flex-wrap gap-4 justify-center w-full mt-2 mb-2">
          {user && (
            <Link href="/dashboard">
              <Button className="w-48" variant="default" size="default">
                📊 Dashboard
              </Button>
            </Link>
          )}
          <Link href="/all-events"><Button className="w-48" variant="secondary" size="default">All Events</Button></Link>
          <Link href="/get-event-by-id"><Button className="w-48" variant="outline" size="default">Get Event by ID</Button></Link>
        </div>
        <div className="flex flex-col gap-4 w-full items-center">
          <Link href="/update-event-by-id"><Button className="w-64" variant="default" size="default">Update Event by ID</Button></Link>
          <Link href="/delete-event-by-id"><Button className="w-64" variant="outline" size="default">Delete Event by ID</Button></Link>
        </div>
        {user ? (
          <Button className="w-48 mt-6" variant="destructive" size="default" onClick={signOut}>Sign Out</Button>
        ) : null}
      </div>
    </PageContainer>
  );
}