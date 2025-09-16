'use client';

import PageContainer from '../../components/PageContainer';
import UpdateEventById from '../updateEventById';

export default function UpdateEventByIdPage() {
  return (
    <PageContainer title="Update Event By ID" subtitle="Update a video event by its unique ID">
      <div className="flex flex-col items-center w-full space-y-8">
        <h1 className="streamlens-heading mb-6">Streamlens: Update Event by ID</h1>
        <div className="streamlens-card p-6 w-full max-w-md">
          <UpdateEventById />
        </div>
      </div>
    </PageContainer>
  );
}