import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Constats de l'audit du dépôt SIRH-SNIDCI.
 * status : "a_faire" | "en_cours" | "fait"
 */
export const findings = pgTable("audit_findings", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  position: integer("position").notNull().default(0),
  severity: text("severity").notNull(), // bloquant | critique | important | amelioration
  category: text("category").notNull(),
  title: text("title").notNull(),
  problem: text("problem").notNull(),
  why: text("why").notNull(),
  fix: text("fix").notNull(),
  files: text("files").notNull().default(""),
  autoFixed: integer("auto_fixed").notNull().default(1), // 1 = corrigé dans le patch, 0 = recommandation
  status: text("status").notNull().default("a_faire"),
  note: text("note").notNull().default(""),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Finding = typeof findings.$inferSelect;
