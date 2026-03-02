import { doublePrecision, pgTable, text } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { baseSchema } from "@/utils";
import { signatures } from "./signatures";
import { verifications } from "./verifications";

export const documents = pgTable("documents", {
  ...baseSchema,
  name: text("name").notNull(),
  url: text("url").notNull(),
  textExtractionImageUrl: text("text_extraction_image_url"),
  signatureExtractionImageUrl: text("signature_extraction_image_url"),
  status: text("status"),
  text: text("text"),
  markdown: text("markdown"),
  finalRank: text("final_rank"),
  suspicionType: text("suspicion_type"),
  analysisSummary: text("analysis_summary"),
  languageNote: text("language_note"),
  protocolNote: text("protocol_note"),
  linguisticNote: text("linguistic_note"),
  overview: text("overview"),
  medicalLanguageScore: doublePrecision("medical_language_score"),
  protocolScore: doublePrecision("protocol_score"),
  linguisticScore: doublePrecision("linguistic_score"),
  severityScore: doublePrecision("severity_score"),
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
