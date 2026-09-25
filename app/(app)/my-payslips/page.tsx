import { createClient } from "@/lib/supabase/server";

export default async function MyPayslipsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("employee_id")
    .eq("id", user?.id)
    .single();

  if (!profile?.employee_id) {
    return (
      <div>
        <h1 className="font-serif text-2xl text-ink">Mes bulletins</h1>
        <p className="mt-4 text-sm text-slate">
          Ton compte n&apos;est pas encore relié à une fiche employé. Contacte la RH.
        </p>
      </div>
    );
  }

  const { data: payslips } = await supabase
    .from("payslips")
    .select("id, net_salary, pdf_path, pay_run:pay_runs(period_label, period_month)")
    .eq("employee_id", profile.employee_id)
    .not("pdf_path", "is", null)
    .order("created_at", { ascending: false });

  const withUrls = await Promise.all(
    (payslips ?? []).map(async (p: any) => {
      const { data: signed } = await supabase.storage
        .from("payslips")
        .createSignedUrl(p.pdf_path, 60 * 10);
      return { ...p, url: signed?.signedUrl ?? null };
    })
  );

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="font-serif text-2xl text-ink">Mes bulletins</h1>
      <p className="mt-1 text-sm text-slate">Historique de tes bulletins de paie.</p>

      <div className="mt-6 panel divide-y divide-line">
        {withUrls.length ? (
          withUrls.map((p) => (
            <div key={p.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium text-ink">{p.pay_run?.period_label}</p>
                <p className="text-xs text-slate">{p.net_salary.toLocaleString("fr-FR")} F net</p>
              </div>
              {p.url && (
                <a href={p.url} target="_blank" rel="noreferrer" className="text-sm text-accent hover:underline">
                  Télécharger
                </a>
              )}
            </div>
          ))
        ) : (
          <p className="px-4 py-6 text-center text-sm text-slate">Aucun bulletin disponible pour le moment.</p>
        )}
      </div>
    </div>
  );
}
