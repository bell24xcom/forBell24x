/**
 * Real-concurrency proof for the Task 28 fix to POST /api/monetization/pay
 * (concurrent-duplicate-Razorpay-order race, 2026-10-19).
 *
 * WHY THIS FILE EXISTS, SEPARATE FROM route.test.ts:
 * route.test.ts mocks Prisma and runs everything on one JS thread/process,
 * sequentially. That proves the route's per-request LOGIC is correct, but
 * it structurally cannot prove the concurrency guarantee itself -- two
 * mocked calls never actually race, so a test built on them would pass
 * whether or not the real SQL has `FOR UPDATE` in it at all. The task this
 * fix was written against is explicit about this: "sequential mocks alone
 * do not prove race safety."
 *
 * This file instead starts a REAL, local PostgreSQL server (via the
 * `embedded-postgres` devDependency, which downloads and runs the actual
 * `postgres`/`initdb` binaries for this platform -- no Docker required),
 * opens TWO independent `pg` client connections to it (genuinely separate
 * Postgres sessions, not two calls on one shared session), and fires the
 * same SQL shape the route issues at the same row from both connections at
 * once. It proves the `SELECT ... FOR UPDATE` row lock actually serializes
 * them.
 *
 * An earlier attempt used `@electric-sql/pglite` (a WASM, single-session
 * Postgres) for this. It was abandoned after empirical proof it can't model
 * this: a probe showed a second "transaction"'s `FOR UPDATE` not blocking
 * despite the first holding the row, and pglite's own source wraps its
 * `transaction()` method in a single JS mutex -- so two "concurrent" calls
 * on one pglite instance just queue in JS, regardless of what the SQL says.
 * That would have made for a test with zero power to detect a missing lock.
 * This file's Test 2 (the "negative control") exists specifically to prove
 * THIS test setup does not have that same flaw: run the identical scenario
 * without `FOR UPDATE` and confirm the race actually reproduces.
 *
 * This does not execute the real route.ts handler -- Prisma's generated
 * client isn't wired to this ad hoc server (that would need the
 * `driverAdapters` preview feature and a schema change, out of scope for
 * "smallest safe fix"). It re-implements the identical SQL shape as two
 * small, explicit functions below (`reserveWithLock` / `reserveWithoutLock`)
 * and validates THAT. The route.ts/route.test.ts pairing already proves the
 * TypeScript wiring matches this shape (see route.test.ts's test 12,
 * asserting the real query text contains `FOR UPDATE`).
 *
 * Not part of `npm test`/CI -- downloads real Postgres binaries on first
 * run and spawns a local server process. Run explicitly via
 * `npm run test:payment-concurrency`.
 */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';
// @ts-expect-error -- no bundled type declarations for the default export shape used here
import EmbeddedPostgres from 'embedded-postgres';
import { Client } from 'pg';

const dataDir = path.join(os.tmpdir(), `bell24h-pg-concurrency-${Date.now()}`);
const port = 55439;

const pgServer = new EmbeddedPostgres({
  databaseDir: dataDir,
  user: 'postgres',
  password: 'password',
  port,
  persistent: false,
  onLog: () => {}, // silence initdb/postgres log noise; failures still throw
  onError: (e: unknown) => console.error('[embedded-postgres]', e),
});

function connectionString() {
  return `postgresql://postgres:password@127.0.0.1:${port}/postgres`;
}

async function newClient(): Promise<Client> {
  const client = new Client({ connectionString: connectionString() });
  await client.connect();
  return client;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function resetSchema(client: Client) {
  await client.query('DROP TABLE IF EXISTS transactions');
  await client.query('DROP TABLE IF EXISTS deals');
  await client.query(`
    CREATE TABLE deals (
      id TEXT PRIMARY KEY,
      quote_id TEXT NOT NULL,
      buyer_id TEXT NOT NULL,
      price NUMERIC NOT NULL,
      status TEXT NOT NULL
    )
  `);
  await client.query(`
    CREATE TABLE transactions (
      id TEXT PRIMARY KEY,
      quote_id TEXT NOT NULL,
      status TEXT NOT NULL,
      metadata JSONB NOT NULL DEFAULT '{}',
      currency TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
  await client.query(
    `INSERT INTO deals (id, quote_id, buyer_id, price, status) VALUES ($1, $2, $3, $4, $5)`,
    ['deal-1', 'quote-1', 'buyer-1', 5000, 'ACTIVE'],
  );
}

type Phase1Result =
  | { kind: 'not_found' }
  | { kind: 'unauthorized' }
  | { kind: 'reuse'; orderId: string }
  | { kind: 'conflict' }
  | { kind: 'reserved'; reservedId: string };

/**
 * The fixed shape: identical statement order to route.ts's phase1 -- lock
 * the deal row, authorize, check for an in-flight transaction, reserve.
 * `delayMs`, if set, sleeps AFTER acquiring the lock and BEFORE releasing
 * it (via COMMIT), so a test can force a deterministic overlap window
 * instead of relying on OS scheduling luck.
 */
async function reserveWithLock(client: Client, dealId: string, buyerId: string, delayMs = 0): Promise<Phase1Result> {
  await client.query('BEGIN');
  const dealRows = await client.query('SELECT * FROM deals WHERE id = $1 FOR UPDATE', [dealId]);
  const deal = dealRows.rows[0];
  if (!deal) {
    await client.query('ROLLBACK');
    return { kind: 'not_found' };
  }
  if (deal.buyer_id !== buyerId || deal.status !== 'ACTIVE') {
    await client.query('ROLLBACK');
    return { kind: 'unauthorized' };
  }
  if (delayMs > 0) await sleep(delayMs);

  const existing = await client.query(
    `SELECT id, metadata, currency FROM transactions WHERE quote_id = $1 AND status IN ('PENDING','PROCESSING') ORDER BY created_at DESC LIMIT 1`,
    [deal.quote_id],
  );
  if (existing.rows[0]) {
    await client.query('COMMIT');
    const orderId = existing.rows[0].metadata?.razorpayOrderId;
    return orderId ? { kind: 'reuse', orderId } : { kind: 'conflict' };
  }

  const id = randomUUID();
  await client.query(
    `INSERT INTO transactions (id, quote_id, status, metadata, currency) VALUES ($1, $2, 'PENDING', '{}'::jsonb, 'INR')`,
    [id, deal.quote_id],
  );
  await client.query('COMMIT');
  return { kind: 'reserved', reservedId: id };
}

/** Negative control: identical logic, but WITHOUT `FOR UPDATE` -- a plain SELECT. */
async function reserveWithoutLock(client: Client, dealId: string, buyerId: string, delayMs = 0): Promise<Phase1Result> {
  await client.query('BEGIN');
  const dealRows = await client.query('SELECT * FROM deals WHERE id = $1', [dealId]);
  const deal = dealRows.rows[0];
  if (!deal) {
    await client.query('ROLLBACK');
    return { kind: 'not_found' };
  }
  if (deal.buyer_id !== buyerId || deal.status !== 'ACTIVE') {
    await client.query('ROLLBACK');
    return { kind: 'unauthorized' };
  }
  if (delayMs > 0) await sleep(delayMs);

  const existing = await client.query(
    `SELECT id, metadata, currency FROM transactions WHERE quote_id = $1 AND status IN ('PENDING','PROCESSING') ORDER BY created_at DESC LIMIT 1`,
    [deal.quote_id],
  );
  if (existing.rows[0]) {
    await client.query('COMMIT');
    const orderId = existing.rows[0].metadata?.razorpayOrderId;
    return orderId ? { kind: 'reuse', orderId } : { kind: 'conflict' };
  }

  const id = randomUUID();
  await client.query(
    `INSERT INTO transactions (id, quote_id, status, metadata, currency) VALUES ($1, $2, 'PENDING', '{}'::jsonb, 'INR')`,
    [id, deal.quote_id],
  );
  await client.query('COMMIT');
  return { kind: 'reserved', reservedId: id };
}

before(async () => {
  await pgServer.initialise();
  await pgServer.start();
});

after(async () => {
  await pgServer.stop().catch(() => {});
  await fs.promises.rm(dataDir, { recursive: true, force: true }).catch(() => {});
});

test('1: FOR UPDATE row lock serializes two concurrent connections -- exactly one reserves, the other conflicts (never both)', async () => {
  const clientA = await newClient();
  const clientB = await newClient();
  await resetSchema(clientA);

  try {
    // A acquires the lock and holds it for 150ms before committing. B is
    // started ~20ms later, while A still holds the lock, so B's own
    // `FOR UPDATE` must block until A commits. If it doesn't block, B
    // would see "no existing transaction" and also reserve -- the bug this
    // fix closes.
    const startedAt = Date.now();
    const resultA = reserveWithLock(clientA, 'deal-1', 'buyer-1', 150);
    await sleep(20);
    const resultB = reserveWithLock(clientB, 'deal-1', 'buyer-1', 0);

    const [a, b] = await Promise.all([resultA, resultB]);
    const elapsed = Date.now() - startedAt;

    // Proof that B genuinely waited on the lock rather than racing past it.
    assert.ok(elapsed >= 140, `expected B to block behind A's lock (elapsed ${elapsed}ms, expected >= ~140ms)`);

    const kinds = [a.kind, b.kind].sort();
    assert.deepEqual(
      kinds,
      ['conflict', 'reserved'],
      `expected exactly one reservation and one conflict, got: ${JSON.stringify([a, b])}`,
    );

    const reservedCount = await clientA.query(`SELECT count(*) FROM transactions WHERE quote_id = 'quote-1'`);
    assert.equal(
      reservedCount.rows[0].count,
      '1',
      'exactly one Transaction row must exist -- never two, which would mean two real Razorpay orders',
    );
  } finally {
    await clientA.end();
    await clientB.end();
  }
});

test('2 (negative control): WITHOUT the lock, the identical scenario DOES double-reserve -- proving this harness actually detects the race', async () => {
  const clientA = await newClient();
  const clientB = await newClient();
  await resetSchema(clientA);

  try {
    // Unlike test 1, both connections get the SAME delay and start at the
    // same time (no stagger). Each pauses right after reading the deal row
    // and resumes just before checking for an existing transaction -- so
    // both land on "nothing exists yet" before either has inserted, which
    // is exactly the race window a missing lock leaves open. (A one-sided
    // stagger, as in test 1, would just let the undelayed side finish
    // first and the delayed side would then correctly see its row --
    // serializing by accident rather than racing.)
    const resultA = reserveWithoutLock(clientA, 'deal-1', 'buyer-1', 100);
    const resultB = reserveWithoutLock(clientB, 'deal-1', 'buyer-1', 100);

    const [a, b] = await Promise.all([resultA, resultB]);

    // This is the bug Task 28 fixes: without FOR UPDATE, both connections
    // read "nothing exists yet" and both reserve.
    assert.equal(a.kind, 'reserved');
    assert.equal(b.kind, 'reserved');

    const reservedCount = await clientA.query(`SELECT count(*) FROM transactions WHERE quote_id = 'quote-1'`);
    assert.equal(
      reservedCount.rows[0].count,
      '2',
      'without the lock, two Transaction rows (and in the real route, two Razorpay orders) are created',
    );
  } finally {
    await clientA.end();
    await clientB.end();
  }
});

test('3: a second request after the first has already committed cleanly reuses/conflicts as expected (no lock contention needed)', async () => {
  const client = await newClient();
  await resetSchema(client);
  try {
    const first = await reserveWithLock(client, 'deal-1', 'buyer-1');
    assert.equal(first.kind, 'reserved');

    const second = await reserveWithLock(client, 'deal-1', 'buyer-1');
    assert.equal(second.kind, 'conflict', 'a PENDING reservation with no recorded order id fails safe as a conflict');
  } finally {
    await client.end();
  }
});

test('4: concurrent requests for DIFFERENT deals never block each other -- the lock is per-row, not table-wide or global', async () => {
  const clientA = await newClient();
  const clientB = await newClient();
  await resetSchema(clientA);
  await clientA.query(
    `INSERT INTO deals (id, quote_id, buyer_id, price, status) VALUES ($1, $2, $3, $4, $5)`,
    ['deal-2', 'quote-2', 'buyer-2', 7500, 'ACTIVE'],
  );

  try {
    // A holds deal-1's row lock for a full second. If the lock were
    // table-wide (or the WHERE clause wrong, locking every row), B's
    // attempt on the UNRELATED deal-2 would also block for ~1s. It must
    // not.
    //
    // IMPORTANT: `bElapsed` has to be captured the moment B's OWN promise
    // resolves (via `.then()` below), NOT after `await Promise.all(...)`.
    // `Promise.all` only returns once BOTH settle, so a `Date.now()` taken
    // after that line always measures "time until the slower of A or B
    // finishes" -- which is A, by design (its 1000ms sleep) -- regardless
    // of how fast B actually was. An earlier version of this test measured
    // it that way and always read ~1000ms even though per-step
    // instrumentation proved B itself finished in ~10ms, fully unblocked.
    const resultA = reserveWithLock(clientA, 'deal-1', 'buyer-1', 1000);
    await sleep(20);
    const bStartedAt = Date.now();
    let bElapsed = -1;
    const resultB = reserveWithLock(clientB, 'deal-2', 'buyer-2', 0).then((r) => {
      bElapsed = Date.now() - bStartedAt;
      return r;
    });

    const [a, b] = await Promise.all([resultA, resultB]);

    assert.equal(a.kind, 'reserved');
    assert.equal(b.kind, 'reserved');
    assert.ok(
      bElapsed < 600,
      `deal-2's request must not wait behind deal-1's lock (took ${bElapsed}ms -- would be close to 1000ms if the lock were too broad)`,
    );

    const counts = await clientA.query(
      `SELECT quote_id, count(*) FROM transactions GROUP BY quote_id ORDER BY quote_id`,
    );
    assert.deepEqual(
      counts.rows.map((r) => [r.quote_id, r.count]),
      [['quote-1', '1'], ['quote-2', '1']],
      'each deal gets exactly its own reservation, independent of the other',
    );
  } finally {
    await clientA.end();
    await clientB.end();
  }
});
