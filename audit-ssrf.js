const { validateExternalUrl } = require('./lib/security');

// Basic shim for commonjs if needed, but since I wrote the lib as ESM, 
// I'll just simulate the regex logic here to test its efficacy.

const privateIpRegex = /^(10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.)/;
const blockedHosts = ['localhost', '127.0.0.1', '0.0.0.0', '169.254.169.254', 'metadata.google.internal'];

function testValidate(urlStr) {
  try {
    const url = new URL(urlStr);
    const hostname = url.hostname.toLowerCase();
    
    if (blockedHosts.some(blocked => hostname.includes(blocked))) return false;
    if (privateIpRegex.test(hostname)) return false;
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
}

const testUrls = [
  'https://google.com',
  'http://127.0.0.1',
  'http://2130706433',       // Vulnerable? (Decimal)
  'http://[::1]',           // Vulnerable? (IPv6)
  'http://0x7f.0x0.0x0.0x1', // Vulnerable? (Hex)
  'https://10.0.0.1',
  'http://localhost.company.com' // Potential Bypass?
];

console.log('--- SSRF Logic Audit ---');
testUrls.forEach(url => {
  console.log(`${testValidate(url) ? '✅ ALLOWED' : '❌ BLOCKED'}: ${url}`);
});
