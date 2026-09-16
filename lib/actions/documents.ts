"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { SimpleFormState } from "@/lib/actions/reference-data";

export async function uploadDocument(
  employeeId: string,
  _prev: SimpleFormState,
  formData: FormData
): Promise<SimpleFormState> {
  const supabase = createClient();
  const file = formData.get("file") as File | null;
  const doc_type = String(formData.get("doc_type") ?? "autre");

  if (!file || file.size === 0) {
    return { error: "Sélectionne un fichier à envoyer." };
  }

  const path = `${employeeId}/${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from("employee-documents")
    .upload(path, file);

  if (uploadError) {
    return { error: "Échec de l'envoi : " + uploadError.message };
  }

  const { error: insertError } = await supabase.from("employee_documents").insert({
    employee_id: employeeId,
    doc_type,
    file_name: file.name,
    storage_path: path,
  });

  if (insertError) {
    return { error: insertError.message };
  }

  revalidatePath(`/employees/${employeeId}`);
  return {};
}

export async function deleteDocument(employeeId: string, documentId: string, storagePath: string) {
  const supabase = createClient();
  await supabase.storage.from("employee-documents").remove([storagePath]);
  await supabase.from("employee_documents").delete().eq("id", documentId);
  revalidatePath(`/employees/${employeeId}`);
}
