import { permanentRedirect } from 'next/navigation';

export default function SupplierDealsRedirect() {
  permanentRedirect('/dashboard/deals');
}
