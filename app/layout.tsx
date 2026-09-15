import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SIRH — Ressources Humaines",
  description: "Plateforme interne de gestion des ressources humaines",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
