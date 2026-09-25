"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { buildPayslipPdf } from "@/lib/payslip-pdf";
import type { PayslipLine } from "@/lib/types";

export interface SimpleFormState {
  error?: string;
}

const COMPANY_NAME = "Mon Entreprise"; // à personnaliser plus tard dans un écran de paramètres

export async function createPayRun(_prev: SimpleFormState, formData: FormData): Promise<SimpleFormState> {
  const period_month = String(formData.get("period_month") ?? ""); // format YYYY-MM
  if (!period_month) return { error: "La période est obligatoire." };

  const [year, month] = period_month.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  const period_label = date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  const capitalized = period_label.charAt(0).toUpperCase() + period_label.slice(1);

  const supabase = createClient();
  const { error } = await supabase.from("pay_runs").insert({
    period_label: capitalized,
    period_month: `${period_month}-01`,
  });

  if (error) {
    if (error.code === "23505") return { error: "Une période de paie existe déjà pour ce mois." };
    return { error: error.message };
  }

  revalidatePath("/payroll");
  return {};
}

export async function savePayslip(
  payRunId: string,
  employeeId: string,
  _prev: SimpleFormState,
  formData: FormData
): Promise<SimpleFormState> {
  const supabase = createClient();

  const labels = formData.getAll("line_label") as string[];
  const amounts = formData.getAll("line_amount") as string[];

  const lines: PayslipLine[] = labels
    .map((label, i) => ({ label: label.trim(), amount: Number(amounts[i] ?? 0) }))
    .filter((l) => l.label.length > 0);

  if (!lines.length) return { error: "Ajoute au moins une ligne au bulletin." };

  const net_salary = lines.reduce((sum, l) => sum + l.amount, 0);

  const { error } = await supabase
    .from("payslips")
    .upsert(
      { pay_run_id: payRunId, employee_id: employeeId, lines, net_salary, pdf_path: null, generated_at: null },
      { onConflict: "pay_run_id,employee_id" }
    );

  if (error) return { error: error.message };

  revalidatePath(`/payroll/${payRunId}`);
  return {};
}

export async function generatePayslipPdf(payRunId: string, employeeId: string): Promise<SimpleFormState> {
  const supabase = createClient();

  const [{ data: payslip }, { data: payRun }, { data: employee }] = await Promise.all([
    supabase.from("payslips").select("*").eq("pay_run_id", payRunId).eq("employee_id", employeeId).single(),
    supabase.from("pay_runs").select("*").eq("id", payRunId).single(),
    supabase.from("employees").select("first_name, last_name, position:positions(title)").eq("id", employeeId).single(),
  ]);

  if (!payslip || !payRun || !employee) return { error: "Données introuvables." };

  let buffer: Uint8Array;
  try {
    buffer = await buildPayslipPdf({
      companyName: COMPANY_NAME,
      periodLabel: payRun.period_label,
      employeeName: `${employee.last_name} ${employee.first_name}`,
      employeeRole: (employee as any).position?.title ?? "",
      lines: payslip.lines,
      netSalary: payslip.net_salary,
    });
  } catch (e: any) {
    return { error: "Échec de la mise en page du PDF : " + (e?.message ?? String(e)) };
  }

  const path = `${employeeId}/${payRunId}.pdf`;
  const { error: uploadError } = await supabase.storage
    .from("payslips")
    .upload(path, Buffer.from(buffer), { contentType: "application/pdf", upsert: true });

  if (uploadError) return { error: "Échec de l'envoi du fichier : " + uploadError.message };

  const { error: updateError } = await supabase
    .from("payslips")
    .update({ pdf_path: path, generated_at: new Date().toISOString() })
    .eq("id", payslip.id);

  if (updateError) return { error: "Échec de la mise à jour : " + updateError.message };

  revalidatePath(`/payroll/${payRunId}`);
  return {};
}

export async function validatePayRun(payRunId: string) {
  const supabase = createClient();
  await supabase.from("pay_runs").update({ status: "valide" }).eq("id", payRunId);
  revalidatePath(`/payroll/${payRunId}`);
  revalidatePath("/payroll");
}

export async function deletePayRun(payRunId: string) {
  const supabase = createClient();

  // Supprime d'abord les fichiers PDF associés dans le stockage, pour ne pas
  // laisser de fichiers orphelins (la suppression de la période supprime
  // automatiquement les lignes de bulletins en base grâce à la cascade SQL).
  const { data: payslips } = await supabase
    .from("payslips")
    .select("pdf_path")
    .eq("pay_run_id", payRunId)
    .not("pdf_path", "is", null);

  const paths = (payslips ?? []).map((p) => p.pdf_path).filter(Boolean) as string[];
  if (paths.length) {
    await supabase.storage.from("payslips").remove(paths);
  }

  await supabase.from("pay_runs").delete().eq("id", payRunId);
  revalidatePath("/payroll");
}
