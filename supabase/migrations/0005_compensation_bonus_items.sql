-- ============================================================
-- SIRH — Migration 0005 : lignes de primes/avantages structurées
-- ============================================================

alter table public.compensation_history
  add column if not exists bonus_items jsonb not null default '[]';
  -- [{ "label": "Prime de transport", "amount": 25000 }, ...]

comment on column public.compensation_history.bonus_items is
  'Primes/indemnités/avantages sous forme de lignes structurées (intitulé + montant), reprises automatiquement dans le module Paie.';

comment on column public.compensation_history.bonuses_notes is
  'Ancien champ texte libre, conservé pour compatibilité — remplacé par bonus_items.';
