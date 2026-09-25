"use client";

import { useState } from "react";

export interface BonusLine {
  label: string;
  amount: string;
}

export function BonusLinesInput({
  initial,
  fieldPrefix = "bonus",
}: {
  initial?: { label: string; amount: number }[];
  fieldPrefix?: string;
}) {
  const [lines, setLines] = useState<BonusLine[]>(
    initial?.length ? initial.map((l) => ({ label: l.label, amount: String(l.amount) })) : []
  );

  function updateLine(i: number, field: "label" | "amount", value: string) {
    setLines((prev) => prev.map((l, idx) => (idx === i ? { ...l, [field]: value } : l)));
  }

  function addLine() {
    setLines((prev) => [...prev, { label: "", amount: "0" }]);
  }

  function removeLine(i: number) {
    setLines((prev) => prev.filter((_, idx) => idx !== i));
  }

  return (
    <div className="space-y-2">
      <label className="field-label">Primes / indemnités / avantages</label>
      {lines.map((line, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            name={`${fieldPrefix}_label`}
            value={line.label}
            onChange={(e) => updateLine(i, "label", e.target.value)}
            placeholder="Ex. Prime de transport, Logement, Retenue CNPS…"
            className="field-input flex-1"
          />
          <input
            name={`${fieldPrefix}_amount`}
            type="number"
            step="0.01"
            value={line.amount}
            onChange={(e) => updateLine(i, "amount", e.target.value)}
            className="field-input w-32"
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
      <button type="button" onClick={addLine} className="btn-secondary text-xs">
        + Ajouter un intitulé
      </button>
      <p className="text-xs text-slate">
        Un montant négatif est possible pour une retenue. Ces lignes apparaîtront automatiquement
        comme suggestion dans le bulletin de paie de l&apos;employé.
      </p>
    </div>
  );
}
