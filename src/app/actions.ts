"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { findings } from "@/db/schema";

const STATUSES = ["a_faire", "en_cours", "fait"] as const;

export async function setFindingStatus(formData: FormData) {
  const id = Number(formData.get("id"));
  const status = String(formData.get("status") ?? "");
  if (!Number.isInteger(id) || !STATUSES.includes(status as (typeof STATUSES)[number])) return;

  await db.update(findings).set({ status, updatedAt: new Date() }).where(eq(findings.id, id));
  revalidatePath("/");
}

export async function saveFindingNote(formData: FormData) {
  const id = Number(formData.get("id"));
  const note = String(formData.get("note") ?? "").slice(0, 2000);
  if (!Number.isInteger(id)) return;

  await db.update(findings).set({ note, updatedAt: new Date() }).where(eq(findings.id, id));
  revalidatePath("/");
}
