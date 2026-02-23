ALTER TABLE "verifications" ALTER COLUMN "query_image_url" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "verifications" ALTER COLUMN "preview_image_url" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "verifications" ADD COLUMN "preview_live_normalized_image_url" text;--> statement-breakpoint
ALTER TABLE "verifications" ADD COLUMN "preview_ref_normalized_image_url" text;