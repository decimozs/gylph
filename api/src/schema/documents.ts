import { pgTable, text } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { baseSchema } from "@/utils";
import { signatures } from "./signatures";
import { verifications } from "./verifications";

export const documents = pgTable("documents", {
  ...baseSchema,
  name: text("name").notNull(),
  url: text("url").notNull(),
  signatureId: text("signature_id").references(() => signatures.id, {
    onDelete: "cascade",
  }),
  verificationId: text("verification_id").references(() => verifications.id, {
    onDelete: "cascade",
  }),
});

export const documentsRelations = relations(documents, ({ one, many }) => ({
  signatures: many(signatures),
  verifications: one(verifications),
}));
