export type AppRole = "admin" | "rh" | "manager" | "employe";
export type EmployeeStatus = "actif" | "en_conge" | "suspendu" | "sorti";
export type ContractType = "cdi" | "cdd" | "stage" | "alternance" | "freelance" | "interim";
export type Gender = "homme" | "femme" | "autre";
export type MaritalStatus = "celibataire" | "marie" | "divorce" | "veuf" | "union_libre";
export type DocumentType =
  | "contrat" | "cv" | "diplome" | "certificat" | "piece_administrative" | "attestation" | "autre";

export interface Department {
  id: string;
  name: string;
}

export interface Service {
  id: string;
  name: string;
  department_id: string | null;
}

export interface Position {
  id: string;
  title: string;
  department_id?: string | null;
}

export interface Site {
  id: string;
  name: string;
}

export interface Employee {
  id: string;
  // Identité
  first_name: string;
  last_name: string;
  photo_url: string | null;
  birth_date: string | null;
  birth_place: string | null;
  nationality: string | null;
  gender: Gender | null;
  marital_status: MaritalStatus | null;
  personal_email: string | null;
  work_email: string | null;
  phone_primary: string | null;
  phone_secondary: string | null;
  address: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  emergency_contact_relation: string | null;

  // Informations professionnelles
  position_id: string | null;
  department_id: string | null;
  service_id: string | null;
  site_id: string | null;
  manager_id: string | null;
  contract_type: ContractType;
  hire_date: string;
  end_date: string | null;
  trial_period_end: string | null;
  status: EmployeeStatus;
  country: string | null;

  created_at: string;
  updated_at: string;

  // relations enrichies côté requête (jointures)
  position?: Position | null;
  department?: Department | null;
  service?: Service | null;
  site?: Site | null;
  manager?: Pick<Employee, "id" | "first_name" | "last_name"> | null;
}

export interface EmployeeContract {
  id: string;
  employee_id: string;
  contract_type: ContractType;
  start_date: string;
  end_date: string | null;
  trial_period_end: string | null;
  is_renewal: boolean;
  notes: string | null;
  created_at: string;
}

export interface CompensationEntry {
  id: string;
  employee_id: string;
  effective_date: string;
  base_salary: number;
  bonuses_notes: string | null;
  change_reason: string | null;
  created_at: string;
}

export interface EmployeeDocument {
  id: string;
  employee_id: string;
  doc_type: DocumentType;
  file_name: string;
  storage_path: string;
  uploaded_at: string;
}

export type PayRunStatus = "brouillon" | "valide";

export interface PayslipLine {
  label: string;
  amount: number;
}

export interface PayRun {
  id: string;
  period_label: string;
  period_month: string;
  status: PayRunStatus;
  created_at: string;
}

export interface Payslip {
  id: string;
  pay_run_id: string;
  employee_id: string;
  lines: PayslipLine[];
  net_salary: number;
  pdf_path: string | null;
  generated_at: string | null;
  created_at: string;
  updated_at: string;
}

// Placeholder minimal — à régénérer avec `supabase gen types typescript`
// une fois le projet Supabase créé, pour un typage complet et automatique.
export type Database = any;
