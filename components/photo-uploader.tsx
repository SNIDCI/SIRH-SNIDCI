"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function PhotoUploader({
  employeeId,
  initialUrl,
}: {
  employeeId: string; // "new" si l'employé n'est pas encore créé
  initialUrl?: string | null;
}) {
  const supabase = createClient();
  const [preview, setPreview] = useState<string | null>(initialUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const path = `${employeeId}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("employee-photos")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setError("Échec de l'envoi : " + uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("employee-photos").getPublicUrl(path);
    setPreview(data.publicUrl);
    setUploading(false);
  }

  return (
    <div className="flex items-center gap-4">
      <div className="h-16 w-16 flex-none overflow-hidden rounded-full border border-line bg-canvas">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Photo de l'employé" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-slate">Photo</div>
        )}
      </div>
      <div>
        <label className="btn-secondary cursor-pointer text-xs">
          {uploading ? "Envoi…" : "Choisir une photo"}
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
        </label>
        {error && <p className="mt-1 text-xs text-rose">{error}</p>}
      </div>
      {/* Champ caché transmis au formulaire parent lors de la soumission */}
      <input type="hidden" name="photo_url" value={preview ?? ""} />
    </div>
  );
}
