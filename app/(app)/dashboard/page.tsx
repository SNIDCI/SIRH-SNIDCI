import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = createClient();

  const { count: totalEmployees } = await supabase
    .from("employees")
    .select("*", { count: "exact", head: true })
    .eq("status", "actif");

  const { count: onLeave } = await supabase
    .from("employees")
    .select("*", { count: "exact", head: true })
    .eq("status", "en_conge");

  const { count: departments } = await supabase
    .from("departments")
    .select("*", { count: "exact", head: true });

  const cards = [
    { label: "Employés actifs", value: totalEmployees ?? 0 },
    { label: "En congé", value: onLeave ?? 0 },
    { label: "Départements", value: departments ?? 0 },
  ];

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink">Tableau de bord</h1>
      <p className="mt-1 text-sm text-slate">Vue d&apos;ensemble de l&apos;effectif.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="panel p-5">
            <p className="text-xs uppercase tracking-wide text-slate">{c.label}</p>
            <p className="mt-2 font-serif text-3xl text-ink">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 panel p-5">
        <p className="text-sm text-slate">
          Les modules Recrutement, Temps &amp; absences et Performance seront ajoutés
          dans les prochaines itérations.
        </p>
      </div>
    </div>
  );
}
