-- ============================================================
-- SIRH — Migration 0004 : Module Paie (registre + bulletins)
-- Modèle 1 : aucun calcul légal automatique — les montants sont
-- saisis par la RH à partir de son calcul existant (Excel/comptable).
-- ============================================================

create type pay_run_status as enum ('brouillon', 'valide');

create table if not exists public.pay_runs (
  id uuid primary key default gen_random_uuid(),
  period_label text not null,          -- ex. "Janvier 2026"
  period_month date not null,          -- ex. 2026-01-01, pour le tri
  status pay_run_status not null default 'brouillon',
  created_at timestamptz not null default now(),
  unique (period_month)
);

create table if not exists public.payslips (
  id uuid primary key default gen_random_uuid(),
  pay_run_id uuid not null references public.pay_runs(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete cascade,
  lines jsonb not null default '[]',   -- [{ "label": "Salaire de base", "amount": 250000 }, ...]
  net_salary numeric(12,2) not null default 0,  -- somme des lignes, calculée à l'enregistrement
  pdf_path text,                        -- chemin dans le bucket 'payslips' une fois généré
  generated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (pay_run_id, employee_id)
);

create index if not exists idx_payslips_employee on public.payslips(employee_id);
create index if not exists idx_payslips_pay_run on public.payslips(pay_run_id);

create trigger trg_payslips_updated_at
  before update on public.payslips
  for each row execute function public.set_updated_at();

-- Bucket privé pour les bulletins PDF
insert into storage.buckets (id, name, public)
values ('payslips', 'payslips', false)
on conflict (id) do nothing;

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.pay_runs enable row level security;
alter table public.payslips enable row level security;

create policy "pay_runs_admin_rh_all" on public.pay_runs
  for all using (public.current_role_is(array['admin','rh']::app_role[]));

create policy "payslips_admin_rh_all" on public.payslips
  for all using (public.current_role_is(array['admin','rh']::app_role[]));
create policy "payslips_self_read" on public.payslips
  for select using (employee_id in (select employee_id from public.profiles where id = auth.uid()));

-- Stockage : admin/rh accès complet ; employé lecture de son propre dossier uniquement
create policy "storage_payslips_admin_rh_all" on storage.objects
  for all using (
    bucket_id = 'payslips' and public.current_role_is(array['admin','rh']::app_role[])
  );
create policy "storage_payslips_self_read" on storage.objects
  for select using (
    bucket_id = 'payslips'
    and (storage.foldername(name))[1] in (
      select employee_id::text from public.profiles where id = auth.uid()
    )
  );
