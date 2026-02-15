# BELL24h — Cloudflare Pages + Oracle VM Migration

## Live URLs
- Frontend (Pages): https://bell24h.com
- n8n (Oracle VM): https://n8n.bell24h.com

## Environment
- Copy `client/env.production.example` to `client/.env.production` and fill real values.

## Deploy
- Push to `main` → Cloudflare Pages builds.
- VM services (like n8n) remain on 80.225.192.248.

## DNS (Cloudflare)
```
CNAME @        bell24h.pages.dev        Proxied
CNAME www      bell24h.pages.dev        Proxied
A     n8n      80.225.192.248           DNS only
CNAME app      n8n.bell24h.com          DNS only
```


