/**
 * /admin/dashboard — canonical admin dashboard is at /admin.
 * This route exists for backwards-compat; redirect immediately.
 */
import { redirect } from 'next/navigation';

export default function AdminDashboardRedirect() {
  redirect('/admin');
}
