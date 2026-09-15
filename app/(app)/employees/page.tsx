import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const STATUS_STYLES: Record<string, string> = {
  actif: "bg-accent-soft text-accent-dark",
  en_conge: "bg-amber/15 text-amber",
  suspendu: "bg-rose/10 text-rose",
  sorti: "bg-slate/10 text-slate",
};

const STATUS_LABELS: Record<string, string> = {
  actif: "Actif",
  en_conge: "En congé",
  suspendu: "Suspendu",
  sorti: "Sorti",
};

export default async function EmployeesPage({
  searchParams,
}: {
  searchParams: { q?: string; department?: string };
}) {
  const supabase = createClient();

  const { data: departments } = await supabase
    .from("departments")
    .select("id, name")
    .order("name");

  let query = supabase
    .from("employees")
    .select(
      "id, first_name, last_name, work_email, status, hire_date, position:positions(title), department:departments(id, name)"
    )
    .order("last_name");

  if (searchParams.department) {
    query = query.eq("department_id", searchParams.department);
  }
  if (searchParams.q) {
    query = query.or(
      `first_name.ilike.%${searchParams.q}%,last_name.ilike.%${searchParams.q}%,work_email.ilike.%${searchParams.q}%`
    );
  }

  const { data: employees } = await query;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-ink">Employés</h1>
          <p className="mt-1 text-sm text-slate">
            {employees?.length ?? 0} personne(s) — dossier du personnel.
          </p>
        </div>
        <Link href="/employees/new" className="btn-primary">
          + Nouvel employé
        </Link>
      </div>

      <form className="mt-6 flex gap-3" method="get">
        <input
          type="search"
          name="q"
          defaultValue={searchParams.q}
          placeholder="Rechercher par nom ou e-mail…"
          className="field-input max-w-xs"
        />
        <select name="department" defaultValue={searchParams.department ?? ""} className="field-input max-w-[220px]">
          <option value="">Tous les départements</option>
          {departments?.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        <button type="submit" className="btn-secondary">
          Filtrer
        </button>
      </form>

      <div className="mt-6 panel overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-canvas/60 text-xs uppercase tracking-wide text-slate">
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Poste</th>
              <th className="px-4 py-3">Département</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Entrée</th>
            </tr>
          </thead>
          <tbody>
            {employees?.map((emp: any) => (
              <tr key={emp.id} className="border-b border-line last:border-0 hover:bg-canvas/40">
                <td className="px-4 py-3">
                  <Link href={`/employees/${emp.id}`} className="font-medium text-ink hover:text-accent">
                    {emp.first_name} {emp.last_name}
                  </Link>
                  <p className="text-xs text-slate">{emp.work_email}</p>
                </td>
                <td className="px-4 py-3 text-slate">{emp.position?.title ?? "—"}</td>
                <td className="px-4 py-3 text-slate">{emp.department?.name ?? "—"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      STATUS_STYLES[emp.status] ?? "bg-slate/10 text-slate"
                    }`}
                  >
                    {STATUS_LABELS[emp.status] ?? emp.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate">
                  {new Date(emp.hire_date).toLocaleDateString("fr-FR")}
                </td>
              </tr>
            ))}
            {!employees?.length && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate">
                  Aucun employé ne correspond à ces critères.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
