import { boolean, pgTable, text, doublePrecision } from "drizzle-orm/pg-core";
import { baseSchema } from "@/utils";
import { signatures } from "./signatures";
import { relations } from "drizzle-orm";
import { documents } from "./documents";

export const verifications = pgTable("verifications", {
  ...baseSchema,
  signatureId: text("signature_id").references(() => signatures.id, {
    onDelete: "set null",
  }),
  queryImageUrl: text("query_image_url"),
  isAuthentic: boolean("is_authentic").notNull(),
  similarityScore: doublePrecision("similarity_score").notNull(),
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
