-- Données de démonstration — à exécuter après la migration, en environnement de test uniquement.

insert into public.departments (name) values
  ('Direction Générale'), ('Ressources Humaines'), ('Finance'),
  ('Technologie'), ('Commercial'), ('Opérations')
on conflict (name) do nothing;

insert into public.positions (title, department_id)
select p.title, d.id from (values
  ('Directeur Général', 'Direction Générale'),
  ('Directeur RH', 'Ressources Humaines'),
  ('Chargé(e) de recrutement', 'Ressources Humaines'),
  ('Directeur Financier', 'Finance'),
  ('Comptable', 'Finance'),
  ('Directeur Technique', 'Technologie'),
  ('Développeur(se)', 'Technologie'),
  ('Responsable Commercial', 'Commercial'),
  ('Chargé(e) d''Opérations', 'Opérations')
) as p(title, dept_name)
join public.departments d on d.name = p.dept_name;

-- Quelques employés avec hiérarchie (DG -> Directeurs -> équipes)
with dg as (
  insert into public.employees (first_name, last_name, work_email, position_id, department_id, hire_date)
  select 'Aïcha', 'Koné', 'a.kone@entreprise.com', pos.id, pos.department_id, '2018-01-15'
  from public.positions pos where pos.title = 'Directeur Général'
  returning id
),
drh as (
  insert into public.employees (first_name, last_name, work_email, position_id, department_id, manager_id, hire_date)
  select 'Yves', 'Traoré', 'y.traore@entreprise.com', pos.id, pos.department_id, dg.id, '2019-03-01'
  from public.positions pos, dg where pos.title = 'Directeur RH'
  returning id
)
insert into public.employees (first_name, last_name, work_email, position_id, department_id, manager_id, hire_date)
select 'Fatou', 'Diabaté', 'f.diabate@entreprise.com', pos.id, pos.department_id, drh.id, '2021-06-10'
from public.positions pos, drh where pos.title = 'Chargé(e) de recrutement';
