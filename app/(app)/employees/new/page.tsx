import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createEmployee } from "@/lib/actions/employees";
import { EmployeeForm } from "@/components/employee-form";

export default async function NewEmployeePage() {
  const supabase = createClient();

  const [{ data: departments }, { data: positions }, { data: services }, { data: sites }, { data: managers }] =
    await Promise.all([
      supabase.from("departments").select("id, name").order("name"),
      supabase.from("positions").select("id, title").order("title"),
      supabase.from("services").select("id, name, department_id").order("name"),
      supabase.from("sites").select("id, name").order("name"),
      supabase.from("employees").select("id, first_name, last_name").order("last_name"),
    ]);

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/employees" className="text-sm text-slate hover:text-accent">
        ← Retour à la liste
      </Link>
      <h1 className="mt-2 font-serif text-2xl text-ink">Nouvel employé</h1>
      <p className="mt-1 text-sm text-slate">Créer une nouvelle fiche dans le dossier du personnel.</p>

      <div className="mt-6">
        <EmployeeForm
          action={createEmployee}
          departments={departments ?? []}
          positions={positions ?? []}
          services={services ?? []}
          sites={sites ?? []}
          managers={managers ?? []}
          submitLabel="Créer l'employé"
        />
      </div>
    </div>
  );
}
