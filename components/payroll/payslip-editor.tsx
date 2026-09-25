"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { savePayslip, generatePayslipPdf } from "@/lib/actions/payroll";
import type { PayslipLine } from "@/lib/types";

// État local d'édition : le montant reste une chaîne tant qu'on édite, pour ne
// pas perdre le signe "-" ou un champ vide pendant la saisie (contrairement à
// une conversion Number() à chaque frappe, qui casse la saisie d'un négatif).
interface EditableLine {
  label: string;
  amount: string;
}

function toEditable(lines: PayslipLine[]): EditableLine[] {
  return lines.map((l) => ({ label: l.label, amount: String(l.amount) }));
}

export function PayslipEditor({
  payRunId,
  employeeId,
  employeeName,
  initialLines,
  netSalary,
  pdfUrl,
  alreadySaved,
  suggestedLines,
}: {
  payRunId: string;
  employeeId: string;
  employeeName: string;
  initialLines: PayslipLine[];
  netSalary: number;
  pdfUrl: string | null;
  alreadySaved: boolean;
  suggestedLines: PayslipLine[];
}) {
  const router = useRouter();
  const action = savePayslip.bind(null, payRunId, employeeId);
  const [state, formAction] = useFormState(action, {});

  const [lines, setLines] = useState<EditableLine[]>(() =>
    initialLines.length
      ? toEditable(initialLines)
      : suggestedLines.length
        ? toEditable(suggestedLines)
        : [{ label: "Salaire de base", amount: "0" }]
  );
  const [saved, setSaved] = useState(alreadySaved);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (!state.error) setSaved(true);
  }, [state]);

  const [isPending, startTransition] = useTransition();
  const [genError, setGenError] = useState<string | null>(null);

  const total = lines.reduce((sum, l) => sum + (parseFloat(l.amount) || 0), 0);

  function updateLine(i: number, field: "label" | "amount", value: string) {
    setSaved(false);
    setLines((prev) => prev.map((l, idx) => (idx === i ? { ...l, [field]: value } : l)));
  }

  function addLine() {
    setSaved(false);
    setLines((prev) => [...prev, { label: "", amount: "0" }]);
  }

  function removeLine(i: number) {
    setSaved(false);
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

        {!initialLines.length && suggestedLines.length > 0 && (
          <p className="rounded bg-accent-soft px-3 py-2 text-xs text-accent-dark">
            Pré-rempli à partir du dernier enregistrement de l&apos;onglet Rémunération de
            l&apos;employé — vérifie et ajuste si besoin avant d&apos;enregistrer.
          </p>
        )}

        <div className="space-y-2">
          {lines.map((line, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                name="line_label"
                value={line.label}
                onChange={(e) => updateLine(i, "label", e.target.value)}
                disabled={saved}
                placeholder="Ex. Salaire de base, Prime de transport, Retenue CNPS…"
                className="field-input flex-1 disabled:opacity-60"
              />
              <input
                name="line_amount"
                type="number"
                step="0.01"
                value={line.amount}
                onChange={(e) => updateLine(i, "amount", e.target.value)}
                disabled={saved}
                className="field-input w-36 disabled:opacity-60"
              />
              {!saved && (
                <button
                  type="button"
                  onClick={() => removeLine(i)}
                  className="text-xs text-rose hover:underline"
                  aria-label="Supprimer la ligne"
                >
                  Retirer
                </button>
              )}
            </div>
          ))}
        </div>

        {!saved && (
          <button type="button" onClick={addLine} className="btn-secondary text-xs">
            + Ajouter une ligne
          </button>
        )}

        <p className="text-xs text-slate">
          Utilise un montant négatif pour une retenue (ex. Retenue CNPS : -12500).
        </p>

        <div className="flex items-center justify-between border-t border-line pt-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate">Net à payer (calculé)</p>
            <p className="font-serif text-xl text-ink">{total.toLocaleString("fr-FR")} F</p>
          </div>

          {saved ? (
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-sm font-medium text-accent-dark">
                ✓ Enregistré
              </span>
              <button type="button" onClick={() => setSaved(false)} className="btn-secondary text-sm">
                Modifier
              </button>
            </div>
          ) : (
            <button type="submit" className="btn-primary">Enregistrer le bulletin</button>
          )}
        </div>
      </form>

      <div className="panel space-y-3 p-5">
        <p className="font-serif text-base text-ink">Bulletin PDF</p>
        {genError && <p className="text-sm text-rose">{genError}</p>}

        {netSalary !== 0 || initialLines.length ? (
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
