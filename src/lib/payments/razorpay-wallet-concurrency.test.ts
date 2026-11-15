/**
 * Real-concurrency proof for the TASK 38B Fix A wallet-creation race in
 * verifyAndCreditWalletTopup() (razorpay-wallet-intent.ts).
 *
 * WHY THIS FILE EXISTS, SEPARATE FROM razorpay-wallet-lifecycle.test.ts:
 * that file mocks Prisma and runs everything on one JS thread/process,
 * sequentially -- it proves the function's per-call LOGIC is correct, but
 * it structurally cannot prove the concurrency guarantee itself (two mocked
 * calls never actually race). Same rationale as this repo's own
 * src/app/api/monetization/pay/route.concurrency.test.ts (Task 28), which
 * this file follows in structure and in its embedded-postgres approach.
 *
 * Unlike that Task 28 file, this one does NOT re-implement the SQL shape
 * separately -- it imports and calls the REAL
 * `verifyAndCreditWalletTopup()` directly, with `DATABASE_URL`/`DIRECT_URL`
 * pointed at a real embedded Postgres instance before `@/lib/prisma` is
 * ever imported. That is possible here (and wasn't attempted for Task 28)
 * because no Prisma driver-adapter or schema change is needed -- the
 * standard generated client already connects via `DATABASE_URL`.
 *
 * The schema applied is this repo's ACTUAL migration SQL for the tables
 * this function touches (0001_baseline + 0015_payment_intents), not a
 * hand-rolled approximation -- including the real `wallets_user_id_key`
 * unique index this fix depends on. Applying the FULL 15-migration history
 * in order was attempted first and failed at 0008_consent_jurisdiction_basis
 * ("relation public.consent_events does not exist" -- no migration file in
 * this repo actually CREATEs that table, confirmed via a grep for
 * "consent_events" across every migration.sql file under prisma/migrations;
 * it only has an ALTER TABLE on it). That is a real, pre-existing migration-history gap
 * unrelated to this fix -- see
 * docs/audits/TASK38B_WALLET_RACE_AND_WEBHOOK_RECOVERY.md Section 13 for the
 * finding. This file applies only the two migrations relevant here.
 *
 * Determinism (not timing-luck): the "concurrent first deposit" scenario
 * holds an uncommitted INSERT open on a raw `pg` connection before issuing
 * the two real concurrent calls, and asserts they have NOT resolved while
 * that connection's transaction remains open -- only committing it and then
 * observing the real calls resolve proves a genuine block, not a fast race
 * that happened to come out clean.
 *
 * Not part of `npm test`/CI -- downloads real Postgres binaries on first
 * run and spawns a local server process. Run explicitly via
 * `npm run test:wallet-concurrency`.
 */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';
// @ts-expect-error -- no bundled type declarations for the default export shape used here
import EmbeddedPostgres from 'embedded-postgres';
import { Client } from 'pg';

const dataDir = path.join(os.tmpdir(), `bell24h-wallet-concurrency-${Date.now()}`);
const port = 55521;

const pgServer = new EmbeddedPostgres({
  databaseDir: dataDir,
  user: 'postgres',
  password: 'password',
  port,
  persistent: false,
  onLog: () => {},
  onError: (e: unknown) => console.error('[embedded-postgres]', e),
});

function connectionString() {
  return `postgresql://postgres:password@127.0.0.1:${port}/postgres`;
}

function newClient(): Client {
  const c = new Client({ connectionString: connectionString() });
  c.on('error', (e) => console.error('[pg.Client error, swallowed]', (e as Error).message));
  return c;
}

function assertLocalOnly(url: string) {
  if (!url.startsWith('postgresql://postgres:password@127.0.0.1:')) {
    throw new Error(`REFUSING TO PROCEED: connection string does not point at the embedded instance: ${url.replace(/:[^:@]+@/, ':***@')}`);
  }
}

let verifyAndCreditWalletTopup: typeof import('./razorpay-wallet-intent').verifyAndCreditWalletTopup;
let prisma: typeof import('@/lib/prisma').prisma;

before(async () => {
  await pgServer.initialise();
  await pgServer.start();

  const setup = newClient();
  await setup.connect();

  const migrationsDir = path.join(__dirname, '..', '..', '..', 'prisma', 'migrations');
  for (const dir of ['0001_baseline', '0015_payment_intents']) {
    const sqlPath = path.join(migrationsDir, dir, 'migration.sql');
    // Strip non-ASCII bytes (e.g. box-drawing characters in comments) --
    // the embedded instance's server encoding defaults to the OS codepage
    // regardless of the SQL file's own UTF-8 encoding, and non-ASCII bytes
    // even inside a `--` comment still have to round-trip through it to be
    // tokenized. Comments carry no semantic weight, so this changes nothing
    // about the DDL under test.
    const sql = fs.readFileSync(sqlPath, 'utf8').replace(/[^\x00-\x7F]/g, '?');
    await setup.query(sql);
  }

  async function seedUser(id: string) {
    await setup.query(`INSERT INTO users (id, "updatedAt") VALUES ($1, now())`, [id]);
  }
  async function seedIntent(id: string, userId: string, orderId: string, amountPaise: number) {
    await setup.query(
      `INSERT INTO payment_intents (id, user_id, purpose, order_id, payment_id, amount_paise, currency, status, updated_at)
       VALUES ($1, $2, 'WALLET_DEPOSIT', $3, NULL, $4, 'INR', 'PENDING', now())`,
      [id, userId, orderId, amountPaise],
    );
  }

  await seedUser('race-user-1');
  await seedIntent('intent_r1a', 'race-user-1', 'order_race_1a', 50000); // Rs 500
  await seedIntent('intent_r1b', 'race-user-1', 'order_race_1b', 30000); // Rs 300

  await seedUser('race-user-2');
  await seedIntent('intent_r2', 'race-user-2', 'order_race_2', 20000);
  await seedUser('race-user-3');
  await seedIntent('intent_r3', 'race-user-3', 'order_race_3', 20000);

  await seedUser('existing-wallet-user');
  await setup.query(
    `INSERT INTO wallets (id, user_id, balance, currency, "createdAt", "updatedAt") VALUES ('wallet_existing', 'existing-wallet-user', 100, 'INR', now(), now())`,
  );
  await seedIntent('intent_existing', 'existing-wallet-user', 'order_existing_1', 15000);

  await seedUser('fail-retry-user');
  await seedIntent('intent_fail', 'fail-retry-user', 'order_fail_1', 10000);

  await seedUser('negative-control-user');

  await setup.end();

  process.env.DATABASE_URL = connectionString();
  process.env.DIRECT_URL = connectionString();
  assertLocalOnly(process.env.DATABASE_URL);
  assertLocalOnly(process.env.DIRECT_URL);

  ({ verifyAndCreditWalletTopup } = await import('./razorpay-wallet-intent'));
  ({ prisma } = await import('@/lib/prisma'));
});

after(async () => {
  await prisma.$disconnect();
  await pgServer.stop();
});

test('real Postgres: two concurrent first-deposit verifications for the SAME new user -- exactly one wallet, both credited, genuine block proven', async () => {
  const blocker = newClient();
  await blocker.connect();
  await blocker.query('BEGIN');
  // Hold an uncommitted INSERT on the exact row the fix's raw
  // INSERT ... ON CONFLICT will contend with -- this is what the pre-fix
  // findUnique+create race actually hit in production: a concurrent insert
  // for the same user_id while this one is still in flight.
  await blocker.query(
    `INSERT INTO wallets (id, user_id, balance, currency, "createdAt", "updatedAt") VALUES ('wallet_blocker_r1', 'race-user-1', 0, 'INR', now(), now())`,
  );

  const bothPromise = Promise.all([
    verifyAndCreditWalletTopup({ userId: 'race-user-1', orderId: 'order_race_1a', paymentId: 'pay_race_1a', signature: null, trustedSource: true }),
    verifyAndCreditWalletTopup({ userId: 'race-user-1', orderId: 'order_race_1b', paymentId: 'pay_race_1b', signature: null, trustedSource: true }),
  ]);
  const raceOutcome = await Promise.race([
    bothPromise.then(() => 'both_finished'),
    new Promise((resolve) => setTimeout(() => resolve('timeout_still_blocked'), 700)),
  ]);
  assert.equal(raceOutcome, 'timeout_still_blocked', 'both real calls must still be blocked while the uncommitted INSERT holds the row');

  await blocker.query('COMMIT');
  await blocker.end();
  const [res1a, res1b] = await bothPromise;
  assert.equal(res1a.outcome, 'CREDITED');
  assert.equal(res1b.outcome, 'CREDITED');

  const verify = newClient();
  await verify.connect();
  const wallets = await verify.query(`SELECT id, balance FROM wallets WHERE user_id = 'race-user-1'`);
  const txns = await verify.query(`SELECT reference FROM wallet_transactions WHERE wallet_id IN (SELECT id FROM wallets WHERE user_id = 'race-user-1')`);
  assert.equal(wallets.rowCount, 1, 'exactly one wallet row for this user, including the blocker fixture itself');
  assert.equal(Number(wallets.rows[0].balance), 800, '500 + 300 credited onto the single real wallet row');
  assert.equal(txns.rowCount, 2, 'both deposits recorded as separate credit transactions on the one wallet');
  await verify.end();
});

test('negative control: the pre-fix findUnique+create logic throws under the identical real-Postgres race', async () => {
  async function oldBuggyFindOrCreate(userId: string) {
    let wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) {
      wallet = await prisma.wallet.create({ data: { userId, balance: 0 } });
    }
    return wallet;
  }

  const blocker = newClient();
  await blocker.connect();
  await blocker.query('BEGIN');
  await blocker.query(
    `INSERT INTO wallets (id, user_id, balance, currency, "createdAt", "updatedAt") VALUES ('wallet_blocker_neg', 'negative-control-user', 0, 'INR', now(), now())`,
  );

  const oldCallPromise = oldBuggyFindOrCreate('negative-control-user');
  await new Promise((r) => setTimeout(r, 300));
  await blocker.query('COMMIT');
  await blocker.end();

  await assert.rejects(
    oldCallPromise,
    /Unique constraint failed on the fields: \(`user_id`\)/,
    'this proves the test harness actually reproduces the race -- a harness that could not fail this way would prove nothing about the fix',
  );
});

test('real Postgres: two different new users depositing concurrently -- no interference, two separate wallets', async () => {
  const [res2, res3] = await Promise.all([
    verifyAndCreditWalletTopup({ userId: 'race-user-2', orderId: 'order_race_2', paymentId: 'pay_race_2', signature: null, trustedSource: true }),
    verifyAndCreditWalletTopup({ userId: 'race-user-3', orderId: 'order_race_3', paymentId: 'pay_race_3', signature: null, trustedSource: true }),
  ]);
  assert.equal(res2.outcome, 'CREDITED');
  assert.equal(res3.outcome, 'CREDITED');

  const verify = newClient();
  await verify.connect();
  const count = await verify.query(`SELECT COUNT(*) FROM wallets WHERE user_id IN ('race-user-2','race-user-3')`);
  assert.equal(Number(count.rows[0].count), 2);
  await verify.end();
});

test('real Postgres: existing wallet receives a new verified deposit -- balance increments, no duplicate wallet row', async () => {
  const res = await verifyAndCreditWalletTopup({ userId: 'existing-wallet-user', orderId: 'order_existing_1', paymentId: 'pay_existing_1', signature: null, trustedSource: true });
  assert.equal(res.outcome, 'CREDITED');

  const verify = newClient();
  await verify.connect();
  const row = await verify.query(`SELECT COUNT(*) AS n, MAX(balance) AS balance FROM wallets WHERE user_id = 'existing-wallet-user'`);
  assert.equal(Number(row.rows[0].n), 1);
  assert.equal(Number(row.rows[0].balance), 250, '100 pre-existing + 150 credited');
  await verify.end();
});

test('real Postgres: a failure partway through the transaction rolls back the claim (not stranded PAID); retry then credits exactly once', async () => {
  const verify = newClient();
  await verify.connect();

  await verify.query(`
    CREATE OR REPLACE FUNCTION fail_specific_reference() RETURNS trigger AS $$
    BEGIN
      IF NEW.reference = 'pay_fail_trigger' THEN
        RAISE EXCEPTION 'SIMULATED_FAILURE_FOR_TASK38B_TEST';
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);
  await verify.query(`
    CREATE TRIGGER fail_specific_reference_trigger
    BEFORE INSERT ON wallet_transactions
    FOR EACH ROW EXECUTE FUNCTION fail_specific_reference();
  `);

  await assert.rejects(
    verifyAndCreditWalletTopup({ userId: 'fail-retry-user', orderId: 'order_fail_1', paymentId: 'pay_fail_trigger', signature: null, trustedSource: true }),
    /SIMULATED_FAILURE_FOR_TASK38B_TEST/,
  );

  const intentAfterFailure = await verify.query(`SELECT status, payment_id FROM payment_intents WHERE order_id = 'order_fail_1'`);
  const walletsAfterFailure = await verify.query(`SELECT COUNT(*) FROM wallets WHERE user_id = 'fail-retry-user'`);
  assert.equal(intentAfterFailure.rows[0].status, 'PENDING', 'intent must not be stranded as PAID when the credit transaction fails');
  assert.equal(intentAfterFailure.rows[0].payment_id, null);
  assert.equal(Number(walletsAfterFailure.rows[0].count), 0, 'the wallet insert from the failed transaction must also be rolled back');

  await verify.query(`DROP TRIGGER fail_specific_reference_trigger ON wallet_transactions;`);

  const retryResult = await verifyAndCreditWalletTopup({ userId: 'fail-retry-user', orderId: 'order_fail_1', paymentId: 'pay_fail_1_retry', signature: null, trustedSource: true });
  assert.equal(retryResult.outcome, 'CREDITED');

  const after2 = await verify.query(`
    SELECT
      (SELECT COUNT(*) FROM wallets WHERE user_id = 'fail-retry-user') AS wallet_count,
      (SELECT COUNT(*) FROM wallet_transactions wt JOIN wallets w ON w.id = wt.wallet_id WHERE w.user_id = 'fail-retry-user') AS txn_count
  `);
  assert.equal(Number(after2.rows[0].wallet_count), 1);
  assert.equal(Number(after2.rows[0].txn_count), 1, 'the failed attempt must not have left a credit transaction behind');

  await verify.end();
});
