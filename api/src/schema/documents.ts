import { pgTable, text } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { baseSchema } from "@/utils";
import { signatures } from "./signatures";
import { verifications } from "./verifications";

export const documents = pgTable("documents", {
  ...baseSchema,
  name: text("name").notNull(),
  url: text("url").notNull(),
  previewImageUrl: text("preview_image_url"),
  status: text("status"),
  signatureId: text("signature_id").references(() => signatures.id, {
    onDelete: "cascade",
  }),
  verificationId: text("verification_id").references(() => verifications.id, {
    onDelete: "cascade",
  }),
});

export const documentsRelations = relations(documents, ({ one }) => ({
  signature: one(signatures, {
    fields: [documents.signatureId],
    references: [signatures.id],
  }),
  verifications: one(verifications, {
    fields: [documents.verificationId],
    references: [verifications.id],
  }),
}));
