"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface EmployeeFormState {
  error?: string;
}

function orNull(formData: FormData, key: string) {
  const v = String(formData.get(key) ?? "").trim();
  return v || null;
}

function readEmployeePayload(formData: FormData) {
  return {
    // Identité
    first_name: String(formData.get("first_name") ?? "").trim(),
    last_name: String(formData.get("last_name") ?? "").trim(),
    photo_url: orNull(formData, "photo_url"),
    birth_date: orNull(formData, "birth_date"),
    birth_place: orNull(formData, "birth_place"),
    nationality: orNull(formData, "nationality"),
    gender: orNull(formData, "gender"),
    marital_status: orNull(formData, "marital_status"),

    // Contacts
    work_email: orNull(formData, "work_email"),
    personal_email: orNull(formData, "personal_email"),
    phone_primary: orNull(formData, "phone_primary"),
    phone_secondary: orNull(formData, "phone_secondary"),
    address: orNull(formData, "address"),
    emergency_contact_name: orNull(formData, "emergency_contact_name"),
    emergency_contact_relation: orNull(formData, "emergency_contact_relation"),
    emergency_contact_phone: orNull(formData, "emergency_contact_phone"),

    // Informations professionnelles
    department_id: orNull(formData, "department_id"),
    service_id: orNull(formData, "service_id"),
    position_id: orNull(formData, "position_id"),
    manager_id: orNull(formData, "manager_id"),
    site_id: orNull(formData, "site_id"),
    status: String(formData.get("status") ?? "actif"),
    contract_type: String(formData.get("contract_type") ?? "cdi"),
    hire_date: orNull(formData, "hire_date") ?? new Date().toISOString().slice(0, 10),
    trial_period_end: orNull(formData, "trial_period_end"),
  };
}

export async function createEmployee(
  _prevState: EmployeeFormState,
  formData: FormData
): Promise<EmployeeFormState> {
  const supabase = createClient();
  const payload = readEmployeePayload(formData);

  if (!payload.first_name || !payload.last_name) {
    return { error: "Le nom et le prénom sont obligatoires." };
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

  // Le contrat initial est créé automatiquement à partir des informations
  // professionnelles déjà saisies (type de contrat, date d'entrée, période d'essai).
  await supabase.from("employee_contracts").insert({
    employee_id: data.id,
    contract_type: payload.contract_type,
    start_date: payload.hire_date,
    trial_period_end: payload.trial_period_end,
    is_renewal: false,
    notes: "Contrat initial, créé automatiquement à la création de la fiche.",
  });

  // Rémunération initiale (facultative) : si un salaire de base est renseigné,
  // on crée directement la première entrée de l'historique de rémunération.
  const initialSalary = Number(formData.get("initial_base_salary") ?? 0);
  if (initialSalary > 0) {
    await supabase.from("compensation_history").insert({
      employee_id: data.id,
      effective_date: payload.hire_date,
      base_salary: initialSalary,
      bonuses_notes: orNull(formData, "initial_bonuses_notes"),
      change_reason: "Embauche",
    });
  }

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
    return { error: "Le nom et le prénom sont obligatoires." };
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
