'use client';

import PageContainer from '../../components/PageContainer';
import GetEventById from '../getEventById';

export default function GetEventByIdPage(): JSX.Element {
  return (
    <PageContainer title="Get Event By ID" subtitle="Find a video event by its unique ID">
      <div className="flex flex-col items-center w-full space-y-8">
        <h1 className="streamlens-heading mb-6">Streamlens: Get Event by ID</h1>
        <div className="streamlens-card p-6 w-full max-w-md">
          <GetEventById />
        </div>
      </div>
    </PageContainer>
  );
}