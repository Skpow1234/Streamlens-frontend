'use client';

import PageContainer from '../../components/PageContainer';
import DeleteEventById from '../deleteEventById';

export default function DeleteEventByIdPage() {
  return (
    <PageContainer title="Delete Event By ID" subtitle="Delete a video event by its unique ID">
      <div className="flex flex-col items-center w-full space-y-8">
        <h1 className="streamlens-heading mb-6">Streamlens: Delete Event by ID</h1>
        <div className="streamlens-card p-6 w-full max-w-md">
          <DeleteEventById />
        </div>
      </div>
    </PageContainer>
  );
}