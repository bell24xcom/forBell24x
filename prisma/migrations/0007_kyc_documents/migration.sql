-- KYC document upload & review — suppliers upload real documents (ID proof,
-- GST certificate, business registration) via Cloudinary; admins review and
-- verify/reject each one individually. Distinct from the existing coarse
-- User.isVerified flag, which stays the overall KYC-approved signal.

CREATE TYPE "public"."KycDocumentType" AS ENUM ('ID_PROOF', 'GST_CERTIFICATE', 'BUSINESS_REGISTRATION');
CREATE TYPE "public"."KycDocumentStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

CREATE TABLE "public"."kyc_documents" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "document_type" "public"."KycDocumentType" NOT NULL,
    "file_url" TEXT NOT NULL,
    "cloudinary_id" TEXT NOT NULL,
    "status" "public"."KycDocumentStatus" NOT NULL DEFAULT 'PENDING',
    "rejection_reason" TEXT,
    "reviewed_by_user_id" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kyc_documents_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "kyc_documents_user_id_idx" ON "public"."kyc_documents"("user_id");
CREATE INDEX "kyc_documents_status_idx" ON "public"."kyc_documents"("status");

ALTER TABLE "public"."kyc_documents"
  ADD CONSTRAINT "kyc_documents_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."kyc_documents"
  ADD CONSTRAINT "kyc_documents_reviewed_by_user_id_fkey"
  FOREIGN KEY ("reviewed_by_user_id") REFERENCES "public"."users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
