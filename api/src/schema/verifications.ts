import { boolean, pgTable, text, doublePrecision } from "drizzle-orm/pg-core";
import { baseSchema, excludedFields } from "@/utils";
import { signatures } from "./signatures";
import { relations } from "drizzle-orm";
import { documents } from "./documents";
import { createInsertSchema } from "drizzle-zod";
import type z from "zod";

export const verifications = pgTable("verifications", {
  ...baseSchema,
  signatureId: text("signature_id").references(() => signatures.id, {
    onDelete: "set null",
  }),
  queryImageUrl: text("query_image_url"),
  isAuthentic: boolean("is_authentic").notNull(),
  similarityScore: doublePrecision("similarity_score").notNull(),
  status: text("status"),
  previewImageUrl: text("preview_image_url"),
  previewLiveNormalizedImageUrl: text("preview_live_normalized_image_url"),
  previewRefNormalizedImageUrl: text("preview_ref_normalized_image_url"),
});

export const verificationsRelations = relations(
  verifications,
  ({ one, many }) => ({
    signature: one(signatures, {
      fields: [verifications.signatureId],
      references: [signatures.id],
    }),
    documents: many(documents),
  }),
);

export const InsertVerificationSchema = createInsertSchema(verifications)
  .omit(excludedFields)
  .strict();

export const UpdateVerificationSchema = InsertVerificationSchema.partial();

export type InsertVerification = z.infer<typeof InsertVerificationSchema>;
export type UpdateVerification = z.infer<typeof UpdateVerificationSchema>;
