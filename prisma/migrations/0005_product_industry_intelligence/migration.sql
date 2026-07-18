-- Product Intelligence / Industry Intelligence — DB-backed catalog
-- Replaces static TS catalogs in src/data/product-intelligence-catalog.ts and industry-intelligence-catalog.ts

CREATE TABLE IF NOT EXISTS "product_intelligence_records" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "family" TEXT,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "brand" TEXT,
    "description" TEXT NOT NULL,
    "manufacturing" JSONB,
    "commercial" JSONB,
    "knowledge" JSONB,
    "business_intel" JSONB,
    "seo" JSONB,
    "reference_company" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_intelligence_records_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "product_intelligence_records_slug_key" ON "product_intelligence_records"("slug");
CREATE INDEX IF NOT EXISTS "product_intelligence_records_category_idx" ON "product_intelligence_records"("category");
CREATE INDEX IF NOT EXISTS "product_intelligence_records_family_idx" ON "product_intelligence_records"("family");

CREATE TABLE IF NOT EXISTS "industry_intelligence_records" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "manufacturers" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "suppliers" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "buyers" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "products" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "machines" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "raw_materials" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "standards" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "trade_associations" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "trade_shows" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "government_schemes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "certifications" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "related_cluster_slugs" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "related_product_slugs" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "trends" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "industry_intelligence_records_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "industry_intelligence_records_slug_key" ON "industry_intelligence_records"("slug");
