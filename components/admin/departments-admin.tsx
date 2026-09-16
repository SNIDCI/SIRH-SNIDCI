"use client";

import { useFormState } from "react-dom";
import { createDepartment, deleteDepartment } from "@/lib/actions/reference-data";
import { SubmitButton } from "@/components/submit-button";
import { DeleteButton } from "@/components/delete-button";
import type { Department } from "@/lib/types";

export function DepartmentsAdmin({ departments }: { departments: Department[] }) {
  const [state, formAction] = useFormState(createDepartment, {});

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink">Départements</h1>
      <p className="mt-1 text-sm text-slate">
        Les grands pôles de l&apos;entreprise (ex. Ressources Humaines, Finance, Technologie).
      </p>

      <form action={formAction} className="panel mt-6 flex items-end gap-3 p-4">
        <div className="flex-1">
          <label className="field-label" htmlFor="name">Nom du département</label>
          <input id="name" name="name" required className="field-input" placeholder="Ex. Technologie" />
        </div>
        <SubmitButton label="Ajouter" />
      </form>
      {state.error && <p className="mt-2 text-sm text-rose">{state.error}</p>}

      <div className="mt-6 panel divide-y divide-line">
        {departments.map((d) => (
          <div key={d.id} className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-ink">{d.name}</span>
            <DeleteButton
              action={deleteDepartment.bind(null, d.id)}
              confirmMessage={`Supprimer le département "${d.name}" ? Les postes et services associés seront aussi affectés.`}
            />
          </div>
        ))}
        {!departments.length && (
          <p className="px-4 py-6 text-center text-sm text-slate">Aucun département pour le moment.</p>
        )}
      </div>
    </div>
  );
}
