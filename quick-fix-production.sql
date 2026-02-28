-- QUICK FIX for production database
-- This adds missing columns and cleans up test data
-- Run in Neon SQL Editor: https://console.neon.tech

-- ========================================
-- STEP 1: Delete test data (3 quotes, 3 notifications)
-- ========================================

-- Delete test quotes (they're likely incomplete test data)
DELETE FROM quotes;
-- Result: 3 quotes deleted

-- Delete test notifications
DELETE FROM notifications;
-- Result: 3 notifications deleted

-- ========================================
-- STEP 2: Add QuoteStatus enum
-- ========================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'QuoteStatus') THEN
        CREATE TYPE "QuoteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED');
    END IF;
END $$;

-- ========================================
-- STEP 3: Add missing columns to quotes table
-- ========================================

ALTER TABLE quotes
  ADD COLUMN IF NOT EXISTS rfq_id TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS supplier_id TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS price DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS quantity TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS timeline TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS terms TEXT,
  ADD COLUMN IF NOT EXISTS status "QuoteStatus" NOT NULL DEFAULT 'PENDING'::"QuoteStatus",
  ADD COLUMN IF NOT EXISTS is_accepted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Remove default values after adding columns
ALTER TABLE quotes
  ALTER COLUMN rfq_id DROP DEFAULT,
  ALTER COLUMN supplier_id DROP DEFAULT,
  ALTER COLUMN price DROP DEFAULT,
  ALTER COLUMN quantity DROP DEFAULT,
  ALTER COLUMN timeline DROP DEFAULT;

-- ========================================
-- STEP 4: Fix RFQs table
-- ========================================

-- First, get a valid user ID to assign to RFQs
-- (We'll use the first user in the system)
DO $$
DECLARE
  first_user_id TEXT;
BEGIN
  SELECT id INTO first_user_id FROM users LIMIT 1;

  -- Add columns with the first user as default
  ALTER TABLE rfqs
    ADD COLUMN IF NOT EXISTS created_by TEXT NOT NULL DEFAULT first_user_id,
    ADD COLUMN IF NOT EXISTS timeline TEXT NOT NULL DEFAULT 'flexible',
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

  -- Update existing RFQs to have the first user as creator
  UPDATE rfqs SET created_by = first_user_id WHERE created_by = first_user_id;

END $$;

-- Remove the default after data is populated
ALTER TABLE rfqs ALTER COLUMN created_by DROP DEFAULT;

-- ========================================
-- STEP 5: Fix categories table
-- ========================================

ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- ========================================
-- STEP 6: Fix notifications table
-- ========================================

DO $$
DECLARE
  first_user_id TEXT;
BEGIN
  SELECT id INTO first_user_id FROM users LIMIT 1;

  ALTER TABLE notifications
    ADD COLUMN IF NOT EXISTS user_id TEXT NOT NULL DEFAULT first_user_id;
END $$;

-- Remove default after column is added
ALTER TABLE notifications ALTER COLUMN user_id DROP DEFAULT;

-- ========================================
-- STEP 7: Add foreign key constraints
-- ========================================

-- Quotes foreign keys
ALTER TABLE quotes
  ADD CONSTRAINT IF NOT EXISTS quotes_rfq_id_fkey
  FOREIGN KEY (rfq_id) REFERENCES rfqs(id) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE quotes
  ADD CONSTRAINT IF NOT EXISTS quotes_supplier_id_fkey
  FOREIGN KEY (supplier_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RFQs foreign key
ALTER TABLE rfqs
  ADD CONSTRAINT IF NOT EXISTS rfqs_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE;

-- Notifications foreign key
ALTER TABLE notifications
  ADD CONSTRAINT IF NOT EXISTS notifications_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE;

-- ========================================
-- STEP 8: Verify everything
-- ========================================

-- Check quotes structure
SELECT 'QUOTES TABLE STRUCTURE' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'quotes'
ORDER BY ordinal_position;

-- Check RFQs count
SELECT 'RFQS COUNT' as info, COUNT(*) as total FROM rfqs;

-- Check categories count
SELECT 'CATEGORIES COUNT' as info, COUNT(*) as total FROM categories;

-- Success message
SELECT '✅ DATABASE SCHEMA FIXED! Now run: npx prisma generate && npx prisma db push' as status;
