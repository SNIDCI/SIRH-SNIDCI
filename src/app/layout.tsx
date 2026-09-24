import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Audit SIRH-SNIDCI — Revue de code & corrections",
  description: "Revue du dépôt SIRH-SNIDCI : constats, corrections appliquées et suivi.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-[#F4F6F4] text-[#16202B] antialiased">
        <header className="sticky top-0 z-10 bg-[#16202B]">
          <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-6">
            <Link href="/" className="font-serif text-lg text-white">
              SIRH-SNIDCI <span className="text-[#9FC5B3]">· Audit</span>
            </Link>
            <nav className="flex gap-1 text-sm">
              <Link href="/" className="rounded px-3 py-1.5 text-white/80 hover:bg-white/10 hover:text-white">
                Constats
              </Link>
              <Link href="/patch" className="rounded px-3 py-1.5 text-white/80 hover:bg-white/10 hover:text-white">
                Patch
              </Link>
              <Link href="/guide" className="rounded px-3 py-1.5 text-white/80 hover:bg-white/10 hover:text-white">
                Mise en place
              </Link>
            </nav>
            <a
              href="https://github.com/SNIDCI/SIRH-SNIDCI"
              target="_blank"
              rel="noreferrer"
              className="ml-auto text-xs text-white/60 hover:text-white"
            >
              Dépôt GitHub ↗
            </a>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
      </body>
    </html>
  );
}
