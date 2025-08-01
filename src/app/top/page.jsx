import PageContainer from '../../components/PageContainer';
import TopVideoTable from './topVideoTable';

export default function TopVideosPage() {
  return (
    <PageContainer title="Top Videos" subtitle="See the most popular videos and stats">
      <div className="flex flex-col items-center w-full space-y-8">
        <TopVideoTable />
      </div>
    </PageContainer>
  );
}