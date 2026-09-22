-- WhatsApp Certification (Part C). Send-side tracking — previously the
-- Meta messageId returned by a successful send was discarded immediately,
-- making it impossible to correlate a later delivery/read/failed webhook
-- event back to the RFQ or supplier that triggered it (see this session's
-- earlier "META WHATSAPP FAILURE ROOT CAUSE REPORT", recommendation #3-4).

CREATE TYPE "public"."WhatsAppSendStatus" AS ENUM (
    'REQUESTED', 'SENT', 'NOT_CONFIGURED', 'META_ERROR'
);

CREATE TABLE "public"."whatsapp_send_logs" (
    "id"                TEXT NOT NULL,
    "rfq_id"            TEXT,
    "supplier_id"       TEXT,
    "match_approval_id" TEXT,
    "template_name"     TEXT NOT NULL,
    "phone_redacted"    TEXT NOT NULL,
    "meta_message_id"   TEXT,
    "status"            "public"."WhatsAppSendStatus" NOT NULL DEFAULT 'REQUESTED',
    "error_code"        TEXT,
    "error_message"     TEXT,
    "sent_at"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "delivery_status"   TEXT,
    "delivered_at"      TIMESTAMP(3),
    "read_at"           TIMESTAMP(3),
    "failed_at"         TIMESTAMP(3),
    "failure_reason"    TEXT,
    "created_at"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "whatsapp_send_logs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "whatsapp_send_logs_meta_message_id_key" ON "public"."whatsapp_send_logs"("meta_message_id");
CREATE INDEX "whatsapp_send_logs_rfq_id_idx" ON "public"."whatsapp_send_logs"("rfq_id");
CREATE INDEX "whatsapp_send_logs_status_idx" ON "public"."whatsapp_send_logs"("status");
