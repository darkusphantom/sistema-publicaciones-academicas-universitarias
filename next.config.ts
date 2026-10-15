import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // La API (Hono) corre dentro de este mismo despliegue como Route Handler en
  // `src/app/api/v1/[[...route]]/route.ts`. `pino` usa carga dinámica de
  // módulos, así que se mantiene fuera del bundle y se resuelve en runtime.
  serverExternalPackages: ["pino", "pino-http"],
};

export default nextConfig;
