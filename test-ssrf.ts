import { validateExternalUrl } from './lib/security';

const testUrls = [
  'https://google.com',                // Valid
  'http://127.0.0.1',                  // Blocked (Standard)
  'http://2130706433',                 // Blocked (Decimal 127.0.0.1)
  'http://[::1]',                      // PROBE: IPv6 Loopback
  'http://169.254.169.254',            // Blocked (Metadata)
  'http://0x7f.0x0.0x0.0x1',           // PROBE: Hex Loopback
  'https://10.0.0.1',                  // Blocked (Private)
  'ftp://google.com'                   // Blocked (Non-HTTP)
];

console.log('--- SSRF Bypass Test Results ---');
testUrls.forEach(url => {
  const result = validateExternalUrl(url);
  console.log(`${result ? '✅ ALLOWED' : '❌ BLOCKED'}: ${url}`);
});
