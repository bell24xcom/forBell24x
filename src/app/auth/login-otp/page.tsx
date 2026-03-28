import { redirect } from 'next/navigation';

export default function LoginOtpPage() {
  redirect('/auth/phone-email');
}
