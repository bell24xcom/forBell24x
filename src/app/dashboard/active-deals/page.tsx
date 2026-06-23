import { permanentRedirect } from 'next/navigation';

export default function ActiveDealsRedirect() {
  permanentRedirect('/dashboard/deals');
}
