/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // @react-pdf/renderer s'appuie sur des modules Node (fontkit, etc.) qui ne
  // supportent pas d'être regroupés par le bundler de Next.js pour les Server
  // Actions/Route Handlers — cause fréquente d'erreur serveur générique au
  // moment de générer un PDF. On l'exclut du bundling pour qu'il soit chargé
  // normalement au runtime.
  experimental: {
    serverComponentsExternalPackages: ["@react-pdf/renderer"],
  },
};

export default nextConfig;
