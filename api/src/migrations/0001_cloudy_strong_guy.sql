ALTER TABLE "documents" RENAME COLUMN "preview_image_url" TO "text_extraction_image_url";--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "signature_extraction_image_url" text;