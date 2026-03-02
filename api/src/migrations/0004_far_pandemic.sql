ALTER TABLE "documents" ADD COLUMN "language_note" text;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "protocol_note" text;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "medical_language_score" double precision;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "protocol_score" double precision;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "linguistic_score" double precision;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "severity_score" double precision;