import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  canTransition,
  canInvokeTransport,
  isTerminal,
  INITIAL_STATUS,
  nextAllowedStatuses,
} from './campaignStateMachine.ts';

test('a new campaign starts DRAFT', () => {
  assert.equal(INITIAL_STATUS, 'DRAFT');
});

test('only LIVE may invoke transport (critical safety test)', () => {
  const statuses = ['DRAFT', 'DRY_RUN', 'READY', 'LIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'] as const;
  for (const status of statuses) {
    assert.equal(canInvokeTransport(status), status === 'LIVE', `canInvokeTransport(${status}) should be ${status === 'LIVE'}`);
  }
});

test('DRAFT cannot jump straight to LIVE', () => {
  assert.equal(canTransition('DRAFT', 'LIVE'), false);
});

test('DRAFT cannot jump straight to READY', () => {
  assert.equal(canTransition('DRAFT', 'READY'), false);
});

test('the only path to LIVE is DRAFT -> DRY_RUN -> READY -> LIVE', () => {
  assert.equal(canTransition('DRAFT', 'DRY_RUN'), true);
  assert.equal(canTransition('DRY_RUN', 'READY'), true);
  assert.equal(canTransition('READY', 'LIVE'), true);
});

test('LIVE can be paused and resumed', () => {
  assert.equal(canTransition('LIVE', 'PAUSED'), true);
  assert.equal(canTransition('PAUSED', 'LIVE'), true);
});

test('terminal states allow no further transitions', () => {
  assert.equal(isTerminal('COMPLETED'), true);
  assert.equal(isTerminal('CANCELLED'), true);
  assert.deepEqual(nextAllowedStatuses('COMPLETED'), []);
  assert.deepEqual(nextAllowedStatuses('CANCELLED'), []);
});

test('cancellation is reachable from every non-terminal state', () => {
  for (const status of ['DRAFT', 'DRY_RUN', 'READY', 'LIVE', 'PAUSED'] as const) {
    assert.equal(canTransition(status, 'CANCELLED'), true, `${status} -> CANCELLED should be allowed`);
  }
});
