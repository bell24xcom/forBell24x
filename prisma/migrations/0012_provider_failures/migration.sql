-- MSG91 send-failure logging + Brevo admin alert (see lib/providerFailure.ts).
-- Deliberately separate from error_logs: this table is for a third-party
-- provider rejecting/failing a request, not our own thrown exceptions.
-- phone_or_recipient must only ever be stored masked (last 4 digits) —
-- enforced in application code (lib/providerFailure.ts), not by this schema.

CREATE TABLE "public"."provider_failures" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "error_code" TEXT,
    "error_message" TEXT NOT NULL,
    "phone_or_recipient" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "provider_failures_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "provider_failures_provider_createdAt_idx" ON "public"."provider_failures"("provider", "createdAt");
