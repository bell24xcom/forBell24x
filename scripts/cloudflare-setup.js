#!/usr/bin/env node
/**
 * VyaparSethu — Cloudflare Automation Script
 *
 * Configures three things via Cloudflare API:
 *   1. DNS records for vyaparsethu.com → Vercel
 *   2. Email routing catch-all → digitex.studio@gmail.com
 *   3. Web Analytics site → prints NEXT_PUBLIC_CF_ANALYTICS_TOKEN
 *
 * Usage:
 *   CF_API_TOKEN=<token> CF_ACCOUNT_ID=<account_id> node scripts/cloudflare-setup.js
 *
 * Get your API Token:
 *   dash.cloudflare.com → Profile (top right) → API Tokens → Create Token
 *   Use template: "Edit zone DNS" — scope to vyaparsethu.com zone
 *   Add permissions: Zone > DNS > Edit, Zone > Zone > Read,
 *                    Zone > Email Routing > Edit, Account > Account Analytics > Read
 *
 * Get your Account ID:
 *   dash.cloudflare.com → right sidebar shows "Account ID"
 */

const CF_API = 'https://api.cloudflare.com/client/v4';
const TOKEN  = process.env.CF_API_TOKEN;
const ACCOUNT = process.env.CF_ACCOUNT_ID;

if (!TOKEN || !ACCOUNT) {
  console.error('\n❌  Missing credentials.\n');
  console.error('  Run: CF_API_TOKEN=xxx CF_ACCOUNT_ID=yyy node scripts/cloudflare-setup.js\n');
  process.exit(1);
}

const headers = {
  'Authorization': `Bearer ${TOKEN}`,
  'Content-Type': 'application/json',
};

async function cf(method, path, body) {
  const res = await fetch(`${CF_API}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!json.success) {
    throw new Error(`CF API error at ${path}: ${JSON.stringify(json.errors)}`);
  }
  return json.result;
}

// ── Step 1: Find or create vyaparsethu.com zone ────────────────────────────
async function getOrCreateZone() {
  console.log('\n[1/3] DNS — vyaparsethu.com');

  const zones = await cf('GET', `/zones?name=vyaparsethu.com&account.id=${ACCOUNT}`);
  if (zones.length === 0) {
    console.log('  Zone not found. Creating vyaparsethu.com zone...');
    const zone = await cf('POST', '/zones', {
      name: 'vyaparsethu.com',
      account: { id: ACCOUNT },
      jump_start: false,
      type: 'full',
    });
    console.log(`  ✓ Zone created: ${zone.id}`);
    console.log('\n  ⚠️  ACTION REQUIRED: Update your domain registrar nameservers to:');
    zone.name_servers.forEach(ns => console.log(`       ${ns}`));
    return zone.id;
  }

  const zone = zones[0];
  console.log(`  ✓ Zone found: ${zone.id} (status: ${zone.status})`);
  return zone.id;
}

// ── Step 2: Set DNS records ────────────────────────────────────────────────
async function setupDNS(zoneId) {
  const existing = await cf('GET', `/zones/${zoneId}/dns_records`);

  const records = [
    { type: 'A',     name: '@',           content: '76.76.21.21',          proxied: true  },
    { type: 'CNAME', name: 'www',         content: 'cname.vercel-dns.com', proxied: false },
  ];

  for (const rec of records) {
    const found = existing.find(r => r.type === rec.type && r.name.replace('.vyaparsethu.com','').replace('vyaparsethu.com','@') === rec.name);
    if (found) {
      await cf('PATCH', `/zones/${zoneId}/dns_records/${found.id}`, rec);
      console.log(`  ✓ Updated ${rec.type} ${rec.name} → ${rec.content}`);
    } else {
      await cf('POST', `/zones/${zoneId}/dns_records`, rec);
      console.log(`  ✓ Created ${rec.type} ${rec.name} → ${rec.content}`);
    }
  }
}

// ── Step 3: Email routing catch-all ───────────────────────────────────────
async function setupEmailRouting(zoneId) {
  console.log('\n[2/3] Email Routing — catch-all → digitex.studio@gmail.com');

  // Enable email routing
  try {
    await cf('PUT', `/zones/${zoneId}/email-routing/enable`, {});
    console.log('  ✓ Email routing enabled');
  } catch (e) {
    console.log('  ~ Email routing already enabled (or needs MX records first)');
  }

  // Add destination address (must be verified — Cloudflare sends a verification email)
  try {
    await cf('POST', `/accounts/${ACCOUNT}/email-routing/addresses`, {
      email: 'digitex.studio@gmail.com',
    });
    console.log('  ✓ Destination address added: digitex.studio@gmail.com');
    console.log('  ⚠️  Check digitex.studio@gmail.com for a Cloudflare verification email and click the link.');
  } catch (e) {
    console.log('  ~ Destination address may already exist');
  }

  // Set catch-all rule
  try {
    const rules = await cf('GET', `/zones/${zoneId}/email-routing/rules`);
    const catchAll = rules.find(r => r.matchers?.[0]?.type === 'all');
    const ruleBody = {
      actions: [{ type: 'forward', value: ['digitex.studio@gmail.com'] }],
      enabled: true,
      matchers: [{ type: 'all' }],
      name: 'catch-all',
      priority: 0,
    };
    if (catchAll) {
      await cf('PUT', `/zones/${zoneId}/email-routing/rules/${catchAll.tag}`, ruleBody);
      console.log('  ✓ Catch-all rule updated');
    } else {
      await cf('POST', `/zones/${zoneId}/email-routing/rules`, ruleBody);
      console.log('  ✓ Catch-all rule created');
    }
  } catch (e) {
    console.log(`  ⚠️  Email routing rules: ${e.message}`);
    console.log('     (Email routing may need MX records to propagate first — retry in 5 min)');
  }
}

// ── Step 4: Web Analytics ─────────────────────────────────────────────────
async function setupWebAnalytics() {
  console.log('\n[3/3] Web Analytics — vyaparsethu.com');

  try {
    const sites = await cf('GET', `/accounts/${ACCOUNT}/rum/site_info/list`);
    const existing = sites.find(s => s.site?.host === 'vyaparsethu.com');

    if (existing) {
      console.log(`  ✓ Analytics site already exists`);
      console.log(`\n  NEXT_PUBLIC_CF_ANALYTICS_TOKEN=${existing.snippet?.token || '(check dash.cloudflare.com → Analytics → Web Analytics)'}`);
      return;
    }

    const site = await cf('POST', `/accounts/${ACCOUNT}/rum/site_info`, {
      host: 'vyaparsethu.com',
      zone_tag: null,
      auto_install: false,
    });

    const token = site.snippet?.token;
    console.log('  ✓ Web Analytics site created');
    console.log(`\n  ┌──────────────────────────────────────────────────────────┐`);
    console.log(`  │  Add this to Vercel environment variables:               │`);
    console.log(`  │                                                          │`);
    console.log(`  │  NEXT_PUBLIC_CF_ANALYTICS_TOKEN=${token}  │`);
    console.log(`  └──────────────────────────────────────────────────────────┘`);
  } catch (e) {
    console.log(`  ⚠️  Web Analytics: ${e.message}`);
    console.log('     Get token manually: dash.cloudflare.com → Analytics → Web Analytics → Add site');
  }
}

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  VyaparSethu — Cloudflare Setup');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  try {
    const zoneId = await getOrCreateZone();
    await setupDNS(zoneId);
    await setupEmailRouting(zoneId);
    await setupWebAnalytics();

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  Done. Post-setup checklist:');
    console.log('');
    console.log('  [ ] Verify nameservers at registrar (if zone was just created)');
    console.log('  [ ] Click verification link in digitex.studio@gmail.com');
    console.log('  [ ] Add NEXT_PUBLIC_CF_ANALYTICS_TOKEN to Vercel env vars');
    console.log('  [ ] Redeploy Vercel to activate analytics beacon');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } catch (err) {
    console.error('\n❌  Setup failed:', err.message);
    process.exit(1);
  }
}

main();
