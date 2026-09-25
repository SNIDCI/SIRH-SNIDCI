"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Tableau de bord" },
  { href: "/employees", label: "Employés" },
  { href: "/employees/org-chart", label: "Organigramme" },
  { href: "/payroll", label: "Paie" },
  { href: "/my-payslips", label: "Mes bulletins" },
  { href: "/admin", label: "Administration" },
];

export function TopNav({ userName, userRole }: { userName: string; userRole: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-ink">
      <div className="flex h-14 items-center gap-6 px-6">
        <Link href="/dashboard" className="flex-none font-serif text-lg tracking-tight text-white">
          SIRH
        </Link>

        <nav className="flex items-center gap-1 overflow-x-auto">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap rounded px-3 py-1.5 text-sm transition-colors ${
                  active
                    ? "bg-white/10 font-medium text-white"
                    : "text-canvas/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex flex-none items-center gap-4">
          <input
            type="search"
            placeholder="Rechercher…"
            className="hidden w-48 rounded border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-white placeholder:text-canvas/50 focus:border-accent sm:block"
          />
          <div className="text-right">
            <p className="text-sm font-medium text-white">{userName}</p>
            <p className="text-xs capitalize text-canvas/60">{userRole}</p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded border border-white/15 px-3 py-1.5 text-xs text-white transition-colors hover:bg-white/10"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </header>
  );
}
