CREATE TABLE "signature_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"no" serial NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"signature_id" text NOT NULL,
	"image_url" text NOT NULL,
	"type" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "signatures" (
	"id" text PRIMARY KEY NOT NULL,
	"no" serial NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"image_url" text NOT NULL,
	"email" text,
	"preview_image_url" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" text PRIMARY KEY NOT NULL,
	"no" serial NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"signature_id" text,
	"query_image_url" text,
	"is_authentic" boolean NOT NULL,
	"similarity_score" double precision NOT NULL,
	"status" text,
	"preview_image_url" text,
	"preview_live_normalized_image_url" text,
	"preview_ref_normalized_image_url" text
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" text PRIMARY KEY NOT NULL,
	"no" serial NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"preview_image_url" text,
	"status" text,
	"markdown" text,
	"signature_id" text,
	"verification_id" text
);
--> statement-breakpoint
ALTER TABLE "signature_logs" ADD CONSTRAINT "signature_logs_signature_id_signatures_id_fk" FOREIGN KEY ("signature_id") REFERENCES "public"."signatures"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verifications" ADD CONSTRAINT "verifications_signature_id_signatures_id_fk" FOREIGN KEY ("signature_id") REFERENCES "public"."signatures"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_signature_id_signatures_id_fk" FOREIGN KEY ("signature_id") REFERENCES "public"."signatures"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_verification_id_verifications_id_fk" FOREIGN KEY ("verification_id") REFERENCES "public"."verifications"("id") ON DELETE cascade ON UPDATE no action;