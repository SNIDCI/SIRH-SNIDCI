export type AppRole = "admin" | "rh" | "manager" | "employe";
export type EmployeeStatus = "actif" | "en_conge" | "suspendu" | "sorti";
export type ContractType = "cdi" | "cdd" | "stage" | "alternance" | "freelance";

export interface Department {
  id: string;
  name: string;
}

export interface Position {
  id: string;
  title: string;
  department_id?: string | null;
}

export interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  personal_email: string | null;
  work_email: string | null;
  phone: string | null;
  birth_date: string | null;
  position_id: string | null;
  department_id: string | null;
  manager_id: string | null;
  contract_type: ContractType;
  hire_date: string;
  end_date: string | null;
  status: EmployeeStatus;
  site: string | null;
  country: string | null;
  created_at: string;
  updated_at: string;
  // relations enrichies côté requête (jointures)
  position?: Position | null;
  department?: Department | null;
  manager?: Pick<Employee, "id" | "first_name" | "last_name"> | null;
}

// Placeholder minimal — à régénérer avec `supabase gen types typescript`
// une fois le projet Supabase créé, pour un typage complet et automatique.
export type Database = any;
