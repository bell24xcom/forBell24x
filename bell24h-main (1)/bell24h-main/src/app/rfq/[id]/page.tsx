import RFQDetail from '@/components/rfq/RFQDetail';
import { notFound } from 'next/navigation';

export default function RFQPage({ params }: { params: { id: string } }) {
  return <RFQDetail id={params.id} />;
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  return {
    title: `RFQ #${params.id} | BELL`,
    description: `View details for RFQ #${params.id} on BELL - India's fastest B2B marketplace`,
  };
}

