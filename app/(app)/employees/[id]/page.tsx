import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateEmployee } from "@/lib/actions/employees";
import { EmployeeForm } from "@/components/employee-form";
import { Tabs } from "@/components/tabs";
import { ContractsPanel } from "@/components/employee/contracts-panel";
import { CompensationPanel } from "@/components/employee/compensation-panel";
import { DocumentsPanel } from "@/components/employee/documents-panel";

export default async function EmployeeDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const [
    { data: employee },
    { data: departments },
    { data: positions },
    { data: services },
    { data: sites },
    { data: managers },
    { data: history },
    { data: contracts },
    { data: compensation },
    { data: documents },
  ] = await Promise.all([
    supabase.from("employees").select("*").eq("id", params.id).single(),
    supabase.from("departments").select("id, name").order("name"),
    supabase.from("positions").select("id, title").order("title"),
    supabase.from("services").select("id, name, department_id").order("name"),
    supabase.from("sites").select("id, name").order("name"),
    supabase.from("employees").select("id, first_name, last_name").order("last_name"),
    supabase.from("employee_history").select("id, event_type, description, effective_date")
      .eq("employee_id", params.id).order("effective_date", { ascending: false }),
    supabase.from("employee_contracts").select("*").eq("employee_id", params.id)
      .order("start_date", { ascending: false }),
    supabase.from("compensation_history").select("*").eq("employee_id", params.id)
      .order("effective_date", { ascending: false }),
    supabase.from("employee_documents").select("*").eq("employee_id", params.id)
      .order("uploaded_at", { ascending: false }),
  ]);

  if (!employee) {
    notFound();
  }

  // Génère des URL signées (bucket privé) pour permettre le téléchargement des documents
  const documentsWithUrls = await Promise.all(
    (documents ?? []).map(async (d) => {
      const { data: signed } = await supabase.storage
        .from("employee-documents")
        .createSignedUrl(d.storage_path, 60 * 10);
      return { ...d, url: signed?.signedUrl ?? null };
    })
  );

  const boundUpdate = updateEmployee.bind(null, employee.id);

  // Ancienneté calculée à la volée (jamais stockée, pour rester toujours exacte)
  const hireDate = new Date(employee.hire_date);
  const now = new Date();
  let years = now.getFullYear() - hireDate.getFullYear();
  let months = now.getMonth() - hireDate.getMonth();
  if (months < 0) { years -= 1; months += 12; }
  const seniority = `${years} an${years > 1 ? "s" : ""}${months > 0 ? ` et ${months} mois` : ""}`;

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/employees" className="text-sm text-slate hover:text-accent">
        ← Retour à la liste
      </Link>
      <h1 className="mt-2 font-serif text-2xl text-ink">
        {employee.last_name} {employee.first_name}
      </h1>
      <p className="mt-1 text-sm text-slate">
        Dossier complet de l&apos;employé — {seniority} d&apos;ancienneté.
      </p>

      <div className="mt-6">
        <Tabs
          tabs={[
            {
              key: "identite",
              label: "Identité & poste",
              content: (
                <EmployeeForm
                  action={boundUpdate}
                  employee={employee}
                  departments={departments ?? []}
                  positions={positions ?? []}
                  services={services ?? []}
                  sites={sites ?? []}
                  managers={managers ?? []}
                  submitLabel="Enregistrer les modifications"
                />
              ),
            },
            {
              key: "contrats",
              label: "Contrats",
              content: <ContractsPanel employeeId={employee.id} contracts={contracts ?? []} />,
            },
            {
              key: "remuneration",
              label: "Rémunération",
              content: <CompensationPanel employeeId={employee.id} entries={compensation ?? []} />,
            },
            {
              key: "documents",
              label: "Documents",
              content: <DocumentsPanel employeeId={employee.id} documents={documentsWithUrls} />,
            },
            {
              key: "historique",
              label: "Historique de carrière",
              content: (
                <div className="panel divide-y divide-line">
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
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
