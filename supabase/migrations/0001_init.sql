-- ============================================================
-- SIRH — Migration initiale : Gestion des employés + socle rôles
-- ============================================================

-- Extension nécessaire pour les UUID
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- Table des rôles applicatifs, liée à auth.users de Supabase
-- ------------------------------------------------------------
create type app_role as enum ('admin', 'rh', 'manager', 'employe');

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role app_role not null default 'employe',
  employee_id uuid, -- rempli après création de la fiche employé liée
  created_at timestamptz not null default now()
);

comment on table public.profiles is 'Profil applicatif lié à chaque utilisateur Supabase Auth (rôle, nom).';

-- ------------------------------------------------------------
-- Départements
-- ------------------------------------------------------------
create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Postes / intitulés
-- ------------------------------------------------------------
create table if not exists public.positions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  department_id uuid references public.departments(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Employés — fiche principale
-- ------------------------------------------------------------
create type employee_status as enum ('actif', 'en_conge', 'suspendu', 'sorti');
create type contract_type as enum ('cdi', 'cdd', 'stage', 'alternance', 'freelance');

create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  -- Identité
  first_name text not null,
  last_name text not null,
  personal_email text,
  work_email text unique,
  phone text,
  birth_date date,

  -- Poste et rattachement
  position_id uuid references public.positions(id) on delete set null,
  department_id uuid references public.departments(id) on delete set null,
  manager_id uuid references public.employees(id) on delete set null,

  -- Contrat
  contract_type contract_type not null default 'cdi',
  hire_date date not null default current_date,
  end_date date,
  status employee_status not null default 'actif',

  -- Localisation (utile en multi-site)
  site text,
  country text default 'CI',

  -- Métadonnées
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.employees is 'Fiche employé — dossier du personnel.';

-- Index utiles pour les vues fréquentes (organigramme, listes filtrées)
create index if not exists idx_employees_manager on public.employees(manager_id);
create index if not exists idx_employees_department on public.employees(department_id);
create index if not exists idx_employees_status on public.employees(status);

-- Lien retour profil -> employé
alter table public.profiles
  add constraint profiles_employee_id_fkey
  foreign key (employee_id) references public.employees(id) on delete set null;

-- Trigger updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_employees_updated_at
  before update on public.employees
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- Historique de carrière (mobilité, promotions)
-- ------------------------------------------------------------
create table if not exists public.employee_history (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  event_type text not null, -- 'embauche' | 'promotion' | 'mobilite' | 'sortie' ...
  description text,
  effective_date date not null default current_date,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.profiles enable row level security;
alter table public.departments enable row level security;
alter table public.positions enable row level security;
alter table public.employees enable row level security;
alter table public.employee_history enable row level security;

-- Fonction utilitaire : rôle de l'utilisateur courant
create or replace function public.current_role_is(roles app_role[])
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = any(roles)
  );
$$ language sql stable security definer;

-- Profiles : chacun voit son propre profil ; admin/rh voient tout
create policy "profiles_self_select" on public.profiles
  for select using (id = auth.uid() or public.current_role_is(array['admin','rh']::app_role[]));

create policy "profiles_admin_write" on public.profiles
  for all using (public.current_role_is(array['admin']::app_role[]));

-- Départements et postes : lecture pour tous les utilisateurs authentifiés, écriture admin/rh
create policy "departments_read" on public.departments
  for select using (auth.uid() is not null);
create policy "departments_write" on public.departments
  for all using (public.current_role_is(array['admin','rh']::app_role[]));

create policy "positions_read" on public.positions
  for select using (auth.uid() is not null);
create policy "positions_write" on public.positions
  for all using (public.current_role_is(array['admin','rh']::app_role[]));

-- Employés :
--   - admin/rh : accès complet
--   - manager : lecture sur son équipe directe (rattachée via manager_id)
--   - employé : lecture sur sa propre fiche uniquement
create policy "employees_admin_rh_all" on public.employees
  for all using (public.current_role_is(array['admin','rh']::app_role[]));

create policy "employees_manager_read_team" on public.employees
  for select using (
    manager_id in (
      select employee_id from public.profiles where id = auth.uid()
    )
  );

create policy "employees_self_read" on public.employees
  for select using (
    id in (select employee_id from public.profiles where id = auth.uid())
  );

-- Historique : même logique que la fiche employé, en lecture
create policy "history_admin_rh_all" on public.employee_history
  for all using (public.current_role_is(array['admin','rh']::app_role[]));

create policy "history_self_read" on public.employee_history
  for select using (
    employee_id in (select employee_id from public.profiles where id = auth.uid())
  );
