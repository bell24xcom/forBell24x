import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderClaimTemplate, DEFAULT_CLAIM_TEMPLATE } from './messageTemplate.ts';

const vars = { company_name: 'Acme Traders', category: 'Pipes', city: 'Bhiwandi', claim_url: 'https://vyaparsethu.com/claim/abc' };

test('renders known variables', () => {
  const result = renderClaimTemplate('Hi {{company_name}}, visit {{claim_url}}', vars);
  assert.equal(result.ok, true);
  assert.equal(result.text, 'Hi Acme Traders, visit https://vyaparsethu.com/claim/abc');
});

test('the default template renders cleanly', () => {
  const result = renderClaimTemplate(DEFAULT_CLAIM_TEMPLATE, vars);
  assert.equal(result.ok, true);
  assert.ok(result.text!.includes('Acme Traders'));
});

test('rejects an unknown template variable', () => {
  const result = renderClaimTemplate('Hi {{company_name}}, your {{discount_code}} awaits', vars);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some(e => e.includes('discount_code')));
});

test('rejects "verified" claim language by default', () => {
  const result = renderClaimTemplate('{{company_name}} is a verified supplier. {{claim_url}}', vars);
  assert.equal(result.ok, false);
  assert.ok(result.errors.length > 0);
});

test('rejects "GST verified" claim language', () => {
  const result = renderClaimTemplate('{{company_name}} is GST verified. {{claim_url}}', vars);
  assert.equal(result.ok, false);
});

test('rejects guaranteed-outcome language', () => {
  const result = renderClaimTemplate('{{company_name}}, we guarantee leads for you. {{claim_url}}', vars);
  assert.equal(result.ok, false);
});

test('allowVerifiedClaim opts a specific render out of the truthfulness guard', () => {
  const result = renderClaimTemplate('{{company_name}} is a verified supplier. {{claim_url}}', vars, { allowVerifiedClaim: true });
  assert.equal(result.ok, true);
});

test('a malicious variable value cannot inject a template placeholder', () => {
  const evilVars = { ...vars, company_name: '{{claim_url}}' };
  const result = renderClaimTemplate('Hi {{company_name}}!', evilVars);
  assert.equal(result.ok, true);
  // The literal braces must be stripped, not re-interpreted as a placeholder.
  assert.equal(result.text, 'Hi claim_url!');
});

test('control characters are stripped from substituted values', () => {
  const evilVars = { ...vars, company_name: 'Acme\x00\x1FTraders' };
  const result = renderClaimTemplate('{{company_name}}', evilVars);
  assert.equal(result.ok, true);
  assert.equal(result.text, 'AcmeTraders');
});
