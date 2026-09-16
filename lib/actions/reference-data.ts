"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface SimpleFormState {
  error?: string;
}

// ---------- Départements ----------
export async function createDepartment(_prev: SimpleFormState, formData: FormData): Promise<SimpleFormState> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Le nom est obligatoire." };

  const supabase = createClient();
  const { error } = await supabase.from("departments").insert({ name });
  if (error) return { error: error.message };

  revalidatePath("/admin/departments");
  return {};
}

export async function deleteDepartment(id: string) {
  const supabase = createClient();
  await supabase.from("departments").delete().eq("id", id);
  revalidatePath("/admin/departments");
}

// ---------- Services ----------
export async function createService(_prev: SimpleFormState, formData: FormData): Promise<SimpleFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const department_id = String(formData.get("department_id") ?? "") || null;
  if (!name) return { error: "Le nom est obligatoire." };
  if (!department_id) return { error: "Le département de rattachement est obligatoire." };

  const supabase = createClient();
  const { error } = await supabase.from("services").insert({ name, department_id });
  if (error) return { error: error.message };

  revalidatePath("/admin/services");
  return {};
}

export async function deleteService(id: string) {
  const supabase = createClient();
  await supabase.from("services").delete().eq("id", id);
  revalidatePath("/admin/services");
}

// ---------- Postes ----------
export async function createPosition(_prev: SimpleFormState, formData: FormData): Promise<SimpleFormState> {
  const title = String(formData.get("title") ?? "").trim();
  const department_id = String(formData.get("department_id") ?? "") || null;
  if (!title) return { error: "L'intitulé est obligatoire." };

  const supabase = createClient();
  const { error } = await supabase.from("positions").insert({ title, department_id });
  if (error) return { error: error.message };

  revalidatePath("/admin/positions");
  return {};
}

export async function deletePosition(id: string) {
  const supabase = createClient();
  await supabase.from("positions").delete().eq("id", id);
  revalidatePath("/admin/positions");
}

// ---------- Sites ----------
export async function createSite(_prev: SimpleFormState, formData: FormData): Promise<SimpleFormState> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Le nom est obligatoire." };

  const supabase = createClient();
  const { error } = await supabase.from("sites").insert({ name });
  if (error) return { error: error.message };

  revalidatePath("/admin/sites");
  return {};
}

export async function deleteSite(id: string) {
  const supabase = createClient();
  await supabase.from("sites").delete().eq("id", id);
  revalidatePath("/admin/sites");
}
