/**
 * /admin/dashboard — serves the real AdminDashboard component directly.
 * Previously this redirected to /admin, causing an unnecessary server hop.
 * router.push('/admin/dashboard') after login now lands here directly.
 */
export { default } from '../page';
