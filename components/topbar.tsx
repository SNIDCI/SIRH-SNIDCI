"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function Topbar({ userName, userRole }: { userName: string; userRole: string }) {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex h-16 flex-none items-center justify-between border-b border-line bg-surface px-6">
      <input
        type="search"
        placeholder="Rechercher un employé, un poste…"
        className="field-input max-w-sm"
      />

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-ink">{userName}</p>
          <p className="text-xs capitalize text-slate">{userRole}</p>
        </div>
        <button onClick={handleLogout} className="btn-secondary text-xs">
          Déconnexion
        </button>
      </div>
    </header>
  );
}
