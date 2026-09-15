"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface EmployeeFormState {
  error?: string;
}

function readEmployeePayload(formData: FormData) {
  return {
    first_name: String(formData.get("first_name") ?? "").trim(),
    last_name: String(formData.get("last_name") ?? "").trim(),
    work_email: String(formData.get("work_email") ?? "").trim() || null,
    personal_email: String(formData.get("personal_email") ?? "").trim() || null,
    phone: String(formData.get("phone") ?? "").trim() || null,
    position_id: String(formData.get("position_id") ?? "") || null,
    department_id: String(formData.get("department_id") ?? "") || null,
    manager_id: String(formData.get("manager_id") ?? "") || null,
    contract_type: String(formData.get("contract_type") ?? "cdi"),
    hire_date: String(formData.get("hire_date") ?? "") || new Date().toISOString().slice(0, 10),
    status: String(formData.get("status") ?? "actif"),
    site: String(formData.get("site") ?? "").trim() || null,
  };
}

export async function createEmployee(
  _prevState: EmployeeFormState,
  formData: FormData
): Promise<EmployeeFormState> {
  const supabase = createClient();
  const payload = readEmployeePayload(formData);

  if (!payload.first_name || !payload.last_name) {
    return { error: "Le prénom et le nom sont obligatoires." };
  }

  const { data, error } = await supabase
    .from("employees")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    return { error: "Erreur lors de la création : " + error.message };
  }

  await supabase.from("employee_history").insert({
    employee_id: data.id,
    event_type: "embauche",
    description: "Création de la fiche employé.",
    effective_date: payload.hire_date,
  });

  revalidatePath("/employees");
  redirect(`/employees/${data.id}`);
}

export async function updateEmployee(
  employeeId: string,
  _prevState: EmployeeFormState,
  formData: FormData
): Promise<EmployeeFormState> {
  const supabase = createClient();
  const payload = readEmployeePayload(formData);

  if (!payload.first_name || !payload.last_name) {
    return { error: "Le prénom et le nom sont obligatoires." };
  }

  const { error } = await supabase
    .from("employees")
    .update(payload)
    .eq("id", employeeId);

  if (error) {
    return { error: "Erreur lors de la mise à jour : " + error.message };
  }

  revalidatePath("/employees");
  revalidatePath(`/employees/${employeeId}`);
  return {};
}
