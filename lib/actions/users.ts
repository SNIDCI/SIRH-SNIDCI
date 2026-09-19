"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface SimpleFormState {
  error?: string;
}

async function requireAdmin(): Promise<{ error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") {
    return { error: "Action réservée aux administrateurs." };
  }
  return {};
}

export async function inviteUser(_prev: SimpleFormState, formData: FormData): Promise<SimpleFormState> {
  const guard = await requireAdmin();
  if (guard.error) return guard;

  const employee_id = String(formData.get("employee_id") ?? "");
  const email = String(formData.get("email") ?? "").trim();
  const role = String(formData.get("role") ?? "employe");

  if (!employee_id) return { error: "Sélectionne un employé." };
  if (!email) return { error: "L'e-mail est obligatoire." };

  const supabase = createClient();
  const { data: employee, error: empError } = await supabase
    .from("employees")
    .select("first_name, last_name")
    .eq("id", employee_id)
    .single();

  if (empError || !employee) return { error: "Employé introuvable." };

  const admin = createAdminClient();
  const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm?next=/auth/set-password`,
  });

  if (inviteError) {
    return { error: "Échec de l'invitation : " + inviteError.message };
  }

  const { error: profileError } = await supabase.from("profiles").insert({
    id: invited.user.id,
    full_name: `${employee.last_name} ${employee.first_name}`,
    role,
    employee_id,
    email,
  });

  if (profileError) {
    // Évite un compte orphelin (auth créé mais profil manquant)
    await admin.auth.admin.deleteUser(invited.user.id);
    return { error: "Échec de la création du profil : " + profileError.message };
  }

  revalidatePath("/admin/users");
  return {};
}

export async function updateUserRole(profileId: string, formData: FormData) {
  const guard = await requireAdmin();
  if (guard.error) return;

  const role = String(formData.get("role") ?? "employe");
  const supabase = createClient();
  await supabase.from("profiles").update({ role }).eq("id", profileId);
  revalidatePath("/admin/users");
}

export async function deleteUserAccount(profileId: string) {
  const guard = await requireAdmin();
  if (guard.error) return;

  const admin = createAdminClient();
  await admin.auth.admin.deleteUser(profileId); // supprime aussi le profil (cascade)
  revalidatePath("/admin/users");
}
