import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { FLAGS } from '@/src/lib/feature-flags';
import { verifyToken } from '@/lib/jwt';
import SmartMatchingClient from './SmartMatchingClient';

/**
 * Server-side gate: this page shows fabricated SHAP-like output and must not be
 * reachable by any public user until real SHAP is wired. requireAdmin() (lib/admin-auth.ts)
 * can't be called here — it takes a NextRequest, which Server Component pages don't
 * receive — so this re-implements the same JWT/cookie check it does internally
 * (same cookie names, same verifyToken), just read via next/headers instead.
 */
export default async function SmartMatchingPage() {
  if (!FLAGS.SHAP_ENABLED) {
    notFound();
  }

  const cookieStore = cookies();
  const token = cookieStore.get('admin-token')?.value ?? cookieStore.get('auth-token')?.value;
  if (!token) notFound();

  try {
    const payload = verifyToken(token);
    if (payload.role !== 'ADMIN') notFound();
  } catch {
    notFound();
  }

  return <SmartMatchingClient />;
}
