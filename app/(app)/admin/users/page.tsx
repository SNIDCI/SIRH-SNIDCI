import { createClient } from "@/lib/supabase/server";
import { UsersAdmin } from "@/components/admin/users-admin";

export default async function UsersPage() {
  const supabase = createClient();

  const [{ data: accounts }, { data: employees }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, email, role, employee:employees(id, first_name, last_name)")
      .order("full_name"),
    supabase.from("employees").select("id, first_name, last_name, work_email").order("last_name"),
  ]);

  const linkedEmployeeIds = new Set((accounts ?? []).map((a: any) => a.employee?.id).filter(Boolean));
  const employeesWithoutAccount = (employees ?? []).filter((e) => !linkedEmployeeIds.has(e.id));

  return <UsersAdmin accounts={(accounts as any) ?? []} employeesWithoutAccount={employeesWithoutAccount} />;
}
