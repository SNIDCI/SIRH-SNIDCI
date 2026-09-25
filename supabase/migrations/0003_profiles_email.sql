-- ============================================================
-- SIRH — Migration 0003 : email sur les profils (affichage)
-- ============================================================

alter table public.profiles
  add column if not exists email text;

comment on column public.profiles.email is
  'Copie de l''email du compte, pour affichage dans Administration > Comptes sans appel API supplémentaire.';
