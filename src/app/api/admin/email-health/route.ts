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
const DKIM_SELECTOR  = 'mail';         // Brevo uses mail._domainkey.<domain>

async function lookupTxt(name: string): Promise<string[]> {
  try {
    const records = await dns.resolveTxt(name);
    return records.flat();
  } catch {
    return [];
  }
}

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (isErrorResponse(auth)) return auth;

  const [rootTxt, dmarcTxt, dkimTxt] = await Promise.all([
    lookupTxt(SENDING_DOMAIN),
    lookupTxt(`_dmarc.${SENDING_DOMAIN}`),
    lookupTxt(`${DKIM_SELECTOR}._domainkey.${SENDING_DOMAIN}`),
  ]);

  const spfRecord   = rootTxt.find(r => r.startsWith('v=spf1'));
  const dmarcRecord = dmarcTxt.find(r => r.startsWith('v=DMARC1'));
  const dkimRecord  = dkimTxt.find(r => r.includes('v=DKIM1') || r.includes('k=rsa'));

  const spfOk   = !!spfRecord;
  const dmarcOk = !!dmarcRecord;
  const dkimOk  = !!dkimRecord;
  const allOk   = spfOk && dmarcOk && dkimOk;

  return NextResponse.json({
    domain:   SENDING_DOMAIN,
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
        value:    dkimRecord ?? null,
        lookup:   `${DKIM_SELECTOR}._domainkey.${SENDING_DOMAIN} (TXT)`,
        selector: DKIM_SELECTOR,
      },
      dmarc: {
        status: dmarcOk ? 'ok' : 'missing',
        value:  dmarcRecord ?? null,
        lookup: `_dmarc.${SENDING_DOMAIN} (TXT)`,
      },
    },
    recommendations: [
      ...(!spfOk   ? [`Add TXT record on @ : v=spf1 include:spf.brevo.com mx ~all`] : []),
      ...(!dkimOk  ? [`Get DKIM value from Brevo → Senders & IP → Domains → Authenticate`] : []),
      ...(!dmarcOk ? [`Add TXT record on _dmarc : v=DMARC1; p=none; rua=mailto:hello@bell24h.com`] : []),
    ],
  });
}
