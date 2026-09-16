import Link from "next/link";

const SECTIONS = [
  { href: "/admin/departments", label: "Départements", desc: "Les grands pôles de l'entreprise." },
  { href: "/admin/services", label: "Services", desc: "Sous-divisions à l'intérieur d'un département." },
  { href: "/admin/positions", label: "Postes", desc: "Intitulés de poste rattachés à un département." },
  { href: "/admin/sites", label: "Sites", desc: "Implantations géographiques." },
];

export default function AdminPage() {
  return (
    <div>
      <h1 className="font-serif text-2xl text-ink">Administration</h1>
      <p className="mt-1 text-sm text-slate">
        Gère ici les référentiels utilisés dans les fiches employés et l&apos;organigramme.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {SECTIONS.map((s) => (
          <Link key={s.href} href={s.href} className="panel p-5 hover:border-accent">
            <p className="font-serif text-lg text-ink">{s.label}</p>
            <p className="mt-1 text-sm text-slate">{s.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
