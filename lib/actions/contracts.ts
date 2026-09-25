"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { SimpleFormState } from "@/lib/actions/reference-data";

export async function createContract(
  employeeId: string,
  _prev: SimpleFormState,
  formData: FormData
): Promise<SimpleFormState> {
  const supabase = createClient();

  const start_date = String(formData.get("start_date") ?? "");
  if (!start_date) return { error: "La date de début est obligatoire." };

  const { error } = await supabase.from("employee_contracts").insert({
    employee_id: employeeId,
    contract_type: String(formData.get("contract_type") ?? "cdi"),
    start_date,
    end_date: String(formData.get("end_date") ?? "") || null,
    trial_period_end: String(formData.get("trial_period_end") ?? "") || null,
    is_renewal: formData.get("is_renewal") === "on",
    notes: String(formData.get("notes") ?? "").trim() || null,
  });

  if (error) return { error: error.message };

  revalidatePath(`/employees/${employeeId}`);
  return {};
}
