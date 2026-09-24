import Link from "next/link";
import { listFindings } from "@/lib/findings";
import { STRENGTHS } from "@/lib/audit-data";
import { saveFindingNote, setFindingStatus } from "@/app/actions";

export const dynamic = "force-dynamic";

const SEVERITY: Record<string, { label: string; cls: string; dot: string }> = {
  bloquant: { label: "Bloquant", cls: "bg-red-100 text-red-800 ring-red-200", dot: "bg-red-600" },
  critique: { label: "Critique", cls: "bg-orange-100 text-orange-800 ring-orange-200", dot: "bg-orange-500" },
  important: { label: "Important", cls: "bg-amber-100 text-amber-800 ring-amber-200", dot: "bg-amber-500" },
  amelioration: { label: "Amélioration", cls: "bg-sky-100 text-sky-800 ring-sky-200", dot: "bg-sky-500" },
};

const STATUS: Record<string, { label: string; cls: string }> = {
  a_faire: { label: "À faire", cls: "bg-slate-100 text-slate-700" },
  en_cours: { label: "En cours", cls: "bg-amber-100 text-amber-800" },
  fait: { label: "Fait ✓", cls: "bg-emerald-100 text-emerald-800" },
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ severite?: string; statut?: string }>;
}) {
  const sp = await searchParams;
  const all = await listFindings();
  const items = all.filter(
    (f) => (!sp.severite || f.severity === sp.severite) && (!sp.statut || f.status === sp.statut)
  );

  const done = all.filter((f) => f.status === "fait").length;
  const pct = all.length ? Math.round((done / all.length) * 100) : 0;
  const count = (s: string) => all.filter((f) => f.severity === s).length;
  const fixedInPatch = all.filter((f) => f.autoFixed === 1).length;

  const filterHref = (key: "severite" | "statut", value?: string) => {
    const p = new URLSearchParams();
    const next = { ...sp, [key]: value };
    if (next.severite) p.set("severite", next.severite);
    if (next.statut) p.set("statut", next.statut);
    const q = p.toString();
    return q ? `/?${q}` : "/";
  };

  return (
    <div className="space-y-10">
      {/* Verdict */}
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl bg-white p-7 shadow-sm ring-1 ring-black/5 lg:col-span-2">
          <p className="text-xs font-medium uppercase tracking-widest text-[#3A6B58]">Avis général</p>
          <h1 className="mt-2 font-serif text-3xl leading-tight">
            Une base solide et bien pensée, freinée par quelques bugs précis
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-slate-700">
            L&apos;architecture (Next.js + Supabase + RLS) est la bonne pour un SIRH, le code est propre et
            très bien commenté. Les problèmes relevés ne remettent pas la conception en cause : ils se
            concentrent sur <strong>l&apos;invitation des utilisateurs</strong> (qui bloque tout le parcours
            de connexion), <strong>l&apos;envoi des documents</strong>, <strong>le PDF de paie</strong> et
            quelques <strong>règles d&apos;accès</strong>. {fixedInPatch} des {all.length} points sont déjà
            corrigés dans le patch, qui a été testé (compilation TypeScript, build Next.js, migrations
            exécutées sur PostgreSQL avec des tests RLS).
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="/downloads/sirh-snidci-corrige.zip" className="rounded-lg bg-[#3A6B58] px-4 py-2 text-sm font-medium text-white hover:bg-[#274A3E]">
              ⬇ Projet corrigé (.zip)
            </a>
            <a href="/downloads/sirh-snidci-corrections.patch" className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:border-[#3A6B58]">
              ⬇ Patch git (.patch)
            </a>
            <a href="/downloads/0005_corrections.sql" className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:border-[#3A6B58]">
              ⬇ Migration 0005 (.sql)
            </a>
            <Link href="/guide" className="px-2 py-2 text-sm font-medium text-[#3A6B58] hover:underline">
              Comment appliquer →
            </Link>
          </div>
        </div>

        <div className="rounded-2xl bg-[#16202B] p-7 text-white shadow-sm">
          <p className="text-xs uppercase tracking-widest text-white/60">Avancement</p>
          <p className="mt-2 font-serif text-5xl">{pct}%</p>
          <p className="text-sm text-white/70">
            {done} / {all.length} points marqués « Fait »
          </p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-[#9FC5B3]" style={{ width: `${pct}%` }} />
          </div>
          <ul className="mt-6 space-y-2 text-sm">
            {Object.entries(SEVERITY).map(([k, v]) => (
              <li key={k} className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${v.dot}`} /> {v.label}
                </span>
                <span className="text-white/70">{count(k)}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Points forts */}
      <section>
        <h2 className="font-serif text-xl">Ce qui est déjà bien fait</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {STRENGTHS.map((s) => (
            <li key={s} className="flex gap-3 rounded-xl bg-white p-4 text-sm text-slate-700 ring-1 ring-black/5">
              <span className="text-[#3A6B58]">✓</span>
              {s}
            </li>
          ))}
        </ul>
      </section>

      {/* Constats */}
      <section>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-xl">Corrections et recommandations</h2>
            <p className="mt-1 text-sm text-slate-600">
              Classées par priorité. Mets à jour le statut au fur et à mesure (enregistré en base).
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <Link href={filterHref("severite", undefined)} className={`rounded-full px-3 py-1 ring-1 ring-slate-200 ${!sp.severite ? "bg-[#16202B] text-white" : "bg-white"}`}>
              Toutes
            </Link>
            {Object.entries(SEVERITY).map(([k, v]) => (
              <Link key={k} href={filterHref("severite", k)} className={`rounded-full px-3 py-1 ring-1 ring-slate-200 ${sp.severite === k ? "bg-[#16202B] text-white" : "bg-white"}`}>
                {v.label}
              </Link>
            ))}
            <span className="mx-1 w-px bg-slate-300" />
            {Object.entries(STATUS).map(([k, v]) => (
              <Link key={k} href={filterHref("statut", sp.statut === k ? undefined : k)} className={`rounded-full px-3 py-1 ring-1 ring-slate-200 ${sp.statut === k ? "bg-[#16202B] text-white" : "bg-white"}`}>
                {v.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {items.map((f) => {
            const sev = SEVERITY[f.severity] ?? SEVERITY.amelioration;
            const st = STATUS[f.status] ?? STATUS.a_faire;
            return (
              <article key={f.id} className={`rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 ${f.status === "fait" ? "opacity-70" : ""}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-slate-500">{f.code}</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${sev.cls}`}>{sev.label}</span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">{f.category}</span>
                  {f.autoFixed === 1 ? (
                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs text-emerald-700 ring-1 ring-emerald-200">Corrigé dans le patch</span>
                  ) : (
                    <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-xs text-violet-700 ring-1 ring-violet-200">Recommandation</span>
                  )}
                  <span className={`ml-auto rounded-full px-2.5 py-0.5 text-xs font-medium ${st.cls}`}>{st.label}</span>
                </div>

                <h3 className="mt-3 text-lg font-semibold">{f.title}</h3>

                <dl className="mt-3 grid gap-4 text-sm md:grid-cols-3">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Problème</dt>
                    <dd className="mt-1 leading-relaxed text-slate-700">{f.problem}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pourquoi c&apos;est important</dt>
                    <dd className="mt-1 leading-relaxed text-slate-700">{f.why}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Correction</dt>
                    <dd className="mt-1 leading-relaxed text-slate-700">{f.fix}</dd>
                  </div>
                </dl>

                {f.files && (
                  <p className="mt-3 font-mono text-xs text-slate-500">📄 {f.files}</p>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
                  <div className="flex gap-1">
                    {Object.entries(STATUS).map(([k, v]) => (
                      <form key={k} action={setFindingStatus}>
                        <input type="hidden" name="id" value={f.id} />
                        <input type="hidden" name="status" value={k} />
                        <button
                          type="submit"
                          disabled={f.status === k}
                          className={`rounded-md px-3 py-1 text-xs ring-1 ring-slate-200 transition ${f.status === k ? "bg-[#16202B] text-white" : "bg-white hover:bg-slate-50"}`}
                        >
                          {v.label}
                        </button>
                      </form>
                    ))}
                  </div>
                  <form action={saveFindingNote} className="flex flex-1 gap-2">
                    <input type="hidden" name="id" value={f.id} />
                    <input
                      name="note"
                      defaultValue={f.note}
                      placeholder="Note (ex. appliqué en prod le…)"
                      className="min-w-0 flex-1 rounded-md border border-slate-200 px-3 py-1 text-xs focus:border-[#3A6B58] focus:outline-none"
                    />
                    <button type="submit" className="rounded-md bg-slate-100 px-3 py-1 text-xs hover:bg-slate-200">
                      Enregistrer
                    </button>
                  </form>
                </div>
              </article>
            );
          })}
          {!items.length && (
            <p className="rounded-2xl bg-white p-10 text-center text-sm text-slate-500">Aucun point pour ce filtre.</p>
          )}
        </div>
      </section>
    </div>
  );
}
