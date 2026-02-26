import { pgTable, text } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { baseSchema } from "@/utils";
import { verifications } from "./verifications";
import { documents } from "./documents";

export const signatures = pgTable("signatures", {
  ...baseSchema,
  name: text("name").notNull(),
  imageUrl: text("image_url").notNull(),
  email: text("email"),
  previewImageUrl: text("preview_image_url").notNull(),
});

export const signatureLogs = pgTable("signature_logs", {
  ...baseSchema,
  signatureId: text("signature_id")
    .notNull()
    .references(() => signatures.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(),
  type: text("type").notNull(),
});

export const signaturesRelations = relations(signatures, ({ many }) => ({
  logs: many(signatureLogs),
  verifications: many(verifications),
  documents: many(documents),
}));

export const signatureLogsRelations = relations(signatureLogs, ({ one }) => ({
  signature: one(signatures, {
    fields: [signatureLogs.signatureId],
    references: [signatures.id],
  }),
}));
