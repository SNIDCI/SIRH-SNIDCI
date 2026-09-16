import { createClient } from "@/lib/supabase/server";
import { PositionsAdmin } from "@/components/admin/positions-admin";

export default async function PositionsPage() {
  const supabase = createClient();
  const [{ data: positions }, { data: departments }] = await Promise.all([
    supabase.from("positions").select("id, title, department_id, department:departments(id, name)").order("title"),
    supabase.from("departments").select("id, name").order("name"),
  ]);

  return <PositionsAdmin positions={(positions as any) ?? []} departments={departments ?? []} />;
}
