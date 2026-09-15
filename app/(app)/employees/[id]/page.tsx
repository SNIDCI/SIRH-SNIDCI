import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateEmployee } from "@/lib/actions/employees";
import { EmployeeForm } from "@/components/employee-form";

export default async function EmployeeDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const [{ data: employee }, { data: departments }, { data: positions }, { data: managers }, { data: history }] =
    await Promise.all([
      supabase.from("employees").select("*").eq("id", params.id).single(),
      supabase.from("departments").select("id, name").order("name"),
      supabase.from("positions").select("id, title").order("title"),
      supabase.from("employees").select("id, first_name, last_name").order("last_name"),
      supabase
        .from("employee_history")
        .select("id, event_type, description, effective_date")
        .eq("employee_id", params.id)
        .order("effective_date", { ascending: false }),
    ]);

  if (!employee) {
    notFound();
  }

  const boundUpdate = updateEmployee.bind(null, employee.id);

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/employees" className="text-sm text-slate hover:text-accent">
        ← Retour à la liste
      </Link>
      <h1 className="mt-2 font-serif text-2xl text-ink">
        {employee.first_name} {employee.last_name}
      </h1>
      <p className="mt-1 text-sm text-slate">Fiche employé — modification des informations.</p>

      <div className="mt-6">
        <EmployeeForm
          action={boundUpdate}
          employee={employee}
          departments={departments ?? []}
          positions={positions ?? []}
          managers={managers ?? []}
          submitLabel="Enregistrer les modifications"
        />
      </div>

      <div className="mt-8">
        <h2 className="font-serif text-lg text-ink">Historique de carrière</h2>
        <div className="mt-3 panel divide-y divide-line">
          {history?.length ? (
            history.map((h) => (
              <div key={h.id} className="flex items-start gap-4 px-4 py-3">
                <span className="w-24 flex-none text-xs text-slate">
                  {new Date(h.effective_date).toLocaleDateString("fr-FR")}
                </span>
                <div>
                  <p className="text-sm font-medium capitalize text-ink">{h.event_type}</p>
                  {h.description && <p className="text-sm text-slate">{h.description}</p>}
                </div>
              </div>
            ))
          ) : (
            <p className="px-4 py-6 text-center text-sm text-slate">Aucun évènement enregistré.</p>
          )}
        </div>
      </div>
    </div>
  );
}
