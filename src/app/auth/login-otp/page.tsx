import { permanentRedirect } from 'next/navigation';

export default function LoginOtpPage() {
  permanentRedirect('/auth/phone-email');
}
