ALTER TABLE "documents" ADD COLUMN "description_score" double precision;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "final_rank" text;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "suspicion_type" text;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "analysis_summary" text;