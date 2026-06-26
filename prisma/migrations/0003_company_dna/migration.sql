-- Company DNA — Business Operating Memory System
CREATE TABLE IF NOT EXISTS "company_dna_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "company_name" TEXT,
    "completeness" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "layer_scores" JSONB,
    "identity" JSONB,
    "business" JSONB,
    "procurement" JSONB,
    "suppliers" JSONB,
    "customers" JSONB,
    "financial" JSONB,
    "market" JSONB,
    "risk" JSONB,
    "trust" JSONB,
    "relationships" JSONB,
    "procurement_memory" JSONB,
    "decisions" JSONB,
    "opportunities" JSONB,
    "ai_memory" JSONB,
    "graph_snapshot" JSONB,
    "last_synced_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_dna_profiles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "company_dna_profiles_user_id_key" ON "company_dna_profiles"("user_id");

CREATE TABLE IF NOT EXISTS "dna_timeline_events" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'system',
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dna_timeline_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "dna_timeline_events_profile_id_idx" ON "dna_timeline_events"("profile_id");

CREATE TABLE IF NOT EXISTS "dna_memory_events" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "layer" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "decision" TEXT,
    "outcome" TEXT,
    "impact_score" DOUBLE PRECISION,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dna_memory_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "dna_memory_events_profile_id_idx" ON "dna_memory_events"("profile_id");
CREATE INDEX IF NOT EXISTS "dna_memory_events_layer_idx" ON "dna_memory_events"("layer");

DO $$ BEGIN
    ALTER TABLE "company_dna_profiles" ADD CONSTRAINT "company_dna_profiles_user_id_fkey"
        FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "dna_timeline_events" ADD CONSTRAINT "dna_timeline_events_profile_id_fkey"
        FOREIGN KEY ("profile_id") REFERENCES "company_dna_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "dna_memory_events" ADD CONSTRAINT "dna_memory_events_profile_id_fkey"
        FOREIGN KEY ("profile_id") REFERENCES "company_dna_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
