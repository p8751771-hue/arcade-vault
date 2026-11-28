import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // Desactivado: solo sirve para que los agentes preparen reportes de fallos
    // para el equipo de Next.js (experimental, apagado por defecto según la
    // documentación). Las reglas de AGENTS.md (`agentRules`) no dependen de esto.
    agentFeedback: false,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
