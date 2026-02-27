import { redirect } from 'next/navigation';

// Supplier deals redirect to the unified deals page
export default function SupplierDealsRedirect() {
  redirect('/dashboard/deals');
}
