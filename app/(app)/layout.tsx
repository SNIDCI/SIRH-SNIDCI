import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TopNav } from "@/components/top-nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-canvas">
      <TopNav
        userName={profile?.full_name ?? user.email ?? "Utilisateur"}
        userRole={profile?.role ?? "employe"}
      />
      <main className="mx-auto max-w-6xl p-8">{children}</main>
    </div>
  );
}
