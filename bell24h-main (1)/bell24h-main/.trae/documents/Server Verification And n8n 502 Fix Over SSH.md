## Goal
Use SSH access to verify the production server, validate app health, fix the n8n 502 on subdomain, and confirm launch readiness without changing architecture.

## Connect
- SSH: `ssh -i "C:\Users\Sanika\Downloads\oracle-ssh-bell\ssh-key-2025-10-01.key" ubuntu@80.225.192.248`

## App Container Health
- List containers: `docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"`
- Logs: `docker logs --tail=200 bell24h`
- Local checks: 
  - `curl -I http://localhost:3000`
  - `curl -I http://localhost:3000/rfq`
  - `curl -I http://localhost:3000/dashboard`
  - `curl -s http://localhost:3000/api/stats`
  - `curl -s http://localhost:3000/api/health/db`

## Prisma Env Validation
- Inspect envs: `cat ~/bell24h/client/.env` and `cat ~/bell24h/client/.env.production`
- Ensure `DATABASE_URL` and `DIRECT_URL` exist and point to Neon
- Optional re-gen: `cd ~/bell24h/client && npx prisma generate`

## RFQ API Smoke Test
- Create sample RFQ:
  - `curl -s -X POST http://localhost:3000/api/rfq/create -H 'Content-Type: application/json' -d '{"title":"Test RFQ","description":"Server test","quantity":"10","deadline":"2025-12-31","category":"General","budget":"10000","location":"Mumbai"}'`
- Confirm `rfqId` returned and no 500s

## Demo Login Verification
- Trigger demo login and redirect: `curl -I http://localhost:3000/auth/demo-login`
- Browser check `/dashboard` to see real counts populated from `/api/stats`

## Nginx Proxy Validation
- Test config: `sudo nginx -t`
- Status: `sudo systemctl status nginx`
- Restart after changes: `sudo systemctl restart nginx`
- Confirm app reverse proxy: site config should proxy to `127.0.0.1:3000` with standard headers.

## Fix n8n 502 Subdomain
1. Container check
- `docker ps -a | grep -i n8n`
- `docker logs --tail=100 n8n`
- Restart: `docker restart n8n`

2. If container missing or misconfigured, (re)run with correct envs
- `docker run -d --name n8n --restart always -p 5678:5678 \ 
  -e N8N_HOST=n8n.bell24h.com -e N8N_PORT=5678 \ 
  -e WEBHOOK_URL=https://n8n.bell24h.com/ -e N8N_PROTOCOL=https \ 
  n8nio/n8n:latest`

3. Nginx for n8n
- Upstream to `127.0.0.1:5678` with headers:
  - `proxy_set_header Upgrade $http_upgrade;`
  - `proxy_set_header Connection "upgrade";`
  - `proxy_read_timeout 300s;`
- Test: `curl -I http://localhost:5678` then `curl -I https://n8n.bell24h.com`

4. Cloudflare
- SSL/TLS: Full (Strict) for apex
- For `n8n.bell24h.com`, if websocket/timeouts persist, set DNS to "DNS only" (grey cloud) temporarily

## Redeploy App If Needed
- `cd ~/bell24h/client`
- `docker build -t bell24h:latest -f Dockerfile .`
- `docker stop bell24h && docker rm bell24h`
- `docker run -d --name bell24h --restart always -p 3000:3000 --env-file ~/bell24h/client/.env.production bell24h:latest`
- `sudo systemctl restart nginx`

## Verification Checklist
- `https://bell24h.com` → 200, cache headers present
- `/rfq`, `/rfq/create`, `/dashboard` → load without errors
- `/api/stats` → shows counts (rfqs, suppliers, active users)
- `https://n8n.bell24h.com` → 200 OK, no 502

## Optional Hardening
- `journalctl -u nginx -n 200 --since "1 hour"` to confirm no recent errors
- Confirm Oracle security list has port 80/443 open
- Keep `--restart always` on containers so they auto-recover