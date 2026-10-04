import { cors } from "hono/cors";
import type { MiddlewareHandler } from "hono";

/**
 * Convierte un CSV de orígenes en un arreglo limpio.
 *
 * Complejidad: O(n) con n = número de orígenes (config pequeña).
 *
 * @param csv - Cadena CSV de orígenes CORS.
 * @returns Orígenes sin espacios y sin entradas vacías.
 */
export function parseCorsOrigins(csv: string): string[] {
  return csv
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}

/**
 * CORS con whitelist estricta (requisito R1 de threat-model-api.md).
 *
 * Sin reflejo del header `Origin` y sin comodines: solo se permite un origen
 * exacto listado en `CORS_ORIGINS`. `Origin: null` se rechaza. Con
 * `credentials: true` para que las cookies de sesión funcionen entre el web
 * (3000) y la API (3001).
 *
 * Complejidad de cada request: O(n) con n = nº de orígenes configurados.
 *
 * @param csv - CSV de orígenes permitidos.
 * @returns Middleware de Hono.
 */
export function corsWhitelist(csv: string): MiddlewareHandler {
  const allowedOrigins = parseCorsOrigins(csv);
  return cors({
    origin: (origin) => {
      if (!origin || origin === "null") {
        return null;
      }
      return allowedOrigins.includes(origin) ? origin : null;
    },
    credentials: true,
  });
}