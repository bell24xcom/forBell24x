// Canonical OTP verify endpoint: /api/auth/otp/verify
// This route delegates to the canonical handler for backward compatibility.
export { /* @next-codemod-error `POST` export is re-exported. Check if this component uses `params` or `searchParams`*/
POST } from '@/src/app/api/auth/otp/verify/route';
