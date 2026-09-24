-- ============================================================
-- SIRH — Migration 0005 : corrections de sécurité et de cohérence
-- À exécuter dans Supabase > SQL Editor APRÈS 0001 → 0004.
-- Idempotente : peut être relancée sans risque.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Durcir la fonction de rôle (security definer SANS search_path fixé
--    = avertissement "Function Search Path Mutable" du linter Supabase :
--    un schéma malveillant pourrait détourner la résolution de "profiles").
-- ------------------------------------------------------------
create or replace function public.current_role_is(roles app_role[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = any(roles)
  );
$$;

-- Petit utilitaire : fiche employé liée à l'utilisateur connecté.
-- security definer : évite que chaque policy relise "profiles" sous RLS.
create or replace function public.current_employee_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select employee_id from public.profiles where id = auth.uid();
$$;

-- ------------------------------------------------------------
-- 2. Profil créé automatiquement à la création d'un compte Auth.
--    Avant : il fallait insérer la ligne "profiles" à la main pour le premier
--    admin, et un compte sans profil voyait une application vide.
-- ------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'full_name', ''), split_part(new.email, '@', 1)),
    new.email,
    'employe'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Rattrapage : crée les profils manquants pour les comptes déjà existants.
insert into public.profiles (id, full_name, email, role)
select u.id, split_part(u.email, '@', 1), u.email, 'employe'
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;

-- Un même employé ne doit pas être relié à deux comptes.
create unique index if not exists uq_profiles_employee_id
  on public.profiles(employee_id) where employee_id is not null;

-- ------------------------------------------------------------
-- 3. Documents : l'employé pouvait lire la LIGNE (table employee_documents)
--    mais pas le FICHIER (storage) → lien de téléchargement toujours absent.
-- ------------------------------------------------------------
drop policy if exists "storage_documents_self_read" on storage.objects;
create policy "storage_documents_self_read" on storage.objects
  for select using (
    bucket_id = 'employee-documents'
    and (storage.foldername(name))[1] = public.current_employee_id()::text
  );

-- ------------------------------------------------------------
-- 4. Bulletins : l'employé ne voit que ceux des périodes VALIDÉES.
--    Fonctions security definer : évitent l'erreur "infinite recursion
--    detected in policy" (payslips → pay_runs → payslips).
-- ------------------------------------------------------------
create or replace function public.pay_run_is_validated(run_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.pay_runs where id = run_id and status = 'valide');
$$;

create or replace function public.employee_has_payslip_in(run_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.payslips
    where pay_run_id = run_id and employee_id = public.current_employee_id()
  );
$$;

drop policy if exists "payslips_self_read" on public.payslips;
create policy "payslips_self_read" on public.payslips
  for select using (
    employee_id = public.current_employee_id()
    and public.pay_run_is_validated(pay_run_id)
  );

-- L'employé doit pouvoir lire le libellé de la période de ses bulletins
-- (sinon la jointure pay_run:pay_runs(...) de "Mes bulletins" revient vide).
drop policy if exists "pay_runs_self_read" on public.pay_runs;
create policy "pay_runs_self_read" on public.pay_runs
  for select using (
    status = 'valide' and public.employee_has_payslip_in(id)
  );

-- ------------------------------------------------------------
-- 5. Verrou en base : aucun bulletin modifiable dans une période validée
--    (protection même si quelqu'un contourne l'interface).
-- ------------------------------------------------------------
create or replace function public.prevent_locked_payslip_change()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  run_id uuid;
begin
  run_id := coalesce(new.pay_run_id, old.pay_run_id);
  if exists (select 1 from public.pay_runs where id = run_id and status = 'valide') then
    raise exception 'Période de paie validée : bulletin non modifiable.';
  end if;
  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_payslips_lock on public.payslips;
create trigger trg_payslips_lock
  before insert or update or delete on public.payslips
  for each row execute function public.prevent_locked_payslip_change();

-- ------------------------------------------------------------
-- 6. Manager : peut lire l'historique de carrière de son équipe directe
--    (cohérent avec employees_manager_read_team).
-- ------------------------------------------------------------
drop policy if exists "history_manager_read_team" on public.employee_history;
create policy "history_manager_read_team" on public.employee_history
  for select using (
    employee_id in (
      select e.id from public.employees e
      where e.manager_id = public.current_employee_id()
    )
  );
