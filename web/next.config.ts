import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PGlite/WASM nicht in Turbopack bündeln (Windows: „path“ + URL-Fehler)
  serverExternalPackages: [
    "@electric-sql/pglite",
    "pglite-prisma-adapter",
    "@prisma/client",
    "prisma",
  ],
};

export default nextConfig;
