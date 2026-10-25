import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveNegotiationAiSuggestion } from './negotiation-ai-suggestion.ts';

test('OK with real text: proceeds, uses the AI text verbatim', () => {
  const result = resolveNegotiationAiSuggestion({ status: 'OK', text: 'Consider meeting at ₹45,000.', requestId: 'r1', httpStatus: 200 });
  assert.deepEqual(result, { proceed: true, suggestion: 'Consider meeting at ₹45,000.' });
});

test('OK with empty text: proceeds, uses the existing fixed fallback string (unchanged from before this change)', () => {
  const result = resolveNegotiationAiSuggestion({ status: 'OK', text: '', requestId: 'r1', httpStatus: 200 });
  assert.deepEqual(result, { proceed: true, suggestion: 'Let me think about this offer and get back to you.' });
});

test('NOT_CONFIGURED: does not proceed - preserves today\'s behavior that an AI failure halts the counter-offer entirely', () => {
  const result = resolveNegotiationAiSuggestion({ status: 'NOT_CONFIGURED', missing: ['BELL24H_OS_BASE_URL'] });
  assert.deepEqual(result, { proceed: false });
});

test('ERROR (upstream failure): does not proceed', () => {
  const result = resolveNegotiationAiSuggestion({ status: 'ERROR', httpStatus: 500, message: 'AI request failed' });
  assert.deepEqual(result, { proceed: false });
});

test('ERROR (timeout): does not proceed', () => {
  const result = resolveNegotiationAiSuggestion({ status: 'ERROR', httpStatus: 0, errorCode: 'TIMEOUT', message: 'timed out', retryable: true });
  assert.deepEqual(result, { proceed: false });
});
