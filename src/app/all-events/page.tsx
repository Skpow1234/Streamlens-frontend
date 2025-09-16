'use client';

import PageContainer from '../../components/PageContainer';
import AllEventsTable from '@/components/events/AllEventsTable';

export default function AllEventsPage(): JSX.Element {
  return (
    <PageContainer title="All Events" subtitle="Browse all video events in the system">
      <div className="flex flex-col items-center w-full space-y-8">
        <AllEventsTable />
      </div>
    </PageContainer>
  );
}