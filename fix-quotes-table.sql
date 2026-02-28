-- Fix quotes table schema to match Prisma
-- Run this in Neon SQL Editor: https://console.neon.tech

-- Step 1: Check if quotes table exists and what columns it has
-- (Just for verification - run this first to see current state)
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'quotes';

-- Step 2: If quotes table exists but is missing columns, we need to add them
-- WARNING: This assumes the table exists but has wrong structure

-- Add missing rfq_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'quotes' AND column_name = 'rfq_id'
    ) THEN
        ALTER TABLE quotes ADD COLUMN rfq_id TEXT;
    END IF;
END $$;

-- Add missing supplier_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'quotes' AND column_name = 'supplier_id'
    ) THEN
        ALTER TABLE quotes ADD COLUMN supplier_id TEXT;
    END IF;
END $$;

-- Add missing columns if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quotes' AND column_name = 'price') THEN
        ALTER TABLE quotes ADD COLUMN price DOUBLE PRECISION NOT NULL DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quotes' AND column_name = 'quantity') THEN
        ALTER TABLE quotes ADD COLUMN quantity TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quotes' AND column_name = 'timeline') THEN
        ALTER TABLE quotes ADD COLUMN timeline TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quotes' AND column_name = 'description') THEN
        ALTER TABLE quotes ADD COLUMN description TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quotes' AND column_name = 'terms') THEN
        ALTER TABLE quotes ADD COLUMN terms TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quotes' AND column_name = 'is_accepted') THEN
        ALTER TABLE quotes ADD COLUMN is_accepted BOOLEAN NOT NULL DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quotes' AND column_name = 'created_at') THEN
        ALTER TABLE quotes ADD COLUMN created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quotes' AND column_name = 'updated_at') THEN
        ALTER TABLE quotes ADD COLUMN updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- Step 3: Create QuoteStatus enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'QuoteStatus') THEN
        CREATE TYPE "QuoteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED');
    END IF;
END $$;

-- Step 4: Add status column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quotes' AND column_name = 'status') THEN
        ALTER TABLE quotes ADD COLUMN status "QuoteStatus" NOT NULL DEFAULT 'PENDING'::"QuoteStatus";
    END IF;
END $$;

-- Step 5: Add foreign key constraints if they don't exist
DO $$
BEGIN
    -- Foreign key to rfqs table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'quotes'
        AND constraint_name = 'quotes_rfq_id_fkey'
    ) THEN
        ALTER TABLE quotes ADD CONSTRAINT quotes_rfq_id_fkey
        FOREIGN KEY (rfq_id) REFERENCES rfqs(id) ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;

    -- Foreign key to users table (supplier)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'quotes'
        AND constraint_name = 'quotes_supplier_id_fkey'
    ) THEN
        ALTER TABLE quotes ADD CONSTRAINT quotes_supplier_id_fkey
        FOREIGN KEY (supplier_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- Verify the changes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'quotes'
ORDER BY ordinal_position;
