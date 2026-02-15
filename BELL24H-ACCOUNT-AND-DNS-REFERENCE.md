# Bell24h – Account & DNS Reference

**Use this for Cursor, Trae.ai, and manual setup so everyone uses the right accounts.**

---

## Correct accounts (source of truth)

| Service   | Login email               | Identifier        | Purpose                    |
|----------|---------------------------|-------------------|----------------------------|
| **Vercel** | bell24h.helpline@gmail.com | bell24xs-projects / bell24h | Deployments, domains, env vars |
| **GitHub** | digitex.studio@gmail.com   | digitex-erp / bell24h       | Code, repo, Git push        |

- **Vercel** = where the app is deployed (bell24h.helpline@gmail.com).
- **GitHub** = where the code lives (digitex.studio@gmail.com, org digitex-erp, repo bell24h).
- **Conflict to avoid:** Do **not** use digitex.studio@gmail.com for Vercel. Use it only for GitHub.

---

## Vercel (always use this)

- **Dashboard:** https://vercel.com (log in with **bell24h.helpline@gmail.com**)
- **Project settings:** https://vercel.com/bell24xs-projects/bell24h/settings
- **Domains:** https://vercel.com/bell24xs-projects/bell24h/settings/domains
- **Deployment URL:** https://bell24h-1az74y71z-bell24xs-projects.vercel.app

---

## GitHub (code and Git)

- **Repo:** https://github.com/digitex-erp/bell24h
- **Login:** digitex.studio@gmail.com
- **Org:** digitex-erp  
- **Repo name:** bell24h

---

## InsForge (backend + MCP)

- **Role:** Backend-as-a-Service (BaaS) – database (PostgreSQL), auth, storage, edge functions, AI.
- **App integration:** Via env vars on Vercel:
  - `NEXT_PUBLIC_INSFORGE_BASE_URL` – InsForge API base URL
  - `NEXT_PUBLIC_INSFORGE_ANON_KEY` – anonymous key for client access
- **MCP in Cursor:** InsForge MCP is connected so Cursor can use InsForge tools (e.g. fetch-docs, get-backend-metadata, run-raw-sql, create-bucket, create-function, create-deployment). Use MCP for backend/infra; use InsForge SDK in app code for auth, DB, storage, AI.
- **Docs:** Use the `fetch-docs` MCP tool with `docType` (e.g. `instructions`, `db-sdk`, `auth-sdk`, `storage-sdk`, `functions-sdk`, `ai-integration-sdk`, `deployment`) for up-to-date integration patterns.

---

## DNS (Cloudflare) – fix for bell24h.com

**Current (wrong):**  
- A record for `@` / bell24h.com → **216.198.79.1** (old server)

**Required (Vercel):**  
- A record for `@` / bell24h.com → **76.76.21.21**  
- Optional: CNAME `www` → `cname.vercel-dns.com`

**Steps:**  
1. Cloudflare → bell24h.com → DNS → Records  
2. Edit the A record that points to 216.198.79.1  
3. Set content to **76.76.21.21**  
4. Save (Proxy: DNS only or Proxied, your choice)  
5. Wait 15–60 min, then check: `nslookup bell24h.com` → should show 76.76.21.21  

---

## For Trae.ai

- Use **bell24h.helpline@gmail.com** for any Vercel login or Vercel CLI (`vercel login`).
- Use **digitex.studio@gmail.com** only for GitHub (clone, push, repo access).
- Before running `vercel` commands, ensure:  
  `vercel login` → bell24h.helpline@gmail.com  
  `vercel link` → team: bell24xs-projects, project: bell24h.

---

## Quick verification

```powershell
# DNS (after Cloudflare change) – should show 76.76.21.21
nslookup bell24h.com

# Vercel CLI – must be logged in as bell24h.helpline@gmail.com
vercel whoami
vercel ls
```

---

## Trae.ai – messages to send (in order)

### Message 1 – Account correction (send first, plain text)

```
ACCOUNT CORRECTION - CRITICAL

From now on, use these accounts:

VERCEL (deployments, domains, env vars):
- Email: bell24h.helpline@gmail.com
- Team: bell24xs-projects
- Project: bell24h
- Dashboard: https://vercel.com/bell24xs-projects/bell24h

GITHUB (code, repo):
- Email: digitex.studio@gmail.com
- Organization: digitex-erp
- Repository: bell24h
- Repo URL: https://github.com/digitex-erp/bell24h

IMPORTANT:
- Use bell24h.helpline@gmail.com for ALL Vercel operations
- Use digitex.studio@gmail.com for ALL GitHub operations
- Do NOT use digitex.studio@gmail.com for Vercel
- Do NOT use bell24h.helpline@gmail.com for GitHub

NEXT: I will send verification commands in a separate message.
```

### Message 2 – Verification commands (send immediately after)

Send in a **separate** message so the code block is not nested:

```
VERIFICATION COMMANDS

Run these commands to verify correct account setup:

vercel logout
vercel login
# Use: bell24h.helpline@gmail.com when prompted

vercel whoami
# Should show: bell24h.helpline@gmail.com (email, not team name)

vercel link
# Select team: bell24xs-projects
# Select project: bell24h

vercel ls

Confirm: (1) vercel whoami shows bell24h.helpline@gmail.com  (2) vercel ls shows bell24xs-projects/bell24h. Report results before proceeding.
```

### After DNS propagates – Verification report to Trae.ai

Send when `nslookup bell24h.com` shows **76.76.21.21**:

```
DNS MIGRATION COMPLETE - VERIFICATION REPORT

ACCOUNT STATUS:
✅ Vercel: bell24h.helpline@gmail.com | vercel whoami confirmed
✅ Project linked: bell24xs-projects/bell24h
✅ GitHub: digitex.studio@gmail.com / digitex-erp/bell24h

DNS: Cloudflare A record 216.198.79.1 → 76.76.21.21. Propagation complete.
Vercel: bell24h.com added; status Valid Configuration.
Browser: https://bell24h.com loads Bell24h site.

[Paste your nslookup output and attach screenshots: Cloudflare DNS, Vercel domains, browser.]

READY: Part 3 complete. Proceed with Part 4 - Production Testing & Monitoring.
```

---

## Action sequence (before Part 4)

**Do now:**  
1. Send Message 1 to Trae.ai  
2. Send Message 2 to Trae.ai  
3. Cloudflare → DNS → Edit A record → Content **76.76.21.21** → Save (screenshot)  
4. Vercel (bell24h.helpline@gmail.com) → Settings → Domains → Add **bell24h.com** (screenshot)  

**Every ~10 min:** Run `nslookup bell24h.com` until result is **76.76.21.21**.  

**When DNS shows 76.76.21.21:**  
5. Test: `curl.exe -I https://bell24h.com` and open https://bell24h.com in browser  
6. Confirm Vercel domain status: Valid Configuration  
7. Send verification report to Trae.ai (template above)  
8. Proceed to Part 4  

**Checklist before Part 4:**  
- [ ] Trae.ai: vercel whoami = bell24h.helpline@gmail.com  
- [ ] Cloudflare: A record = 76.76.21.21  
- [ ] nslookup bell24h.com = 76.76.21.21  
- [ ] bell24h.com added in Vercel, status Valid Configuration  
- [ ] https://bell24h.com loads Bell24h (no SSL errors)  

---

*Last updated: Jan 2026. Update this file if emails or project names change.*
