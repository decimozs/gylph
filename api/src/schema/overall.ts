import { boolean, doublePrecision, pgTable, text } from "drizzle-orm/pg-core";
import { baseSchema } from "@/utils";
import { verifications } from "./verifications";
import { documents } from "./documents";
import { relations } from "drizzle-orm";

export const overallScores = pgTable("overall_scores", {
  ...baseSchema,
  score: doublePrecision("score").notNull(),
  documentId: text("document_id").references(() => documents.id, {
    onDelete: "cascade",
  }),
  verificationId: text("verification_id").references(() => verifications.id, {
    onDelete: "cascade",
  }),
  verdict: text("verdict").notNull(),
  signatureFraudScore: doublePrecision("signature_fraud_score").notNull(),
  descriptionFraudScore: doublePrecision("description_fraud_score").notNull(),
  finalRank: text("final_rank").notNull(),
  suspicionType: text("suspicion_type").notNull(),
  isFlaggedForReview: boolean("is_flagged_for_review").default(false),
});

export const overallScoresRelations = relations(overallScores, ({ one }) => ({
  document: one(documents, {
    fields: [overallScores.documentId],
    references: [documents.id],
  }),
}));
