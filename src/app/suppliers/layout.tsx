// SEO fix (Task 2, SEO_PHASE_2_SSR_AND_SITEMAP): metadata used to live here
// as a static export because page.tsx was 'use client' and couldn't export
// metadata itself. page.tsx is now an async Server Component with its own
// generateMetadata (varying by ?page=N, with a correct self-referencing
// canonical per page), so this layout goes back to being a plain passthrough.
export default function SuppliersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
