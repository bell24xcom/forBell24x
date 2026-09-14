import { redirect } from 'next/navigation';

/** Legacy route — redirects to canonical CRM journey page. */
export default function LegacyCompanyJourneyPage({ params }: { params: { id: string } }) {
  redirect(`/admin/crm/${params.id}`);
}
