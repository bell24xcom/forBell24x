-- Business Operating Memory — universal BusinessLifeEvent stream
CREATE TABLE IF NOT EXISTS "business_life_events" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "actor_id" TEXT,
    "category" TEXT,
    "intent" TEXT,
    "decision" TEXT,
    "outcome" TEXT,
    "metadata" JSONB,
    "attachments" JSONB,
    "confidence" DOUBLE PRECISION,
    "source" TEXT NOT NULL DEFAULT 'system',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "business_life_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "business_life_events_company_id_created_at_idx"
    ON "business_life_events"("company_id", "created_at");
CREATE INDEX IF NOT EXISTS "business_life_events_event_type_idx"
    ON "business_life_events"("event_type");
CREATE INDEX IF NOT EXISTS "business_life_events_company_id_event_type_idx"
    ON "business_life_events"("company_id", "event_type");

DO $$ BEGIN
    ALTER TABLE "business_life_events" ADD CONSTRAINT "business_life_events_company_id_fkey"
        FOREIGN KEY ("company_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "business_life_events" ADD CONSTRAINT "business_life_events_actor_id_fkey"
        FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
