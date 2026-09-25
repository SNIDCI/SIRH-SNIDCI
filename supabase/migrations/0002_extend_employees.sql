-- ============================================================
-- SIRH — Migration 0002 : identité étendue, référentiels,
-- contrats, rémunération, documents
-- ============================================================

-- ------------------------------------------------------------
-- Référentiels gérables depuis l'app (Administration)
-- ------------------------------------------------------------
create table if not exists public.sites (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  department_id uuid references public.departments(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (name, department_id)
);

-- ------------------------------------------------------------
-- Employés : nouveaux champs d'identité + rattachements
-- ------------------------------------------------------------
alter table public.employees rename column phone to phone_primary;

alter table public.employees
  add column if not exists phone_secondary text,
  add column if not exists photo_url text,
  add column if not exists birth_place text,
  add column if not exists nationality text,
  add column if not exists gender text check (gender in ('homme', 'femme', 'autre')),
  add column if not exists marital_status text
    check (marital_status in ('celibataire','marie','divorce','veuf','union_libre')),
  add column if not exists address text,
  add column if not exists emergency_contact_name text,
  add column if not exists emergency_contact_phone text,
  add column if not exists emergency_contact_relation text,
  add column if not exists service_id uuid references public.services(id) on delete set null,
  add column if not exists site_id uuid references public.sites(id) on delete set null,
  add column if not exists trial_period_end date;

comment on column public.employees.site is 'Ancien champ texte libre — conservé pour compatibilité, remplacé par site_id.';

-- Élargir les types de contrat possibles
alter type contract_type add value if not exists 'interim';

-- ------------------------------------------------------------
-- Historique des contrats (une ligne par contrat/renouvellement)
-- ------------------------------------------------------------
create table if not exists public.employee_contracts (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  contract_type contract_type not null,
  start_date date not null,
  end_date date,
  trial_period_end date,
  is_renewal boolean not null default false,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_contracts_employee on public.employee_contracts(employee_id);

-- ------------------------------------------------------------
-- Historique de rémunération (référence — pas un moteur de paie)
-- ------------------------------------------------------------
create table if not exists public.compensation_history (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  effective_date date not null default current_date,
  base_salary numeric(12,2) not null,
  bonuses_notes text,   -- primes, indemnités, avantages décrits librement en v1
  change_reason text,   -- ex. 'Embauche', 'Augmentation annuelle', 'Promotion'
  created_at timestamptz not null default now()
);

create index if not exists idx_compensation_employee on public.compensation_history(employee_id);

-- ------------------------------------------------------------
-- Documents (métadonnées ; fichiers réels dans Supabase Storage)
-- ------------------------------------------------------------
create type document_type as enum (
  'contrat', 'cv', 'diplome', 'certificat', 'piece_administrative', 'attestation', 'autre'
);

create table if not exists public.employee_documents (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  doc_type document_type not null default 'autre',
  file_name text not null,
  storage_path text not null,
  uploaded_at timestamptz not null default now()
);

create index if not exists idx_documents_employee on public.employee_documents(employee_id);

-- Bucket de stockage privé pour les documents employés
insert into storage.buckets (id, name, public)
values ('employee-documents', 'employee-documents', false)
on conflict (id) do nothing;

-- Bucket public pour les photos de profil (affichage direct sans URL signée)
insert into storage.buckets (id, name, public)
values ('employee-photos', 'employee-photos', true)
on conflict (id) do nothing;

-- ============================================================
-- Row Level Security — nouvelles tables
-- ============================================================
alter table public.sites enable row level security;
alter table public.services enable row level security;
alter table public.employee_contracts enable row level security;
alter table public.compensation_history enable row level security;
alter table public.employee_documents enable row level security;

-- Référentiels : lecture pour tout utilisateur connecté, écriture admin/rh
create policy "sites_read" on public.sites for select using (auth.uid() is not null);
create policy "sites_write" on public.sites for all using (public.current_role_is(array['admin','rh']::app_role[]));

create policy "services_read" on public.services for select using (auth.uid() is not null);
create policy "services_write" on public.services for all using (public.current_role_is(array['admin','rh']::app_role[]));

-- Contrats et rémunération : réservés admin/rh (données sensibles), + lecture par l'employé sur sa propre fiche
create policy "contracts_admin_rh_all" on public.employee_contracts
  for all using (public.current_role_is(array['admin','rh']::app_role[]));
create policy "contracts_self_read" on public.employee_contracts
  for select using (employee_id in (select employee_id from public.profiles where id = auth.uid()));

create policy "compensation_admin_rh_all" on public.compensation_history
  for all using (public.current_role_is(array['admin','rh']::app_role[]));
create policy "compensation_self_read" on public.compensation_history
  for select using (employee_id in (select employee_id from public.profiles where id = auth.uid()));

-- Documents : admin/rh accès complet ; employé lecture de ses propres documents
create policy "documents_admin_rh_all" on public.employee_documents
  for all using (public.current_role_is(array['admin','rh']::app_role[]));
create policy "documents_self_read" on public.employee_documents
  for select using (employee_id in (select employee_id from public.profiles where id = auth.uid()));

-- Stockage : mêmes règles d'accès sur les fichiers du bucket employee-documents
create policy "storage_documents_admin_rh_all" on storage.objects
  for all using (
    bucket_id = 'employee-documents' and public.current_role_is(array['admin','rh']::app_role[])
  );

-- Stockage : photos lisibles par tous (bucket public), écriture réservée admin/rh
create policy "storage_photos_public_read" on storage.objects
  for select using (bucket_id = 'employee-photos');
create policy "storage_photos_admin_rh_write" on storage.objects
  for insert with check (
    bucket_id = 'employee-photos' and public.current_role_is(array['admin','rh']::app_role[])
  );
create policy "storage_photos_admin_rh_update" on storage.objects
  for update using (
    bucket_id = 'employee-photos' and public.current_role_is(array['admin','rh']::app_role[])
  );
create policy "storage_photos_admin_rh_delete" on storage.objects
  for delete using (
    bucket_id = 'employee-photos' and public.current_role_is(array['admin','rh']::app_role[])
  );
