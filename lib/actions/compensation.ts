"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { SimpleFormState } from "@/lib/actions/reference-data";

export async function createCompensationEntry(
  employeeId: string,
  _prev: SimpleFormState,
  formData: FormData
): Promise<SimpleFormState> {
  const supabase = createClient();

  const base_salary = Number(formData.get("base_salary"));
  const effective_date = String(formData.get("effective_date") ?? "");

  if (!effective_date) return { error: "La date d'effet est obligatoire." };
  if (!base_salary || base_salary <= 0) return { error: "Le salaire de base doit être un nombre positif." };

  const { error } = await supabase.from("compensation_history").insert({
    employee_id: employeeId,
    effective_date,
    base_salary,
    bonuses_notes: String(formData.get("bonuses_notes") ?? "").trim() || null,
    change_reason: String(formData.get("change_reason") ?? "").trim() || null,
  });

  if (error) return { error: error.message };

  revalidatePath(`/employees/${employeeId}`);
  return {};
}
