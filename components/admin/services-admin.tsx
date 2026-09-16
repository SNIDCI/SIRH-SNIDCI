"use client";

import { useFormState } from "react-dom";
import { createService, deleteService } from "@/lib/actions/reference-data";
import { SubmitButton } from "@/components/submit-button";
import { DeleteButton } from "@/components/delete-button";
import type { Department, Service } from "@/lib/types";

export function ServicesAdmin({
  services,
  departments,
}: {
  services: (Service & { department: Department | null })[];
  departments: Department[];
}) {
  const [state, formAction] = useFormState(createService, {});

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink">Services</h1>
      <p className="mt-1 text-sm text-slate">
        Sous-divisions à l&apos;intérieur d&apos;un département (ex. &quot;Recrutement&quot; dans le
        département Ressources Humaines).
      </p>

      <form action={formAction} className="panel mt-6 flex items-end gap-3 p-4">
        <div className="flex-1">
          <label className="field-label" htmlFor="name">Nom du service</label>
          <input id="name" name="name" required className="field-input" placeholder="Ex. Recrutement" />
        </div>
        <div className="flex-1">
          <label className="field-label" htmlFor="department_id">Département</label>
          <select id="department_id" name="department_id" required className="field-input">
            <option value="">Choisir…</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        <SubmitButton label="Ajouter" />
      </form>
      {state.error && <p className="mt-2 text-sm text-rose">{state.error}</p>}

      <div className="mt-6 panel divide-y divide-line">
        {services.map((s) => (
          <div key={s.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <span className="text-sm text-ink">{s.name}</span>
              <span className="ml-2 text-xs text-slate">{s.department?.name ?? "—"}</span>
            </div>
            <DeleteButton
              action={deleteService.bind(null, s.id)}
              confirmMessage={`Supprimer le service "${s.name}" ?`}
            />
          </div>
        ))}
        {!services.length && (
          <p className="px-4 py-6 text-center text-sm text-slate">Aucun service pour le moment.</p>
        )}
      </div>
    </div>
  );
}
