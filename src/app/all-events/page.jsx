'use client';

import PageContainer from '../../components/PageContainer';
import AllEventsTable from '../allEventsTable';

export default function AllEventsPage() {
  return (
    <PageContainer title="All Events" subtitle="Browse all video events in the system">
      <div className="flex flex-col items-center w-full space-y-8">
        <h1 className="streamlens-heading mb-6">Streamlens: All Events</h1>
        <div className="streamlens-card p-6 w-full max-w-3xl">
          <AllEventsTable />
        </div>
      </div>
    </PageContainer>
  );
}