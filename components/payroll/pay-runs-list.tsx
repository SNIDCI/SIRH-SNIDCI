"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
import { createPayRun } from "@/lib/actions/payroll";
import { SubmitButton } from "@/components/submit-button";
import type { PayRun } from "@/lib/types";

const STATUS_LABELS: Record<string, string> = { brouillon: "Brouillon", valide: "Validée" };
const STATUS_STYLES: Record<string, string> = {
  brouillon: "bg-amber/15 text-amber",
  valide: "bg-accent-soft text-accent-dark",
};

export function PayRunsList({ payRuns }: { payRuns: PayRun[] }) {
  const [state, formAction] = useFormState(createPayRun, {});

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink">Paie</h1>
      <p className="mt-1 text-sm text-slate">
        Registre des bulletins de paie, mois par mois. Les montants sont saisis manuellement
        à partir de ton calcul existant — l&apos;app ne calcule ni cotisations ni impôts.
      </p>

      <form action={formAction} className="panel mt-6 flex items-end gap-3 p-4">
        <div>
          <label className="field-label" htmlFor="period_month">Nouvelle période</label>
          <input id="period_month" name="period_month" type="month" required className="field-input" />
        </div>
        <SubmitButton label="Créer la période" />
      </form>
      {state.error && <p className="mt-2 text-sm text-rose">{state.error}</p>}

      <div className="mt-6 panel divide-y divide-line">
        {payRuns.map((p) => (
          <Link
            key={p.id}
            href={`/payroll/${p.id}`}
            className="flex items-center justify-between px-4 py-3 hover:bg-canvas/40"
          >
            <span className="text-sm font-medium text-ink">{p.period_label}</span>
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[p.status]}`}>
              {STATUS_LABELS[p.status]}
            </span>
          </Link>
        ))}
        {!payRuns.length && (
          <p className="px-4 py-6 text-center text-sm text-slate">Aucune période de paie créée.</p>
        )}
      </div>
    </div>
  );
}
