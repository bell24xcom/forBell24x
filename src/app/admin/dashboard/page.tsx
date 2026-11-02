/**
 * /admin/dashboard — serves the real AdminDashboard component directly.
 * Previously this redirected to /admin, causing an unnecessary server hop.
 * router.push('/admin/dashboard') after login now lands here directly.
 */
export { /* @next-codemod-error `default` export is re-exported. Check if this component uses `params` or `searchParams`*/
default } from '../page';
