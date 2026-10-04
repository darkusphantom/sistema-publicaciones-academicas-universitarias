import type { MiddlewareHandler } from "hono";
import { secureHeaders } from "hono/secure-headers";

/**
 * Cabeceras de seguridad de la API (requisito R4 de threat-model-api.md).
 *
 * CSP restrictiva para una API JSON (`default-src 'none'`, sin frames),
 * HSTS, `X-Content-Type-Options: nosniff` y `Referrer-Policy: no-referrer`.
 * Se elimina `X-Powered-By` para no revelar el framework.
 *
 * @returns Middleware de Hono con las cabeceras configuradas.
 */
export function securityHeaders(): MiddlewareHandler {
  return secureHeaders({
    contentSecurityPolicy: {
      defaultSrc: ["'none'"],
      frameAncestors: ["'none'"],
    },
    strictTransportSecurity: "max-age=63072000; includeSubDomains",
    xContentTypeOptions: "nosniff",
    referrerPolicy: "no-referrer",
    removePoweredBy: true,
  });
}