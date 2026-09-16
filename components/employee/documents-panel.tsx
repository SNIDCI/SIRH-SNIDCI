"use client";

import { useFormState } from "react-dom";
import { uploadDocument, deleteDocument } from "@/lib/actions/documents";
import { SubmitButton } from "@/components/submit-button";
import { DeleteButton } from "@/components/delete-button";
import type { EmployeeDocument } from "@/lib/types";

const DOC_LABELS: Record<string, string> = {
  contrat: "Contrat", cv: "CV", diplome: "Diplôme", certificat: "Certificat",
  piece_administrative: "Pièce administrative", attestation: "Attestation", autre: "Autre",
};

export function DocumentsPanel({
  employeeId,
  documents,
}: {
  employeeId: string;
  documents: (EmployeeDocument & { url: string | null })[];
}) {
  const action = uploadDocument.bind(null, employeeId);
  const [state, formAction] = useFormState(action, {});

  return (
    <div className="space-y-6">
      <form action={formAction} className="panel space-y-4 p-5">
        <p className="font-serif text-base text-ink">Ajouter un document</p>
        {state.error && <p className="text-sm text-rose">{state.error}</p>}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="field-label" htmlFor="doc_type">Type de document</label>
            <select id="doc_type" name="doc_type" defaultValue="autre" className="field-input">
              {Object.entries(DOC_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="file">Fichier</label>
            <input id="file" name="file" type="file" required className="field-input file:mr-3 file:rounded file:border-0 file:bg-accent-soft file:px-3 file:py-1 file:text-accent-dark" />
          </div>
        </div>
        <div className="flex justify-end">
          <SubmitButton label="Envoyer" />
        </div>
      </form>

      <div className="panel divide-y divide-line">
        {documents.length ? (
          documents.map((d) => (
            <div key={d.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <div>
                <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent-dark">
                  {DOC_LABELS[d.doc_type] ?? d.doc_type}
                </span>
                <span className="ml-2 text-ink">{d.file_name}</span>
                <p className="text-xs text-slate">{new Date(d.uploaded_at).toLocaleDateString("fr-FR")}</p>
              </div>
              <div className="flex items-center gap-3">
                {d.url && (
                  <a href={d.url} target="_blank" rel="noreferrer" className="text-xs text-accent hover:underline">
                    Télécharger
                  </a>
                )}
                <DeleteButton
                  action={deleteDocument.bind(null, employeeId, d.id, d.storage_path)}
                  confirmMessage={`Supprimer le document "${d.file_name}" ?`}
                />
              </div>
            </div>
          ))
        ) : (
          <p className="px-4 py-6 text-center text-sm text-slate">Aucun document envoyé.</p>
        )}
      </div>
    </div>
  );
}
