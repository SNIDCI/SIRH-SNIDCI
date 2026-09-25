import { createClient } from "@/lib/supabase/server";
import { PayRunsList } from "@/components/payroll/pay-runs-list";

export default async function PayrollPage() {
  const supabase = createClient();
  const { data: payRuns } = await supabase
    .from("pay_runs")
    .select("id, period_label, period_month, status, created_at")
    .order("period_month", { ascending: false });

  return <PayRunsList payRuns={payRuns ?? []} />;
}
