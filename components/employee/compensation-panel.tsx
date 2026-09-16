"use client";

import { useFormState } from "react-dom";
import { createCompensationEntry } from "@/lib/actions/compensation";
import { SubmitButton } from "@/components/submit-button";
import type { CompensationEntry } from "@/lib/types";

export function CompensationPanel({
  employeeId,
  entries,
}: {
  employeeId: string;
  entries: CompensationEntry[];
}) {
  const action = createCompensationEntry.bind(null, employeeId);
  const [state, formAction] = useFormState(action, {});

  return (
    <div className="space-y-6">
      <p className="text-xs text-slate">
        Cet espace garde un historique de référence (salaire de base, primes, changements). Le calcul et
        l&apos;émission des bulletins de paie resteront gérés par le futur module Paie / logiciel externe.
      </p>

      <form action={formAction} className="panel space-y-4 p-5">
        <p className="font-serif text-base text-ink">Ajouter une entrée</p>
        {state.error && <p className="text-sm text-rose">{state.error}</p>}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="field-label" htmlFor="effective_date">Date d&apos;effet *</label>
            <input id="effective_date" name="effective_date" type="date" required className="field-input" />
          </div>
          <div>
            <label className="field-label" htmlFor="base_salary">Salaire de base *</label>
            <input id="base_salary" name="base_salary" type="number" min="0" step="0.01" required className="field-input" />
          </div>
          <div>
            <label className="field-label" htmlFor="change_reason">Motif</label>
            <input id="change_reason" name="change_reason" className="field-input" placeholder="Ex. Embauche, augmentation annuelle…" />
          </div>
        </div>
        <div>
          <label className="field-label" htmlFor="bonuses_notes">Primes / indemnités / avantages</label>
          <textarea id="bonuses_notes" name="bonuses_notes" rows={2} className="field-input" placeholder="Ex. Prime de transport 25 000 F, logement pris en charge…" />
        </div>
        <div className="flex justify-end">
          <SubmitButton label="Ajouter l'entrée" />
        </div>
      </form>

      <div className="panel divide-y divide-line">
        {entries.length ? (
          entries.map((e) => (
            <div key={e.id} className="px-4 py-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium text-ink">
                  {e.base_salary.toLocaleString("fr-FR")} {" "}
                  <span className="text-xs font-normal text-slate">{e.change_reason ?? ""}</span>
                </span>
                <span className="text-xs text-slate">
                  {new Date(e.effective_date).toLocaleDateString("fr-FR")}
                </span>
              </div>
              {e.bonuses_notes && <p className="mt-1 text-slate">{e.bonuses_notes}</p>}
            </div>
          ))
        ) : (
          <p className="px-4 py-6 text-center text-sm text-slate">Aucune entrée enregistrée.</p>
        )}
      </div>
    </div>
  );
}
