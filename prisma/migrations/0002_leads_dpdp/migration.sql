-- VyaparSethu DPDP Act 2023 Compliance Migration
-- Adds leads table, consent audit log, and data erasure trigger.
-- Run with: prisma migrate deploy

-- ── Leads table ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "leads" (
  "id"                  TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
  "companyName"         TEXT NOT NULL,
  "contactName"         TEXT,
  "email"               TEXT,
  "phone"               TEXT,
  "gstin"               TEXT UNIQUE,
  "location"            TEXT,
  "segment"             TEXT NOT NULL DEFAULT 'other',
  "status"              TEXT NOT NULL DEFAULT 'new',
  "sourceUrl"           TEXT,
  "sourceQuery"         TEXT,
  "is_claimed"          BOOLEAN NOT NULL DEFAULT FALSE,
  "claim_token"         TEXT UNIQUE,
  "dpdp_consent_status" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "leads_phone_idx"  ON "leads"("phone");
CREATE INDEX IF NOT EXISTS "leads_status_idx" ON "leads"("status");
CREATE INDEX IF NOT EXISTS "leads_segment_idx" ON "leads"("segment");

-- ── DPDP Consent audit log (immutable — no UPDATE/DELETE allowed) ─────────────
CREATE TABLE IF NOT EXISTS "consent_audit_log" (
  "id"              TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
  "lead_id"         TEXT,
  "user_id"         TEXT,
  "purpose"         TEXT NOT NULL,
  "method"          TEXT NOT NULL,
  "granted"         BOOLEAN NOT NULL,
  "consent_text"    TEXT NOT NULL,
  "ip_address"      TEXT,
  "user_agent"      TEXT,
  "created_at"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "consent_audit_log_pkey" PRIMARY KEY ("id")
);

-- Prevent modification of audit records (DPDP immutability requirement)
CREATE OR REPLACE RULE "consent_audit_no_update" AS
  ON UPDATE TO "consent_audit_log" DO INSTEAD NOTHING;

CREATE OR REPLACE RULE "consent_audit_no_delete" AS
  ON DELETE TO "consent_audit_log" DO INSTEAD NOTHING;

-- ── Data erasure trigger (DPDP Article 13 — right to erasure) ─────────────────
-- When a lead's status is set to 'opted_out', PII is scrubbed immediately.
CREATE OR REPLACE FUNCTION fn_erase_lead_pii()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'opted_out' AND OLD.status <> 'opted_out' THEN
    UPDATE leads SET
      "contactName"         = '[ERASED]',
      "email"               = NULL,
      "phone"               = NULL,
      "gstin"               = NULL,
      "claim_token"         = NULL,
      "dpdp_consent_status" = FALSE,
      "updatedAt"           = CURRENT_TIMESTAMP
    WHERE id = NEW.id;

    -- Log the erasure event
    INSERT INTO consent_audit_log (lead_id, purpose, method, granted, consent_text, ip_address)
    VALUES (
      NEW.id,
      'data_erasure',
      'opted_out_trigger',
      FALSE,
      'User exercised DPDP Article 13 right to erasure. PII scrubbed.',
      'system'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_erase_lead_pii ON leads;
CREATE TRIGGER trg_erase_lead_pii
  AFTER UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION fn_erase_lead_pii();

-- ── Auto-update updatedAt ──────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_leads_updated_at ON leads;
CREATE TRIGGER trg_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
