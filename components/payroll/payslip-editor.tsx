"use client";

import { useState, useTransition } from "react";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { savePayslip, generatePayslipPdf } from "@/lib/actions/payroll";
import { SubmitButton } from "@/components/submit-button";
import type { PayslipLine } from "@/lib/types";

export function PayslipEditor({
  payRunId,
  employeeId,
  employeeName,
  initialLines,
  netSalary,
  pdfUrl,
}: {
  payRunId: string;
  employeeId: string;
  employeeName: string;
  initialLines: PayslipLine[];
  netSalary: number;
  pdfUrl: string | null;
}) {
  const router = useRouter();
  const action = savePayslip.bind(null, payRunId, employeeId);
  const [state, formAction] = useFormState(action, {});
  const [lines, setLines] = useState<PayslipLine[]>(
    initialLines.length ? initialLines : [{ label: "Salaire de base", amount: 0 }]
  );
  const [isPending, startTransition] = useTransition();
  const [genError, setGenError] = useState<string | null>(null);

  const total = lines.reduce((sum, l) => sum + (Number(l.amount) || 0), 0);

  function updateLine(i: number, field: "label" | "amount", value: string) {
    setLines((prev) =>
      prev.map((l, idx) => (idx === i ? { ...l, [field]: field === "amount" ? Number(value) : value } : l))
    );
  }

  function addLine() {
    setLines((prev) => [...prev, { label: "", amount: 0 }]);
  }

  function removeLine(i: number) {
    setLines((prev) => prev.filter((_, idx) => idx !== i));
  }

  function handleGenerate() {
    setGenError(null);
    startTransition(async () => {
      const result = await generatePayslipPdf(payRunId, employeeId);
      if (result?.error) setGenError(result.error);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <form action={formAction} className="panel space-y-4 p-5">
        <p className="font-serif text-base text-ink">Bulletin — {employeeName}</p>
        {state.error && <p className="text-sm text-rose">{state.error}</p>}

        <div className="space-y-2">
          {lines.map((line, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                name="line_label"
                value={line.label}
                onChange={(e) => updateLine(i, "label", e.target.value)}
                placeholder="Ex. Salaire de base, Prime de transport, Retenue CNPS…"
                className="field-input flex-1"
              />
              <input
                name="line_amount"
                type="number"
                step="0.01"
                value={line.amount}
                onChange={(e) => updateLine(i, "amount", e.target.value)}
                className="field-input w-36"
              />
              <button
                type="button"
                onClick={() => removeLine(i)}
                className="text-xs text-rose hover:underline"
                aria-label="Supprimer la ligne"
              >
                Retirer
              </button>
            </div>
          ))}
        </div>

        <button type="button" onClick={addLine} className="btn-secondary text-xs">
          + Ajouter une ligne
        </button>

        <p className="text-xs text-slate">
          Utilise un montant négatif pour une retenue (ex. Retenue CNPS : -12 500).
        </p>

        <div className="flex items-center justify-between border-t border-line pt-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate">Net à payer (calculé)</p>
            <p className="font-serif text-xl text-ink">
              {total.toLocaleString("fr-FR")} F
            </p>
          </div>
          <SubmitButton label="Enregistrer le bulletin" />
        </div>
      </form>

      <div className="panel space-y-3 p-5">
        <p className="font-serif text-base text-ink">Bulletin PDF</p>
        {genError && <p className="text-sm text-rose">{genError}</p>}

        {netSalary > 0 || initialLines.length ? (
          <div className="flex items-center gap-3">
            <button onClick={handleGenerate} disabled={isPending} className="btn-primary">
              {isPending ? "Génération…" : pdfUrl ? "Régénérer le PDF" : "Générer le PDF"}
            </button>
            {pdfUrl && (
              <a href={pdfUrl} target="_blank" rel="noreferrer" className="text-sm text-accent hover:underline">
                Télécharger le bulletin actuel
              </a>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate">
            Enregistre d&apos;abord le bulletin ci-dessus, puis génère le PDF.
          </p>
        )}
      </div>
    </div>
  );
}
