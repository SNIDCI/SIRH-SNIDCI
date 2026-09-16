"use client";

import { useFormState } from "react-dom";
import { createPosition, deletePosition } from "@/lib/actions/reference-data";
import { SubmitButton } from "@/components/submit-button";
import { DeleteButton } from "@/components/delete-button";
import type { Department, Position } from "@/lib/types";

export function PositionsAdmin({
  positions,
  departments,
}: {
  positions: (Position & { department: Department | null })[];
  departments: Department[];
}) {
  const [state, formAction] = useFormState(createPosition, {});

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink">Postes</h1>
      <p className="mt-1 text-sm text-slate">
        Intitulés de poste précis, rattachés à un département (ex. &quot;Chargé(e) de recrutement&quot;).
      </p>

      <form action={formAction} className="panel mt-6 flex items-end gap-3 p-4">
        <div className="flex-1">
          <label className="field-label" htmlFor="title">Intitulé du poste</label>
          <input id="title" name="title" required className="field-input" placeholder="Ex. Chargé(e) de recrutement" />
        </div>
        <div className="flex-1">
          <label className="field-label" htmlFor="department_id">Département</label>
          <select id="department_id" name="department_id" className="field-input">
            <option value="">—</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        <SubmitButton label="Ajouter" />
      </form>
      {state.error && <p className="mt-2 text-sm text-rose">{state.error}</p>}

      <div className="mt-6 panel divide-y divide-line">
        {positions.map((p) => (
          <div key={p.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <span className="text-sm text-ink">{p.title}</span>
              <span className="ml-2 text-xs text-slate">{p.department?.name ?? "—"}</span>
            </div>
            <DeleteButton
              action={deletePosition.bind(null, p.id)}
              confirmMessage={`Supprimer le poste "${p.title}" ?`}
            />
          </div>
        ))}
        {!positions.length && (
          <p className="px-4 py-6 text-center text-sm text-slate">Aucun poste pour le moment.</p>
        )}
      </div>
    </div>
  );
}
