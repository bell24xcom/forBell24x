-- Migration: 0003_campaign_rules
-- Adds campaign_rules table for marketing automation rule engine.
-- Replaces the previous InsForge-hosted campaign_rules table.

CREATE TABLE "campaign_rules" (
    "id"            TEXT         NOT NULL,
    "is_active"     BOOLEAN      NOT NULL DEFAULT true,
    "category"      TEXT         NOT NULL,
    "urgency"       TEXT         NOT NULL,
    "template_text" TEXT         NOT NULL,
    "action_type"   TEXT         NOT NULL,
    "created_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"    TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaign_rules_pkey" PRIMARY KEY ("id")
);
