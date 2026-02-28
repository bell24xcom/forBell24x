-- Migration to fix schema without losing data
-- Run this in Neon SQL Editor: https://console.neon.tech

-- ========================================
-- 1. FIX QUOTES TABLE (3 rows)
-- ========================================

-- Add QuoteStatus enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'QuoteStatus') THEN
        CREATE TYPE "QuoteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED');
    END IF;
END $$;

-- Add missing columns to quotes table (nullable first, then we'll populate)
ALTER TABLE quotes
  ADD COLUMN IF NOT EXISTS rfq_id TEXT,
  ADD COLUMN IF NOT EXISTS supplier_id TEXT,
  ADD COLUMN IF NOT EXISTS timeline TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS terms TEXT,
  ADD COLUMN IF NOT EXISTS status "QuoteStatus" DEFAULT 'PENDING'::"QuoteStatus",
  ADD COLUMN IF NOT EXISTS is_accepted BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- You'll need to manually populate rfq_id, supplier_id, and timeline for the 3 existing quotes
-- OR delete them if they're test data
-- To delete test quotes: DELETE FROM quotes WHERE rfq_id IS NULL;

-- ========================================
-- 2. FIX RFQS TABLE (405 rows)
-- ========================================

-- Add missing columns to rfqs table
ALTER TABLE rfqs
  ADD COLUMN IF NOT EXISTS created_by TEXT,
  ADD COLUMN IF NOT EXISTS timeline TEXT DEFAULT 'flexible',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- You'll need to assign created_by to a valid user_id
-- Option 1: Set to a default admin user if you have one
-- UPDATE rfqs SET created_by = 'your-admin-user-id' WHERE created_by IS NULL;

-- Option 2: Delete RFQs without owners (if they're test data)
-- DELETE FROM rfqs WHERE created_by IS NULL;

-- ========================================
-- 3. FIX CATEGORIES TABLE (450 rows)
-- ========================================

-- Add updatedAt column with default value
ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- ========================================
-- 4. FIX NOTIFICATIONS TABLE (3 rows)
-- ========================================

-- Add user_id column (nullable first)
ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS user_id TEXT;

-- You'll need to assign user_id or delete these notifications
-- To delete test notifications: DELETE FROM notifications WHERE user_id IS NULL;

-- ========================================
-- 5. ADD FOREIGN KEY CONSTRAINTS
-- ========================================

-- Add foreign keys only after populating the data
-- Uncomment these after you've populated rfq_id, supplier_id, created_by, user_id

-- ALTER TABLE quotes
--   ADD CONSTRAINT IF NOT EXISTS quotes_rfq_id_fkey
--   FOREIGN KEY (rfq_id) REFERENCES rfqs(id) ON DELETE RESTRICT ON UPDATE CASCADE;

-- ALTER TABLE quotes
--   ADD CONSTRAINT IF NOT EXISTS quotes_supplier_id_fkey
--   FOREIGN KEY (supplier_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE;

-- ALTER TABLE rfqs
--   ADD CONSTRAINT IF NOT EXISTS rfqs_created_by_fkey
--   FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE;

-- ALTER TABLE notifications
--   ADD CONSTRAINT IF NOT EXISTS notifications_user_id_fkey
--   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE;

-- ========================================
-- 6. VERIFY CHANGES
-- ========================================

-- Check quotes table
SELECT 'QUOTES TABLE' as info;
SELECT id, rfq_id, supplier_id, timeline, status, created_at FROM quotes;

-- Check rfqs table (first 5 rows)
SELECT 'RFQS TABLE (sample)' as info;
SELECT id, title, created_by, timeline, created_at FROM rfqs LIMIT 5;

-- Check categories table (first 5 rows)
SELECT 'CATEGORIES TABLE (sample)' as info;
SELECT id, name, updated_at FROM categories LIMIT 5;

-- Check notifications table
SELECT 'NOTIFICATIONS TABLE' as info;
SELECT id, title, user_id, created_at FROM notifications;
