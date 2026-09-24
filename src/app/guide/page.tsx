import type { ReactNode } from "react";

const STEPS: { title: string; body: ReactNode; code?: string }[] = [
  {
    title: "1. Appliquer le code corrigé",
    body: (
      <>
        Option A — avec git, à la racine de ton dépôt (télécharge d&apos;abord le fichier .patch) :
      </>
    ),
    code: "git checkout -b corrections-audit\ngit am < sirh-snidci-corrections.patch\ngit push -u origin corrections-audit",
  },
  {
    title: "",
    body: (
      <>
        Option B — sans git : télécharge le <strong>.zip</strong>, et remplace les fichiers listés sur la page
        « Patch » par ceux du zip (ou tout le dossier, puis <code>npm install</code>).
      </>
    ),
  },
  {
    title: "2. Exécuter la migration 0005 dans Supabase",
    body: (
      <>
        Supabase → <strong>SQL Editor</strong> → colle le contenu de{" "}
        <code>supabase/migrations/0005_corrections.sql</code> → Run. Elle est idempotente (relançable sans risque).
      </>
    ),
  },
  {
    title: "3. Vérifier la configuration d'authentification",
    body: (
      <>
        Supabase → Authentication → <strong>URL Configuration</strong> :<br />• Site URL ={" "}
        <code>https://ton-app.vercel.app</code>
        <br />• Redirect URLs : <code>https://ton-app.vercel.app/**</code> et <code>http://localhost:3000/**</code>
      </>
    ),
  },
  {
    title: "4. (Recommandé) Modifier le modèle d'e-mail d'invitation",
    body: (
      <>
        Authentication → <strong>Email Templates → Invite user</strong>, remplace le lien par celui-ci. La page
        accepte les deux formats, mais celui-ci ne dépend plus du fragment d&apos;URL :
      </>
    ),
    code: '<a href="{{ .SiteURL }}/auth/set-password?token_hash={{ .TokenHash }}&type=invite">Activer mon compte</a>',
  },
  {
    title: "5. Variables d'environnement Vercel",
    body: (
      <>
        Vérifie <code>NEXT_PUBLIC_SUPABASE_URL</code>, <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>,{" "}
        <code>SUPABASE_SERVICE_ROLE_KEY</code> et <code>NEXT_PUBLIC_SITE_URL</code> (sans « / » final), puis{" "}
        <strong>redéploie</strong> (les variables NEXT_PUBLIC_ ne sont prises en compte qu&apos;au build).
      </>
    ),
  },
  {
    title: "6. Premier administrateur",
    body: <>Crée l&apos;utilisateur dans Authentication → Users, le profil est créé automatiquement, puis :</>,
    code: "update public.profiles set role = 'admin' where email = 'ton@email.com';",
  },
  {
    title: "7. Tester l'invitation de bout en bout",
    body: (
      <>
        Administration → Comptes &amp; rôles → invite une adresse de test → ouvre le lien{" "}
        <strong>dans une fenêtre de navigation privée</strong> → choisis le mot de passe → tu dois arriver sur
        le tableau de bord. Si le lien affiche « expiré » immédiatement, c&apos;est souvent l&apos;antivirus de la
        messagerie (Outlook Safe Links) qui l&apos;a déjà « cliqué » : l&apos;étape 4 et un bouton « Renvoyer »
        (voir QUAL-03) règlent ce cas.
      </>
    ),
  },
];

export default function GuidePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-serif text-3xl">Mise en place des corrections</h1>
        <p className="mt-1 text-sm text-slate-600">Environ 15 minutes. Suis les étapes dans l&apos;ordre.</p>
      </div>
      {STEPS.map((s, i) => (
        <section key={i} className="rounded-2xl bg-white p-6 ring-1 ring-black/5">
          {s.title && <h2 className="text-lg font-semibold">{s.title}</h2>}
          <p className="mt-2 text-sm leading-relaxed text-slate-700">{s.body}</p>
          {s.code && (
            <pre className="mt-3 overflow-x-auto rounded-lg bg-[#16202B] p-4 text-xs leading-relaxed text-[#CFE3D9]">
              {s.code}
            </pre>
          )}
        </section>
      ))}
    </div>
  );
}
