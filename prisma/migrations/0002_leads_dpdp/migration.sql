-- VyaparSethu DPDP Act 2023 Compliance Migration
-- Adds consent audit log and data erasure trigger.
-- NOTE: leads table already exists from 0001_baseline (managed by Prisma schema).
-- Only DPDP-specific structures are added here.

-- ── DPDP Consent audit log (immutable — no UPDATE/DELETE allowed) ─────────────
CREATE TABLE IF NOT EXISTS "consent_audit_log" (
  "id"              TEXT         NOT NULL DEFAULT gen_random_uuid()::TEXT,
  "lead_id"         TEXT,
  "user_id"         TEXT,
  "purpose"         TEXT         NOT NULL,
  "method"          TEXT         NOT NULL,
  "granted"         BOOLEAN      NOT NULL,
  "consent_text"    TEXT         NOT NULL,
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
-- Scrubs PII from leads table when status = CLOSED_LOST (used as opted-out signal).
-- Columns match the Prisma Lead model: name, email, phone, message.
CREATE OR REPLACE FUNCTION fn_erase_lead_pii()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'CLOSED_LOST' AND OLD.status <> 'CLOSED_LOST' THEN
    UPDATE leads SET
      "name"      = '[ERASED]',
      "email"     = NULL,
      "phone"     = NULL,
      "message"   = NULL,
      "updatedAt" = CURRENT_TIMESTAMP
    WHERE id = NEW.id;

    INSERT INTO consent_audit_log (lead_id, purpose, method, granted, consent_text, ip_address)
    VALUES (
      NEW.id,
      'data_erasure',
      'status_trigger',
      FALSE,
      'DPDP Article 13 right to erasure exercised. PII scrubbed on CLOSED_LOST.',
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
