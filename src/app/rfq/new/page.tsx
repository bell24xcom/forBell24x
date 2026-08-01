import { permanentRedirect } from 'next/navigation'

// /rfq/create is the canonical RFQ creation page (linked from Header and
// dashboard, listed in sitemap.ts). This route was a superseded duplicate
// whose payload shape (quantity sent as a number) no longer matched
// /api/rfq/create's Zod schema (z.string()) — every submission 400ed.
// permanentRedirect (not redirect) — this retirement is permanent, and
// emits a 308 instead of redirect()'s 307 (confirmed via
// node_modules/next/dist/client/components/redirect.js).
export default function NewRFQPage() {
  permanentRedirect('/rfq/create')
}
