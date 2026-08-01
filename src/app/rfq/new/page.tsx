import { redirect } from 'next/navigation'

// /rfq/create is the canonical RFQ creation page (linked from Header and
// dashboard, listed in sitemap.ts). This route was a superseded duplicate
// whose payload shape (quantity sent as a number) no longer matched
// /api/rfq/create's Zod schema (z.string()) — every submission 400ed.
export default function NewRFQPage() {
  redirect('/rfq/create')
}
