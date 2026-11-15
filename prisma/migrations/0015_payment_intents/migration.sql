-- Phase 11 (2026-11-03): persist a server-trusted record of every Razorpay
-- order this app creates, BEFORE the client ever sees checkout details.
-- Without this, /api/payment/create-order (PUT) and /api/payment/verify
-- (POST) both trusted a client-supplied `amount` for wallet crediting, and
-- neither enforced single-use on a given payment_id -- see
-- docs/audits/PHASE_11_RAZORPAY_LIFECYCLE_ENGINEERING_REPORT_2026-11-03.md.
-- Not applied to any live database by this phase -- isolated worktree only.

CREATE TYPE "public"."PaymentIntentPurpose" AS ENUM ('WALLET_DEPOSIT', 'SUBSCRIPTION');
CREATE TYPE "public"."PaymentIntentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED');

CREATE TABLE "public"."payment_intents" (
    "id"           TEXT NOT NULL,
    "user_id"      TEXT NOT NULL,
    "purpose"      "public"."PaymentIntentPurpose" NOT NULL,
    "order_id"     TEXT NOT NULL,
    "payment_id"   TEXT,
    "amount_paise" INTEGER NOT NULL,
    "currency"     TEXT NOT NULL DEFAULT 'INR',
    "status"       "public"."PaymentIntentStatus" NOT NULL DEFAULT 'PENDING',
    "plan_key"     TEXT,
    "created_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"   TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_intents_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "payment_intents_order_id_key" ON "public"."payment_intents"("order_id");
CREATE UNIQUE INDEX "payment_intents_payment_id_key" ON "public"."payment_intents"("payment_id");
CREATE INDEX "payment_intents_user_id_idx" ON "public"."payment_intents"("user_id");

ALTER TABLE "public"."payment_intents"
    ADD CONSTRAINT "payment_intents_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
