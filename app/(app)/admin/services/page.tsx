import { createClient } from "@/lib/supabase/server";
import { ServicesAdmin } from "@/components/admin/services-admin";

export default async function ServicesPage() {
  const supabase = createClient();
  const [{ data: services }, { data: departments }] = await Promise.all([
    supabase.from("services").select("id, name, department_id, department:departments(id, name)").order("name"),
    supabase.from("departments").select("id, name").order("name"),
  ]);

  return <ServicesAdmin services={(services as any) ?? []} departments={departments ?? []} />;
}
