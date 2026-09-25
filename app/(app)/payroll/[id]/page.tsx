import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { validatePayRun } from "@/lib/actions/payroll";

export default async function PayRunDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const [{ data: payRun }, { data: employees }, { data: payslips }] = await Promise.all([
    supabase.from("pay_runs").select("*").eq("id", params.id).single(),
    supabase.from("employees").select("id, first_name, last_name").eq("status", "actif").order("last_name"),
    supabase.from("payslips").select("employee_id, net_salary, pdf_path").eq("pay_run_id", params.id),
  ]);

  if (!payRun) notFound();

  const payslipByEmployee = new Map((payslips ?? []).map((p) => [p.employee_id, p]));
  const boundValidate = validatePayRun.bind(null, payRun.id);

  return (
    <div>
      <Link href="/payroll" className="text-sm text-slate hover:text-accent">
        ← Retour aux périodes
      </Link>
      <div className="mt-2 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-ink">{payRun.period_label}</h1>
          <p className="mt-1 text-sm text-slate">
            {payslipByEmployee.size} / {employees?.length ?? 0} bulletin(s) saisi(s)
          </p>
        </div>
        {payRun.status === "brouillon" && (
          <form action={boundValidate}>
            <button type="submit" className="btn-secondary text-sm">Marquer la période comme validée</button>
          </form>
        )}
      </div>

      <div className="mt-6 panel divide-y divide-line">
        {employees?.map((e) => {
          const slip = payslipByEmployee.get(e.id);
          return (
            <div key={e.id} className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-ink">{e.last_name} {e.first_name}</span>
              <div className="flex items-center gap-4">
                {slip ? (
                  <>
                    <span className="text-sm text-slate">{slip.net_salary.toLocaleString("fr-FR")} F</span>
                    <span className={`text-xs ${slip.pdf_path ? "text-accent" : "text-amber"}`}>
                      {slip.pdf_path ? "PDF généré" : "PDF à générer"}
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-slate">Non saisi</span>
                )}
                <Link href={`/payroll/${payRun.id}/${e.id}`} className="text-sm text-accent hover:underline">
                  {slip ? "Modifier" : "Saisir"}
                </Link>
              </div>
            </div>
          );
        })}
        {!employees?.length && (
          <p className="px-4 py-6 text-center text-sm text-slate">Aucun employé actif.</p>
        )}
      </div>
    </div>
  );
}
