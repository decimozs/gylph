ALTER TABLE "signature_logs" ADD COLUMN "no" serial NOT NULL;--> statement-breakpoint
ALTER TABLE "signatures" ADD COLUMN "no" serial NOT NULL;--> statement-breakpoint
ALTER TABLE "verifications" ADD COLUMN "no" serial NOT NULL;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "no" serial NOT NULL;