# SIRH — Socle applicatif + Module Gestion des employés

Application web de gestion RH, construite avec :
- **Next.js 14** (App Router, TypeScript) — frontend + backend (Server Actions)
- **Supabase** — base de données PostgreSQL, authentification, Row Level Security
- **Tailwind CSS** — styles
- **Vercel** — hébergement (recommandé)
- **GitHub** — versionning et CI/CD

Ce livrable contient le **socle** (authentification, navigation, structure du projet)
et le **module Gestion des employés** (dossier du personnel, organigramme, historique de carrière).

---

## 1. Créer le projet Supabase

1. Va sur [supabase.com](https://supabase.com) → **New project**.
2. Une fois le projet créé, va dans **Project Settings → API** et récupère :
   - `Project URL`
   - `anon public key`
3. Va dans **SQL Editor** et exécute, **dans l'ordre** :
   - le contenu de `supabase/migrations/0001_init.sql` (schéma initial + sécurité)
   - le contenu de `supabase/migrations/0002_extend_employees.sql` (identité étendue,
     contrats, rémunération, documents, référentiels sites/services)
   - le contenu de `supabase/migrations/0003_profiles_email.sql` (email sur profils)
   - (optionnel, pour tester) le contenu de `supabase/seed.sql` (données de démo)
4. Après ta première inscription dans l'app (étape 4 ci-dessous), remonte dans
   **Table Editor → profiles** et mets manuellement ton rôle à `admin` pour ton
   propre compte (le premier compte doit être promu admin à la main).

## 2. Configurer les variables d'environnement

```bash
cp .env.example .env.local
```

Remplis `.env.local` avec l'URL et la clé récupérées à l'étape 1.

## 3. Installer et lancer en local

```bash
npm install
npm run dev
```

L'application est disponible sur http://localhost:3000.

## 4. Créer ton premier compte

Comme il n'y a pas encore d'écran d'inscription (volontairement — en entreprise,
les comptes sont généralement créés par un admin), crée ton premier utilisateur
directement depuis le Dashboard Supabase :

**Authentication → Users → Add user** (renseigne un e-mail et un mot de passe).

Puis dans **Table Editor → profiles**, ajoute une ligne :
- `id` = l'UUID de l'utilisateur créé (visible dans Authentication → Users)
- `full_name` = ton nom
- `role` = `admin`

Tu peux ensuite te connecter sur `/login` avec cet e-mail/mot de passe.

## 5. Pousser sur GitHub

```bash
git init
git add .
git commit -m "Socle SIRH + module Gestion des employés"
git branch -M main
git remote add origin <URL_DE_TON_REPO_GITHUB>
git push -u origin main
```

## 6. Déployer sur Vercel

1. Sur [vercel.com](https://vercel.com) → **Add New → Project** → importe ton repo GitHub.
2. Dans les **Environment Variables** du projet Vercel, ajoute les deux mêmes
   variables que dans `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
3. Déploie. Chaque push sur `main` redéploiera automatiquement.

## Nouveau : gérer l'organigramme et les référentiels

Avant de créer des employés, va dans **Administration** (menu de gauche) et renseigne :
1. **Départements** (les grands pôles : RH, Finance, Technologie…)
2. **Services** (sous-divisions d'un département)
3. **Postes** (intitulés précis, rattachés à un département)
4. **Sites** (implantations géographiques)

Ces listes alimentent ensuite automatiquement les menus déroulants du formulaire
employé — c'est pour ça qu'ils apparaissaient vides au départ : ce ne sont pas des
champs de texte libre, mais des listes à choisir, qui se remplissent au fur et à
mesure que tu ajoutes tes données réelles dans Administration.

L'**organigramme** (`/employees/org-chart`) se construit ensuite tout seul à partir
du champ "Responsable hiérarchique" renseigné sur chaque fiche employé — aucune
saisie manuelle de l'arbre n'est nécessaire.

## Nouveau : fiche employé complète

La fiche employé (`/employees/[id]`) est maintenant organisée en onglets :
- **Identité & poste** — état civil, contacts, contact d'urgence, rattachement, poste
- **Contrats** — historique des contrats et renouvellements
- **Rémunération** — historique de référence (salaire, primes, augmentations) ;
  le calcul de la paie elle-même reste géré par un logiciel externe (voir cahier
  des charges, module Paie)
- **Documents** — upload de fichiers (contrat, CV, diplômes, attestations…),
  stockés de façon sécurisée et privée dans Supabase Storage
- **Historique de carrière** — journal des évènements (embauche, mobilité…)

## Nouveau : comptes utilisateurs et rôles

Le menu **Administration → Comptes & rôles** permet enfin de créer des accès
sans passer par le Dashboard Supabase :
1. Choisis un employé existant dans la liste (son e-mail professionnel se
   remplit automatiquement, modifiable si besoin).
2. Choisis son rôle (Administrateur / RH / Manager / Employé).
3. Clique "Envoyer l'invitation" — la personne reçoit un e-mail pour choisir
   son mot de passe elle-même (tu ne vois jamais son mot de passe).

Tu peux ensuite changer le rôle de quelqu'un à tout moment, ou supprimer son
compte, directement depuis cette page.

⚠️ **Nouvelle variable d'environnement requise : `SUPABASE_SERVICE_ROLE_KEY`.**
Cette fonctionnalité a besoin d'une clé technique supplémentaire pour pouvoir
créer des comptes. Va dans Supabase → **Project Settings → API**, et sous
"Project API keys", copie la clé **`service_role`** (différente de la clé
`anon public` déjà utilisée). Ajoute-la :
- dans `.env.local` en local, comme `SUPABASE_SERVICE_ROLE_KEY=...`
- dans Vercel → Project Settings → Environment Variables, même nom.

Cette clé est très sensible (elle contourne toutes les règles de sécurité) —
ne la partage jamais et ne la mets jamais dans une variable commençant par
`NEXT_PUBLIC_`, sinon elle serait visible par n'importe qui dans le navigateur.

### ⚠️ Configuration obligatoire pour que les invitations fonctionnent

Par défaut, Supabase envoie les liens d'invitation vers `localhost:3000` (adresse
de développement), ce qui casse le lien pour la personne invitée. Deux réglages
à faire une seule fois :

1. **Dans Supabase** → Authentication → **URL Configuration** :
   - "Site URL" = l'adresse de ton app Vercel (ex. `https://sirh-app.vercel.app`)
   - Dans "Redirect URLs", ajoute la même adresse suivie de `/**` (ex.
     `https://sirh-app.vercel.app/**`)
2. **Dans Vercel** → Environment Variables, ajoute `NEXT_PUBLIC_SITE_URL` avec
   cette même adresse (sans `/` à la fin), et **redéploie** après l'avoir ajoutée.

La personne invitée arrive ensuite sur une page `/auth/set-password` où elle
choisit elle-même son mot de passe pour activer son compte.

---

## Structure du projet

```
app/
  login/                    → page de connexion
  (app)/                    → espace authentifié (sidebar + topbar)
    dashboard/              → tableau de bord (compteurs de base)
    employees/               → liste des employés (recherche + filtre département)
    employees/new/           → création d'une fiche employé
    employees/[id]/          → détail, édition, historique de carrière
    employees/org-chart/     → organigramme dynamique
lib/
  supabase/                 → clients Supabase (navigateur / serveur)
  actions/employees.ts      → Server Actions (créer / mettre à jour un employé)
  types.ts                  → types partagés
components/
  sidebar.tsx, topbar.tsx, employee-form.tsx
supabase/
  migrations/0001_init.sql  → schéma complet + Row Level Security
  seed.sql                  → données de démonstration (facultatif)
middleware.ts               → protection des routes + rafraîchissement de session
```

## Sécurité mise en place

- **Row Level Security** activée sur toutes les tables.
- Rôles applicatifs : `admin`, `rh`, `manager`, `employe`.
  - `admin` / `rh` : accès complet aux employés.
  - `manager` : lecture des fiches de son équipe directe uniquement.
  - `employe` : lecture de sa propre fiche uniquement.
- Le middleware Next.js protège toutes les routes de `(app)` : un utilisateur
  non connecté est redirigé vers `/login`.

## Prochaines étapes suggérées

- Module **Temps & absences** (congés, soldes, workflow de validation)
- Module **Recrutement** (pipeline de candidatures)
- Écran d'administration pour créer/gérer les comptes et rôles depuis l'app
  (actuellement fait à la main via le Dashboard Supabase)
- Génération de types TypeScript automatique :
  `npx supabase gen types typescript --project-id <id> > lib/types.ts`
