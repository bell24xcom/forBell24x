/**
 * Regression test for GET /api/supplier/[id] (information-disclosure fix,
 * 2026-10-26). Before this fix, the route looked up a user by id alone --
 * `findUnique({ where: { id } })` -- with no check that the id belonged to
 * a public, claimed, active supplier. Any valid user id, including a
 * buyer's, returned that user's name, company, location, trust score and
 * deal history. Found while auditing /suppliers/[city]/[category] for the
 * GSC "Discovered - currently not indexed" remediation -- this endpoint was
 * inconsistent with every other place in the codebase that decides supplier
 * public-visibility (src/app/sitemap.ts, src/app/suppliers/[city]/[category]/page.tsx),
 * all of which filter on role + isClaimed + isActive.
 */
import { test, mock, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

let findFirstArgs: unknown = null;
let userRow: Record<string, unknown> | null = null;

mock.module('@/lib/prisma', {
  namedExports: {
    prisma: {
      user: {
        findFirst: async (args: unknown) => {
          findFirstArgs = args;
          return userRow;
        },
      },
      quote: { count: async () => 0 },
      deal: { count: async () => 0 },
    },
  },
});

let GET: (req: unknown, ctx: { params: { id: string } }) => Promise<Response>;

before(async () => {
  ({ GET } = await import('./[id]/route.ts'));
});

beforeEach(() => {
  findFirstArgs = null;
  userRow = null;
});

test('looks up the user with role, isClaimed and isActive filters -- not by id alone', async () => {
  userRow = {
    id: 'u1', name: 'Real Supplier', company: 'Acme', location: 'Pune',
    gstNumber: '27AAAPP9753F2ZF', createdAt: new Date(), preferences: {}, trustScore: 80,
    _count: { quotes: 2 },
  };
  const res = await GET({}, { params: { id: 'u1' } });
  assert.equal(res.status, 200);
  const where = (findFirstArgs as { where: Record<string, unknown> }).where;
  assert.equal(where.id, 'u1');
  assert.equal(where.role, 'SUPPLIER');
  assert.equal(where.isClaimed, true);
  assert.equal(where.isActive, true);
});

test('a buyer or unclaimed/inactive user id (query correctly returns no row) is a 404, not their data', async () => {
  userRow = null; // the real DB would return no row for a buyer/unclaimed id, since the where clause now excludes them
  const res = await GET({}, { params: { id: 'some-buyer-id' } });
  assert.equal(res.status, 404);
  const json = await res.json();
  assert.equal(json.error, 'Supplier not found');
});

test('a real, public supplier profile never includes the raw GST number, only a boolean', async () => {
  userRow = {
    id: 'u2', name: 'Real Supplier', company: 'Acme', location: 'Pune',
    gstNumber: '27AAAPP9753F2ZF', createdAt: new Date(), preferences: {}, trustScore: 80,
    _count: { quotes: 2 },
  };
  const res = await GET({}, { params: { id: 'u2' } });
  const json = await res.json();
  assert.equal('gstNumber' in json.supplier, false);
  assert.equal(json.supplier.gstVerified, true);
});
