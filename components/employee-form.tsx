"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { EmployeeFormState } from "@/lib/actions/employees";
import type { Employee, Department, Position, Service, Site } from "@/lib/types";
import { PhotoUploader } from "@/components/photo-uploader";
import { BonusLinesInput } from "@/components/bonus-lines-input";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary">
      {pending ? "Enregistrement…" : label}
    </button>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="font-serif text-base text-ink">{children}</h3>;
}

export function EmployeeForm({
  action,
  employee,
  departments,
  positions,
  services,
  sites,
  managers,
  submitLabel,
}: {
  action: (state: EmployeeFormState, formData: FormData) => Promise<EmployeeFormState>;
  employee?: Partial<Employee>;
  departments: Department[];
  positions: Position[];
  services: Service[];
  sites: Site[];
  managers: { id: string; first_name: string; last_name: string }[];
  submitLabel: string;
}) {
  const [state, formAction] = useFormState(action, {});
  const filteredServices = services; // tous affichés ; on pourrait filtrer par département sélectionné plus tard

  return (
    <form action={formAction} className="panel space-y-8 p-6">
      {state.error && (
        <p role="alert" className="rounded bg-rose/10 px-3 py-2 text-sm text-rose">
          {state.error}
        </p>
      )}

      {/* ---------- IDENTITÉ ---------- */}
      <section className="space-y-4">
        <SectionTitle>Identité</SectionTitle>

        <PhotoUploader employeeId={employee?.id ?? "new"} initialUrl={employee?.photo_url} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="field-label" htmlFor="last_name">Nom *</label>
            <input id="last_name" name="last_name" required defaultValue={employee?.last_name} className="field-input" />
          </div>
          <div>
            <label className="field-label" htmlFor="first_name">Prénom(s) *</label>
            <input id="first_name" name="first_name" required defaultValue={employee?.first_name} className="field-input" />
          </div>
          <div>
            <label className="field-label" htmlFor="birth_date">Date de naissance</label>
            <input id="birth_date" name="birth_date" type="date" defaultValue={employee?.birth_date ?? ""} className="field-input" />
          </div>
          <div>
            <label className="field-label" htmlFor="birth_place">Lieu de naissance</label>
            <input id="birth_place" name="birth_place" defaultValue={employee?.birth_place ?? ""} className="field-input" />
          </div>
          <div>
            <label className="field-label" htmlFor="nationality">Nationalité</label>
            <input id="nationality" name="nationality" defaultValue={employee?.nationality ?? ""} className="field-input" placeholder="Ex. Ivoirienne" />
          </div>
          <div>
            <label className="field-label" htmlFor="gender">Sexe</label>
            <select id="gender" name="gender" defaultValue={employee?.gender ?? ""} className="field-input">
              <option value="">—</option>
              <option value="homme">Homme</option>
              <option value="femme">Femme</option>
              <option value="autre">Autre</option>
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="marital_status">Situation matrimoniale</label>
            <select id="marital_status" name="marital_status" defaultValue={employee?.marital_status ?? ""} className="field-input">
              <option value="">—</option>
              <option value="celibataire">Célibataire</option>
              <option value="marie">Marié(e)</option>
              <option value="divorce">Divorcé(e)</option>
              <option value="veuf">Veuf/Veuve</option>
              <option value="union_libre">Union libre</option>
            </select>
          </div>
        </div>
      </section>

      {/* ---------- CONTACTS ---------- */}
      <section className="space-y-4 border-t border-line pt-6">
        <SectionTitle>Contacts</SectionTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="field-label" htmlFor="work_email">E-mail professionnel</label>
            <input id="work_email" name="work_email" type="email" defaultValue={employee?.work_email ?? ""} className="field-input" />
          </div>
          <div>
            <label className="field-label" htmlFor="personal_email">E-mail personnel</label>
            <input id="personal_email" name="personal_email" type="email" defaultValue={employee?.personal_email ?? ""} className="field-input" />
          </div>
          <div>
            <label className="field-label" htmlFor="phone_primary">Téléphone principal</label>
            <input id="phone_primary" name="phone_primary" defaultValue={employee?.phone_primary ?? ""} className="field-input" />
          </div>
          <div>
            <label className="field-label" htmlFor="phone_secondary">Téléphone secondaire</label>
            <input id="phone_secondary" name="phone_secondary" defaultValue={employee?.phone_secondary ?? ""} className="field-input" />
          </div>
          <div className="sm:col-span-2">
            <label className="field-label" htmlFor="address">Adresse</label>
            <input id="address" name="address" defaultValue={employee?.address ?? ""} className="field-input" />
          </div>
        </div>

        <div className="mt-2 rounded border border-line bg-canvas/50 p-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate">
            Personne à contacter en cas d&apos;urgence
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="field-label" htmlFor="emergency_contact_name">Nom</label>
              <input id="emergency_contact_name" name="emergency_contact_name" defaultValue={employee?.emergency_contact_name ?? ""} className="field-input" />
            </div>
            <div>
              <label className="field-label" htmlFor="emergency_contact_relation">Lien</label>
              <input id="emergency_contact_relation" name="emergency_contact_relation" defaultValue={employee?.emergency_contact_relation ?? ""} className="field-input" placeholder="Ex. Conjoint(e), parent…" />
            </div>
            <div>
              <label className="field-label" htmlFor="emergency_contact_phone">Téléphone</label>
              <input id="emergency_contact_phone" name="emergency_contact_phone" defaultValue={employee?.emergency_contact_phone ?? ""} className="field-input" />
            </div>
          </div>
        </div>
      </section>

      {/* ---------- INFORMATIONS PROFESSIONNELLES ---------- */}
      <section className="space-y-4 border-t border-line pt-6">
        <SectionTitle>Informations professionnelles</SectionTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="field-label" htmlFor="department_id">Département</label>
            <select id="department_id" name="department_id" defaultValue={employee?.department_id ?? ""} className="field-input">
              <option value="">—</option>
              {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            {!departments.length && (
              <p className="mt-1 text-xs text-amber">
                Aucun département créé — ajoute-les d&apos;abord dans Administration → Départements.
              </p>
            )}
          </div>
          <div>
            <label className="field-label" htmlFor="service_id">Service</label>
            <select id="service_id" name="service_id" defaultValue={employee?.service_id ?? ""} className="field-input">
              <option value="">—</option>
              {filteredServices.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="position_id">Poste</label>
            <select id="position_id" name="position_id" defaultValue={employee?.position_id ?? ""} className="field-input">
              <option value="">—</option>
              {positions.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="manager_id">Responsable hiérarchique</label>
            <select id="manager_id" name="manager_id" defaultValue={employee?.manager_id ?? ""} className="field-input">
              <option value="">Aucun (sommet de la hiérarchie)</option>
              {managers.filter((m) => m.id !== employee?.id).map((m) => (
                <option key={m.id} value={m.id}>{m.last_name} {m.first_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="site_id">Site</label>
            <select id="site_id" name="site_id" defaultValue={employee?.site_id ?? ""} className="field-input">
              <option value="">—</option>
              {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="status">Statut</label>
            <select id="status" name="status" defaultValue={employee?.status ?? "actif"} className="field-input">
              <option value="actif">Actif</option>
              <option value="en_conge">En congé</option>
              <option value="suspendu">Suspendu</option>
              <option value="sorti">Sorti</option>
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="contract_type">Type de contrat</label>
            <select id="contract_type" name="contract_type" defaultValue={employee?.contract_type ?? "cdi"} className="field-input">
              <option value="cdi">CDI</option>
              <option value="cdd">CDD</option>
              <option value="stage">Stage</option>
              <option value="alternance">Alternance</option>
              <option value="interim">Intérim</option>
              <option value="freelance">Freelance</option>
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="hire_date">Date d&apos;entrée</label>
            <input id="hire_date" name="hire_date" type="date" defaultValue={employee?.hire_date ?? ""} className="field-input" />
          </div>
          <div>
            <label className="field-label" htmlFor="trial_period_end">Fin de période d&apos;essai</label>
            <input id="trial_period_end" name="trial_period_end" type="date" defaultValue={employee?.trial_period_end ?? ""} className="field-input" />
          </div>
        </div>
        <p className="text-xs text-slate">
          Les intitulés (départements, services, postes, sites) se gèrent dans{" "}
          <span className="font-medium">Administration</span>, dans le menu du haut — ils apparaîtront
          ensuite automatiquement dans ces listes déroulantes.
        </p>
      </section>

      {/* ---------- RÉMUNÉRATION INITIALE (à la création uniquement) ---------- */}
      {!employee?.id && (
        <section className="space-y-4 border-t border-line pt-6">
          <SectionTitle>Rémunération initiale</SectionTitle>
          <p className="text-xs text-slate">
            Facultatif — renseigne-la maintenant si tu la connais déjà, ou ajoute-la plus tard
            depuis l&apos;onglet Rémunération de la fiche employé.
          </p>
          <div>
            <label className="field-label" htmlFor="initial_base_salary">Salaire de base</label>
            <input
              id="initial_base_salary"
              name="initial_base_salary"
              type="number"
              min="0"
              step="0.01"
              className="field-input max-w-xs"
            />
          </div>
          <BonusLinesInput fieldPrefix="initial_bonus" />
        </section>
      )}

      <div className="flex justify-end gap-3 border-t border-line pt-6">
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
