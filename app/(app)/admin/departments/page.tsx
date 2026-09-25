import { createClient } from "@/lib/supabase/server";
import { DepartmentsAdmin } from "@/components/admin/departments-admin";

export default async function DepartmentsPage() {
  const supabase = createClient();
  const { data: departments } = await supabase.from("departments").select("id, name").order("name");

  return <DepartmentsAdmin departments={departments ?? []} />;
}
