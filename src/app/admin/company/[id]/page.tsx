import { redirect } from 'next/navigation';

/** Legacy route — redirects to canonical CRM journey page. */
export default async function LegacyCompanyJourneyPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  redirect(`/admin/crm/${params.id}`);
}
