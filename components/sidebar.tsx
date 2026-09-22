"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Tableau de bord" },
  { href: "/employees", label: "Employés" },
  { href: "/employees/org-chart", label: "Organigramme" },
  { href: "/payroll", label: "Paie" },
  { href: "/my-payslips", label: "Mes bulletins" },
  { href: "/admin", label: "Administration" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 flex-none flex-col bg-ink text-canvas">
      <div className="px-5 py-6">
        <span className="font-serif text-lg tracking-tight">SIRH</span>
      </div>

      <nav className="flex-1 space-y-0.5 px-3">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded px-3 py-2 text-sm transition-colors ${
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

      <div className="border-t border-white/10 px-5 py-4">
        <p className="text-xs text-canvas/50">Module Employés — v0.1</p>
      </div>
    </aside>
  );
}
