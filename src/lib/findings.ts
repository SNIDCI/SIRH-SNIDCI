import { asc } from "drizzle-orm";
import { db } from "@/db";
import { findings } from "@/db/schema";
import { FINDINGS } from "@/lib/audit-data";

/** Insère les constats manquants (idempotent — ne touche pas aux statuts déjà saisis). */
export async function ensureSeeded() {
  await db
    .insert(findings)
    .values(
      FINDINGS.map((f, i) => ({
        code: f.code,
        position: i,
        severity: f.severity,
        category: f.category,
        title: f.title,
        problem: f.problem,
        why: f.why,
        fix: f.fix,
        files: f.files,
        autoFixed: f.autoFixed ? 1 : 0,
      }))
    )
    .onConflictDoNothing({ target: findings.code });
}

export async function listFindings() {
  await ensureSeeded();
  return db.select().from(findings).orderBy(asc(findings.position));
}
