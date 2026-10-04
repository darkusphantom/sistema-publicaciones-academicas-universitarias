import { createServer } from "./server";

const server = createServer(process.env);

/**
 * Cierra el servidor de forma limpia ante señales de terminación.
 *
 * Mejora P2 documentada en api-structure.md §4.3: tras la señal espera hasta
 * 5 s a que las conexiones cierren y fuerza la salida si no ocurre.
 *
 * @param _signal - Señal recibida (SIGINT o SIGTERM), solo informativa.
 */
function shutdown(_signal: NodeJS.Signals): void {
  server.close(() => {
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 5_000).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));