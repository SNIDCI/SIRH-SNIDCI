"use client";

import { useFormState } from "react-dom";
import { createContract } from "@/lib/actions/contracts";
import { SubmitButton } from "@/components/submit-button";
import type { EmployeeContract } from "@/lib/types";

const CONTRACT_LABELS: Record<string, string> = {
  cdi: "CDI", cdd: "CDD", stage: "Stage", alternance: "Alternance", interim: "Intérim", freelance: "Freelance",
};

export function ContractsPanel({ employeeId, contracts }: { employeeId: string; contracts: EmployeeContract[] }) {
  const action = createContract.bind(null, employeeId);
  const [state, formAction] = useFormState(action, {});

  return (
    <div className="space-y-6">
      <form action={formAction} className="panel space-y-4 p-5">
        <p className="font-serif text-base text-ink">Ajouter un contrat</p>
        {state.error && <p className="text-sm text-rose">{state.error}</p>}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="field-label" htmlFor="c_type">Type de contrat</label>
            <select id="c_type" name="contract_type" defaultValue="cdi" className="field-input">
              {Object.entries(CONTRACT_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div className="flex items-end gap-2 pb-2">
            <input id="is_renewal" name="is_renewal" type="checkbox" className="h-4 w-4" />
            <label htmlFor="is_renewal" className="text-sm text-ink">Il s&apos;agit d&apos;un renouvellement</label>
          </div>
          <div>
            <label className="field-label" htmlFor="start_date">Date de début *</label>
            <input id="start_date" name="start_date" type="date" required className="field-input" />
          </div>
          <div>
            <label className="field-label" htmlFor="end_date">Date de fin</label>
            <input id="end_date" name="end_date" type="date" className="field-input" />
          </div>
          <div>
            <label className="field-label" htmlFor="trial_period_end">Fin de période d&apos;essai</label>
            <input id="trial_period_end" name="trial_period_end" type="date" className="field-input" />
          </div>
        </div>
        <div>
          <label className="field-label" htmlFor="notes">Notes</label>
          <textarea id="notes" name="notes" rows={2} className="field-input" />
        </div>
        <div className="flex justify-end">
          <SubmitButton label="Ajouter le contrat" />
        </div>
      </form>

      <div className="panel divide-y divide-line">
        {contracts.length ? (
          contracts.map((c) => (
            <div key={c.id} className="px-4 py-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium text-ink">
                  {CONTRACT_LABELS[c.contract_type] ?? c.contract_type}
                  {c.is_renewal && <span className="ml-2 text-xs text-accent">Renouvellement</span>}
                </span>
                <span className="text-xs text-slate">
                  {new Date(c.start_date).toLocaleDateString("fr-FR")}
                  {c.end_date ? ` → ${new Date(c.end_date).toLocaleDateString("fr-FR")}` : " → en cours"}
                </span>
              </div>
              {c.notes && <p className="mt-1 text-slate">{c.notes}</p>}
            </div>
          ))
        ) : (
          <p className="px-4 py-6 text-center text-sm text-slate">Aucun contrat enregistré.</p>
        )}
      </div>
    </div>
  );
}
