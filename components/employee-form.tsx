"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { EmployeeFormState } from "@/lib/actions/employees";
import type { Employee, Department, Position } from "@/lib/types";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary">
      {pending ? "Enregistrement…" : label}
    </button>
  );
}

export function EmployeeForm({
  action,
  employee,
  departments,
  positions,
  managers,
  submitLabel,
}: {
  action: (state: EmployeeFormState, formData: FormData) => Promise<EmployeeFormState>;
  employee?: Partial<Employee>;
  departments: Department[];
  positions: Position[];
  managers: { id: string; first_name: string; last_name: string }[];
  submitLabel: string;
}) {
  const [state, formAction] = useFormState(action, {});

  return (
    <form action={formAction} className="panel space-y-6 p-6">
      {state.error && (
        <p role="alert" className="rounded bg-rose/10 px-3 py-2 text-sm text-rose">
          {state.error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="first_name">Prénom *</label>
          <input
            id="first_name"
            name="first_name"
            required
            defaultValue={employee?.first_name}
            className="field-input"
          />
        </div>
        <div>
          <label className="field-label" htmlFor="last_name">Nom *</label>
          <input
            id="last_name"
            name="last_name"
            required
            defaultValue={employee?.last_name}
            className="field-input"
          />
        </div>
        <div>
          <label className="field-label" htmlFor="work_email">E-mail professionnel</label>
          <input
            id="work_email"
            name="work_email"
            type="email"
            defaultValue={employee?.work_email ?? ""}
            className="field-input"
          />
        </div>
        <div>
          <label className="field-label" htmlFor="phone">Téléphone</label>
          <input
            id="phone"
            name="phone"
            defaultValue={employee?.phone ?? ""}
            className="field-input"
          />
        </div>

        <div>
          <label className="field-label" htmlFor="department_id">Département</label>
          <select
            id="department_id"
            name="department_id"
            defaultValue={employee?.department_id ?? ""}
            className="field-input"
          >
            <option value="">—</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="position_id">Poste</label>
          <select
            id="position_id"
            name="position_id"
            defaultValue={employee?.position_id ?? ""}
            className="field-input"
          >
            <option value="">—</option>
            {positions.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="field-label" htmlFor="manager_id">Manager</label>
          <select
            id="manager_id"
            name="manager_id"
            defaultValue={employee?.manager_id ?? ""}
            className="field-input"
          >
            <option value="">Aucun (sommet de la hiérarchie)</option>
            {managers
              .filter((m) => m.id !== employee?.id)
              .map((m) => (
                <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>
              ))}
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="contract_type">Type de contrat</label>
          <select
            id="contract_type"
            name="contract_type"
            defaultValue={employee?.contract_type ?? "cdi"}
            className="field-input"
          >
            <option value="cdi">CDI</option>
            <option value="cdd">CDD</option>
            <option value="stage">Stage</option>
            <option value="alternance">Alternance</option>
            <option value="freelance">Freelance</option>
          </select>
        </div>

        <div>
          <label className="field-label" htmlFor="hire_date">Date d&apos;entrée</label>
          <input
            id="hire_date"
            name="hire_date"
            type="date"
            defaultValue={employee?.hire_date ?? ""}
            className="field-input"
          />
        </div>
        <div>
          <label className="field-label" htmlFor="status">Statut</label>
          <select
            id="status"
            name="status"
            defaultValue={employee?.status ?? "actif"}
            className="field-input"
          >
            <option value="actif">Actif</option>
            <option value="en_conge">En congé</option>
            <option value="suspendu">Suspendu</option>
            <option value="sorti">Sorti</option>
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="site">Site</label>
          <input
            id="site"
            name="site"
            defaultValue={employee?.site ?? ""}
            className="field-input"
            placeholder="Ex. Abidjan — Siège"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-line pt-4">
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
