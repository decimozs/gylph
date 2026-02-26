import { serial, text, timestamp } from "drizzle-orm/pg-core";
import type { ZodObject } from "zod";

export const baseSchema = {
  id: text("id").notNull().primaryKey(),
  no: serial("no"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
} as const;

export const excludedFields = {
  id: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Partial<Record<keyof ZodObject["shape"], true>>;
