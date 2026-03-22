import { redirect } from 'next/navigation';

export default function ActiveDealsRedirect() {
  redirect('/dashboard/deals');
}
