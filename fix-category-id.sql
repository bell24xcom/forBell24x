-- Fix for Prisma schema mismatch
-- Run this in Neon SQL Editor: https://console.neon.tech/

-- Add the missing category_id column to rfqs table
ALTER TABLE rfqs
ADD COLUMN IF NOT EXISTS category_id TEXT;

-- Add foreign key constraint (optional, but good for data integrity)
ALTER TABLE rfqs
ADD CONSTRAINT fk_rfqs_category
FOREIGN KEY (category_id)
REFERENCES categories(id)
ON DELETE SET NULL;

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'rfqs'
AND column_name = 'category_id';
