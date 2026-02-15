## Decision
- Proceed with Option A (Soft Launch on 20 Nov) under a "Beta" label to start collecting feedback while core features are functional.

## Immediate (Next 4 Hours)
### RFQ Submission (API + Form)
- File: `client/src/app/api/rfq/create/route.ts`
- Ensure it parses JSON, validates required fields, and uses `client/src/lib/prisma.ts` to `create` an RFQ with buyer/user linkage.
- Success: return `201` with the RFQ id; Failure: return `400/500` with reason.
- Test: submit `/rfq/create` form → check DB via Neon dashboard or a simple test script.

### Demo Login (Bypass OTP)
- File: `client/src/app/auth/demo-login/page.tsx`
- Implement a simple demo auth path: when a demo email/phone is provided, create/find a user and set a session (SSR-safe) without OTP.
- Use `client/scripts/create-demo-users.js` to seed 5 buyers + 5 suppliers for fast testing.
- Redirect to `/dashboard` after login.

### Dashboard Data (Counts)
- File: `client/src/app/dashboard/page.tsx`
- Query Prisma for counts: RFQs, Suppliers (companies/users), and Active Users.
- Render summary cards: `X RFQs | Y Suppliers | Z Active Users`.

## Tomorrow (Core Functionality)
### Supplier Profile Claiming
- File: `client/src/app/suppliers/[slug]/page.tsx`
- Add claim flow: POST `/api/claim/company/route.ts` (exists) to update claim status and tie to user.
- On success: show confirmation and update UI; send welcome email via existing email utils.

### Basic Matching
- Connect RFQs to suppliers by category. Show matched RFQs in the supplier dashboard and a notification like "X new RFQs for you".

## Prisma Baseline (P3005)
- Dev: `npx prisma db pull` → `npx prisma migrate dev --create-only --name baseline` → commit the migration folder.
- Prod: `npx prisma migrate resolve --applied <baseline-folder>`.
- Then future `npx prisma migrate deploy` will work safely on the non-empty DB.

## n8n 502 Fix (Subdomain)
- Check container: `docker ps -a | findstr n8n` and `docker logs --tail=100 n8n`.
- Restart: `docker restart n8n` (or `docker run` if missing), verify env `WEBHOOK_URL`, `BASE_URL`, `N8N_HOST`, and port mapping (typically `5678`).
- Nginx: confirm upstream to the correct n8n container port; ensure `proxy_set_header Host $host;` and timeouts are adequate.
- Cloudflare: for `n8n.bell24h.com`, temporarily disable proxy (orange cloud → grey) if websocket/long requests cause 502.
- Health check: open `http://n8n.bell24h.com/healthz` or root; expect 200.

## Verification
- Routes: `curl -I https://bell24h.com`, `/rfq`, `/rfq/create`, `/rfq/demo/all`, `/dashboard` → 200 OK.
- Demo login → dashboard shows real counts.
- RFQ create → persisted in Neon (confirm via dashboard or script).
- n8n subdomain → 200 OK after container restart and Nginx route fix.

## HTTPS & Proxy
- Cloudflare SSL/TLS: Full (Strict). Keep port 80 open in Oracle security list; Nginx reverse proxy to app on `3000`.
- Re-test green lock and caching headers.

## Optional (Post-Launch)
- Migrate Prisma config from deprecated `package.json#prisma` to `prisma.config.ts`.
- Replace demo RFQ data with live Prisma queries.
- Expand supplier claiming automation and email workflows.

## Recap
- Fix three critical items today: RFQ save, demo login, dashboard data.
- Baseline Prisma to avoid P3005 blocking future migrations.
- Restore `n8n.bell24h.com` by restarting container, validating Nginx, and adjusting Cloudflare if needed.