-- MA-01 WI-7 (OPTIONAL, NOT APPLIED): backfill `profile_completed` events for suppliers that already finished
-- onboarding before the event existed. It WRITES to interaction_memory, so it needs the founder's explicit approval.
-- It does NOT touch users.claimed_at: inventing claim dates would fabricate timing data; the dashboard reports
-- "claimed without claimed_at" instead.
--
-- 1) Dry run (read-only): how many rows would be written?
SELECT count(*) AS would_insert
FROM users u
WHERE u.role = 'SUPPLIER'
  AND u.preferences::jsonb ->> 'onboardingComplete' = 'true'
  AND NOT EXISTS (SELECT 1 FROM interaction_memory m WHERE m.user_id = u.id AND m.action_type = 'profile_completed');

-- 2) The write (run inside a transaction, after the dry run matches what you expect; idempotent via NOT EXISTS):
-- BEGIN;
-- INSERT INTO interaction_memory (id, user_id, action_type, source, metadata, created_at)
-- SELECT 'ma01pc_' || u.id, u.id, 'profile_completed', 'discovery',
--        jsonb_build_object('backfilled', true, 'from', 'preferences.onboardingCompletedAt'),
--        COALESCE(NULLIF(u.preferences::jsonb ->> 'onboardingCompletedAt', '')::timestamptz AT TIME ZONE 'UTC', u."updatedAt")
-- FROM users u
-- WHERE u.role = 'SUPPLIER'
--   AND u.preferences::jsonb ->> 'onboardingComplete' = 'true'
--   AND NOT EXISTS (SELECT 1 FROM interaction_memory m WHERE m.user_id = u.id AND m.action_type = 'profile_completed');
-- COMMIT;
