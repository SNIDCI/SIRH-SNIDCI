"use client";

import { useFormState } from "react-dom";
import { createSite, deleteSite } from "@/lib/actions/reference-data";
import { SubmitButton } from "@/components/submit-button";
import { DeleteButton } from "@/components/delete-button";
import type { Site } from "@/lib/types";

export function SitesAdmin({ sites }: { sites: Site[] }) {
  const [state, formAction] = useFormState(createSite, {});

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink">Sites</h1>
      <p className="mt-1 text-sm text-slate">Implantations géographiques de l&apos;entreprise.</p>

      <form action={formAction} className="panel mt-6 flex items-end gap-3 p-4">
        <div className="flex-1">
          <label className="field-label" htmlFor="name">Nom du site</label>
          <input id="name" name="name" required className="field-input" placeholder="Ex. Abidjan — Siège" />
        </div>
        <SubmitButton label="Ajouter" />
      </form>
      {state.error && <p className="mt-2 text-sm text-rose">{state.error}</p>}

      <div className="mt-6 panel divide-y divide-line">
        {sites.map((s) => (
          <div key={s.id} className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-ink">{s.name}</span>
            <DeleteButton
              action={deleteSite.bind(null, s.id)}
              confirmMessage={`Supprimer le site "${s.name}" ?`}
            />
          </div>
        ))}
        {!sites.length && (
          <p className="px-4 py-6 text-center text-sm text-slate">Aucun site pour le moment.</p>
        )}
      </div>
    </div>
  );
}
