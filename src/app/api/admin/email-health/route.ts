/**
 * GET /api/admin/email-health
 * Performs live DNS lookups for SPF, DKIM, and DMARC records on the sending domain.
 * Returns structured results the admin email-health page can consume.
 */

import { NextRequest, NextResponse } from 'next/server';
import dns from 'dns/promises';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

const SENDING_DOMAIN = 'bell24h.com';

async function lookupTxt(name: string): Promise<string[]> {
  try {
    const records = await dns.resolveTxt(name);
    return records.flat();
  } catch {
    return [];
  }
}

async function lookupCname(name: string): Promise<string | null> {
  try {
    const records = await dns.resolveCname(name);
    return records[0] ?? null;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (isErrorResponse(auth)) return auth;

  const [rootTxt, dmarcTxt, dkimCname1, dkimCname2] = await Promise.all([
    lookupTxt(SENDING_DOMAIN),
    lookupTxt(`_dmarc.${SENDING_DOMAIN}`),
    lookupCname(`brevo1._domainkey.${SENDING_DOMAIN}`),
    lookupCname(`brevo2._domainkey.${SENDING_DOMAIN}`),
  ]);

  const spfRecord   = rootTxt.find(r => r.startsWith('v=spf1'));
  const dmarcRecord = dmarcTxt.find(r => r.startsWith('v=DMARC1'));
  const dkimCname   = dkimCname1 ?? dkimCname2;

  const spfOk   = !!spfRecord;
  const dmarcOk = !!dmarcRecord;
  const dkimOk  = !!dkimCname;
  const allOk   = spfOk && dmarcOk && dkimOk;

  return NextResponse.json({
    domain:    SENDING_DOMAIN,
    checkedAt: new Date().toISOString(),
    allOk,
    records: {
      spf: {
        status: spfOk ? 'ok' : 'missing',
        value:  spfRecord ?? null,
        lookup: `@.${SENDING_DOMAIN} (TXT)`,
      },
      dkim: {
        status:   dkimOk ? 'ok' : 'missing',
        value:    dkimCname,
        lookup:   `brevo1._domainkey.${SENDING_DOMAIN} (CNAME)`,
        selector: 'brevo1',
      },
      dmarc: {
        status: dmarcOk ? 'ok' : 'missing',
        value:  dmarcRecord ?? null,
        lookup: `_dmarc.${SENDING_DOMAIN} (TXT)`,
      },
    },
    recommendations: [
      ...(!spfOk   ? [`Add TXT record on @ : v=spf1 include:spf.brevo.com mx ~all`] : []),
      ...(!dkimOk  ? [`Add CNAME brevo1._domainkey → b1.bell24h-com.dkim.brevo.com and brevo2._domainkey → b2.bell24h-com.dkim.brevo.com in Cloudflare`] : []),
      ...(!dmarcOk ? [`Add TXT record on _dmarc : v=DMARC1; p=none; rua=mailto:hello@bell24h.com`] : []),
    ],
  });
}
