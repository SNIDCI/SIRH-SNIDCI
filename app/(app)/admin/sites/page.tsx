import { createClient } from "@/lib/supabase/server";
import { SitesAdmin } from "@/components/admin/sites-admin";

export default async function SitesPage() {
  const supabase = createClient();
  const { data: sites } = await supabase.from("sites").select("id, name").order("name");

  return <SitesAdmin sites={sites ?? []} />;
}
