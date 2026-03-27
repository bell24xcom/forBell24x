# Bell24h × Cloudflare Pages/Workers

## Deploy to India Edge (Cloudflare Pages + Workers + Neon)

### 1. Connect GitHub repo to Cloudflare Pages
- Go to Cloudflare Dashboard → Pages → Create Project
- Connect this GitHub repo, set framework to Next.js
- Use Build command: `npx next-on-pages build`
- Output: `.vercel/output/static`

### 2. Workers API
- API endpoints auto-routed through Cloudflare Workers (see wrangler.toml)
- Edit `wrangler.toml` account_id/zone_id
- Deploy API: `wrangler publish`

### 3. Environment Variables
- Add Neon DB string, API keys, etc. in Pages/Workers dashboard

### 4. DNS
- CNAME www → bell24h.pages.dev
- CNAME api → api.bell24h.com (Worker)

### 5. Live URLs
- https://bell24h.com (Cloudflare Pages Next.js)
- https://api.bell24h.com (Workers edge API)

---

## Legacy: Vercel/Supabase instructions have been removed!
---
