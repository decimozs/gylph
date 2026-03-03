CREATE TABLE "overall_scores" (
	"id" text PRIMARY KEY NOT NULL,
	"no" serial NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"document_id" text,
	"verification_id" text,
	"signature_fraud_score" double precision NOT NULL,
	"description_fraud_score" double precision NOT NULL,
	"final_rank" text NOT NULL,
	"suspicion_type" text NOT NULL,
	"is_flagged_for_review" boolean DEFAULT false
);
--> statement-breakpoint
ALTER TABLE "overall_scores" ADD CONSTRAINT "overall_scores_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "overall_scores" ADD CONSTRAINT "overall_scores_verification_id_verifications_id_fk" FOREIGN KEY ("verification_id") REFERENCES "public"."verifications"("id") ON DELETE cascade ON UPDATE no action;