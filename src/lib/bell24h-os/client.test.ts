import { test, before, after, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { generateAiText, getReadiness, getSafeStatus } from './client.ts';

const TEST_URL = 'https://bell24h-os.example.test';
const TEST_TOKEN = 'test-service-token-aaaaaaaaaaaaaaaaaaaa';

const ORIGINAL_URL = process.env.BELL24H_OS_BASE_URL;
const ORIGINAL_TOKEN = process.env.BELL24H_VYAPARSETHU_SERVICE_TOKEN;
const ORIGINAL_FETCH = globalThis.fetch;

function clearConfigEnv() {
  delete process.env.BELL24H_OS_BASE_URL;
  delete process.env.BELL24H_VYAPARSETHU_SERVICE_TOKEN;
}

/** Restores the shared test-suite baseline (both vars set) - every config
 * test that mutates env vars must call this before returning, since the
 * later fetch-mock tests below assume this baseline is in place. */
function restoreSuiteBaselineEnv() {
  process.env.BELL24H_OS_BASE_URL = TEST_URL;
  process.env.BELL24H_VYAPARSETHU_SERVICE_TOKEN = TEST_TOKEN;
}

interface CapturedCall {
  url: string;
  init: RequestInit;
}
let captured: CapturedCall | null = null;
let mockResponse: { status: number; body: unknown } = { status: 200, body: { text: 'ok', requestId: 'req_1' } };

function installMockFetch() {
  captured = null;
  // @ts-expect-error - test double, narrower than the real fetch signature
  globalThis.fetch = async (url: string, init: RequestInit) => {
    captured = { url, init };
    return {
      ok: mockResponse.status >= 200 && mockResponse.status < 300,
      status: mockResponse.status,
      json: async () => mockResponse.body,
    } as Response;
  };
}

before(() => {
  restoreSuiteBaselineEnv();
});

after(() => {
  globalThis.fetch = ORIGINAL_FETCH;
  if (ORIGINAL_URL === undefined) delete process.env.BELL24H_OS_BASE_URL; else process.env.BELL24H_OS_BASE_URL = ORIGINAL_URL;
  if (ORIGINAL_TOKEN === undefined) delete process.env.BELL24H_VYAPARSETHU_SERVICE_TOKEN; else process.env.BELL24H_VYAPARSETHU_SERVICE_TOKEN = ORIGINAL_TOKEN;
});

beforeEach(() => {
  installMockFetch();
  mockResponse = { status: 200, body: { text: 'ok', requestId: 'req_1' } };
});

afterEach(() => {
  globalThis.fetch = ORIGINAL_FETCH;
  // Every test in this file relies on the shared baseline unless it
  // explicitly overrides env vars itself - restore it unconditionally so
  // test order never matters.
  restoreSuiteBaselineEnv();
});

// ─── Config ─────────────────────────────────────────────────────────────

test('config: getReadiness is not ready when both vars are missing (A: missing configuration)', () => {
  clearConfigEnv();
  const result = getReadiness();
  assert.equal(result.ready, false);
  assert.ok(result.missing.includes('BELL24H_OS_BASE_URL'));
  assert.ok(result.missing.includes('BELL24H_VYAPARSETHU_SERVICE_TOKEN'));
});

test('config: getReadiness is not ready when only the base URL is set', () => {
  clearConfigEnv();
  process.env.BELL24H_OS_BASE_URL = 'https://example.test';
  const result = getReadiness();
  assert.equal(result.ready, false);
  assert.deepEqual(result.missing, ['BELL24H_VYAPARSETHU_SERVICE_TOKEN']);
});

test('config: getReadiness is ready when both vars are set', () => {
  const result = getReadiness();
  assert.equal(result.ready, true);
  assert.deepEqual(result.missing, []);
});

test('config: getSafeStatus never includes the service token value (E: secrets not returned)', () => {
  const status = getSafeStatus();
  const serialized = JSON.stringify(status);
  assert.ok(!serialized.includes(TEST_TOKEN));
  assert.equal(status.status, 'READY');
  assert.equal(status.tokenConfigured, true);
  // The base URL is not a secret and is expected to appear.
  assert.equal(status.baseUrl, TEST_URL);
});

test('config: getSafeStatus reports NOT_CONFIGURED with no vars set', () => {
  clearConfigEnv();
  const status = getSafeStatus();
  assert.equal(status.status, 'NOT_CONFIGURED');
  assert.equal(status.tokenConfigured, false);
  assert.equal(status.baseUrlConfigured, false);
});

// ─── generateAiText ─────────────────────────────────────────────────────

test('A: missing configuration returns NOT_CONFIGURED and never calls fetch', async () => {
  clearConfigEnv();
  const result = await generateAiText('hello');
  assert.equal(result.status, 'NOT_CONFIGURED');
  assert.equal(captured, null, 'fetch must never be called when not configured');
});

test('B: sends the correct X-Bell24h-Service-Token header', async () => {
  await generateAiText('hello');
  assert.ok(captured, 'fetch should have been called');
  const headers = captured!.init.headers as Record<string, string>;
  assert.equal(headers['X-Bell24h-Service-Token'], TEST_TOKEN);
});

test("B: sends an X-Request-Id header matching Bell24h-OS's accepted pattern", async () => {
  await generateAiText('hello');
  const headers = captured!.init.headers as Record<string, string>;
  assert.match(headers['X-Request-Id'], /^[A-Za-z0-9_.-]{1,128}$/);
});

test('C: calls the correct Bell24h-OS endpoint', async () => {
  await generateAiText('hello');
  assert.equal(captured!.url, `${TEST_URL}/api/v1/ai/text`);
});

test('C: strips a trailing slash from the configured base URL before appending the path', async () => {
  process.env.BELL24H_OS_BASE_URL = `${TEST_URL}/`;
  await generateAiText('hello');
  assert.equal(captured!.url, `${TEST_URL}/api/v1/ai/text`);
});

test('request body carries only prompt (and provider, if given) - never an arbitrary field', async () => {
  await generateAiText('hello world');
  const body = JSON.parse(captured!.init.body as string);
  assert.deepEqual(body, { prompt: 'hello world' });
});

test('provider is included only when explicitly passed', async () => {
  await generateAiText('hello', 'nvidia');
  const body = JSON.parse(captured!.init.body as string);
  assert.deepEqual(body, { prompt: 'hello', provider: 'nvidia' });
});

test('D: a canonical error envelope (401) is translated safely, never throws', async () => {
  mockResponse = {
    status: 401,
    body: { error_code: 'AUTHENTICATION_FAILED', message: 'Service credential rejected.', request_id: 'req_2', correlation_id: 'req_2', retryable: false },
  };
  const result = await generateAiText('hello');
  assert.equal(result.status, 'ERROR');
  if (result.status === 'ERROR') {
    assert.equal(result.httpStatus, 401);
    assert.equal(result.errorCode, 'AUTHENTICATION_FAILED');
    assert.equal(result.message, 'Service credential rejected.');
    assert.equal(result.retryable, false);
  }
});

test('D: a 503 PROVIDER_UNAVAILABLE envelope is translated safely', async () => {
  mockResponse = {
    status: 503,
    body: { error_code: 'PROVIDER_UNAVAILABLE', message: 'Service authentication is not configured on the server.', request_id: 'req_3', correlation_id: 'req_3', retryable: true },
  };
  const result = await generateAiText('hello');
  assert.equal(result.status, 'ERROR');
  if (result.status === 'ERROR') {
    assert.equal(result.httpStatus, 503);
    assert.equal(result.errorCode, 'PROVIDER_UNAVAILABLE');
    assert.equal(result.retryable, true);
  }
});

test('D: fetch throwing (network failure) is translated safely, never propagates', async () => {
  // @ts-expect-error - test double
  globalThis.fetch = async () => { throw new Error('getaddrinfo ENOTFOUND'); };
  const result = await generateAiText('hello');
  assert.equal(result.status, 'ERROR');
  if (result.status === 'ERROR') {
    assert.equal(result.httpStatus, 0);
    assert.ok(result.message.includes('Network error'));
  }
});

test('E: no outcome branch ever serializes the service token', async () => {
  const okResult = await generateAiText('hello');
  assert.ok(!JSON.stringify(okResult).includes(TEST_TOKEN));

  mockResponse = { status: 401, body: { error_code: 'AUTHENTICATION_FAILED', message: 'Service credential rejected.', request_id: 'r', correlation_id: 'r', retryable: false } };
  const errResult = await generateAiText('hello');
  assert.ok(!JSON.stringify(errResult).includes(TEST_TOKEN));
});

test('G: a successful mocked response is translated correctly', async () => {
  mockResponse = { status: 200, body: { text: 'BELL24H-OS-INTEGRATION-OK', requestId: 'req_9' } };
  const result = await generateAiText('Return exactly: BELL24H-OS-INTEGRATION-OK');
  assert.equal(result.status, 'OK');
  if (result.status === 'OK') {
    assert.equal(result.text, 'BELL24H-OS-INTEGRATION-OK');
    assert.equal(result.requestId, 'req_9');
    assert.equal(result.httpStatus, 200);
  }
});

test('a 200 response missing the text field is treated as an error, not a silent success', async () => {
  mockResponse = { status: 200, body: { requestId: 'req_10' } };
  const result = await generateAiText('hello');
  assert.equal(result.status, 'ERROR');
});
