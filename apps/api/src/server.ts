import { randomUUID } from "node:crypto";
import { serve } from "@hono/node-server";
import type { ServerType } from "@hono/node-server";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Http2ServerRequest, Http2ServerResponse } from "node:http2";
import { pino } from "pino";
import type { Logger } from "pino";
import pinoHttp from "pino-http";
import type { HttpLogger } from "pino-http";
import { createApp } from "./app";
import { parseEnv } from "./config/env";

/** Rutas de headers sensibles que el access log debe redactar (W3/H1). */
const REDACTED_HEADERS = ["req.headers.cookie", "req.headers.authorization"];

/**
 * Id de correlación para el access log (W4/H2).
 *
 * Reutiliza el `x-request-id` entrante si es una cadena válida (para enlazar
 * con la traza externa) o genera un UUID v4. Así, el access log y el error
 * log comparten el mismo id que viaja en la respuesta.
 *
 * Complejidad: O(1).
 *
 * @param req - Petición HTTP entrante.
 * @returns Id de correlación del request.
 */
function genRequestId(req: IncomingMessage | Http2ServerRequest): string {
  const header = req.headers["x-request-id"];
  return typeof header === "string" && header.length > 0
    ? header
    : randomUUID();
}

/**
 * Crea el logger HTTP de pino-http para el access log.
 *
 * `redact` oculta `cookie` y `authorization` en los logs (W3/H1) y `genReqId`
 * enlaza cada entrada con el `x-request-id` (W4/H2). Se expone por separado
 * para poder testear el serializer sin abrir sockets de red.
 *
 * @param logger - Logger pino base (nivel ya configurado).
 * @returns `HttpLogger` de pino-http listo para envolver `req`/`res`.
 */
export function createRequestLogger(
  logger: Logger,
): HttpLogger<
  IncomingMessage | Http2ServerRequest,
  ServerResponse | Http2ServerResponse
> {
  return pinoHttp({
    logger,
    redact: REDACTED_HEADERS,
    genReqId: genRequestId,
  });
}

/**
 * Arranca el servidor HTTP con la app configurada.
 *
 * Este módulo es el único (junto a `index.ts`) que toca el adaptador de red;
 * `createApp` se mantiene puro y testable. Usado solo por el bootstrap, nunca
 * por los tests.
 *
 * @param envSource - Fuente de variables de entorno (normalmente `process.env`).
 * @returns Instancia del servidor Node ya escuchando.
 */
export function createServer(envSource: NodeJS.ProcessEnv): ServerType {
  const env = parseEnv(envSource);
  const logger = pino({ level: env.LOG_LEVEL });
  const requestLogger = createRequestLogger(logger);
  const app = createApp({ env, logger });

  const server = serve({
    fetch: (request, serverEnv) => {
      requestLogger(serverEnv.incoming, serverEnv.outgoing);
      return app.fetch(request);
    },
    port: env.PORT,
    hostname: env.HOST,
  });

  logger.info(
    { port: env.PORT, hostname: env.HOST },
    "Red FaCyT API listening",
  );
  return server;
}