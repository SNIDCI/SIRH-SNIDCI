import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PayslipEditor } from "@/components/payroll/payslip-editor";

export default async function PayslipEditPage({
  params,
}: {
  params: { id: string; employeeId: string };
}) {
  const supabase = createClient();

  const [{ data: payRun }, { data: employee }, { data: payslip }] = await Promise.all([
    supabase.from("pay_runs").select("*").eq("id", params.id).single(),
    supabase.from("employees").select("id, first_name, last_name").eq("id", params.employeeId).single(),
    supabase.from("payslips").select("*").eq("pay_run_id", params.id).eq("employee_id", params.employeeId).maybeSingle(),
  ]);

  if (!payRun || !employee) notFound();

  let pdfUrl: string | null = null;
  if (payslip?.pdf_path) {
    const { data: signed } = await supabase.storage
      .from("payslips")
      .createSignedUrl(payslip.pdf_path, 60 * 10);
    pdfUrl = signed?.signedUrl ?? null;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link href={`/payroll/${payRun.id}`} className="text-sm text-slate hover:text-accent">
        ← Retour à {payRun.period_label}
      </Link>
      <h1 className="mt-2 font-serif text-2xl text-ink">
        {employee.last_name} {employee.first_name}
      </h1>
      <p className="mt-1 text-sm text-slate">{payRun.period_label}</p>

      <div className="mt-6">
        <PayslipEditor
          payRunId={payRun.id}
          employeeId={employee.id}
          employeeName={`${employee.last_name} ${employee.first_name}`}
          initialLines={payslip?.lines ?? []}
          netSalary={payslip?.net_salary ?? 0}
          pdfUrl={pdfUrl}
        />
      </div>
    </div>
  );
}
