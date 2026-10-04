import { EventEmitter } from "node:events";
import type { IncomingMessage, ServerResponse } from "node:http";
import { Writable } from "node:stream";
import { pino } from "pino";
import { describe, expect, it } from "vitest";
import { createRequestLogger } from "./server";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/**
 * Construye un stream que captura cada línea JSON emitida por pino.
 */
function createCapturingStream(): {
  stream: Writable;
  read: () => string;
} {
  const chunks: string[] = [];
  const stream = new Writable({
    write(chunk, _encoding, callback) {
      chunks.push(String(chunk));
      callback();
    },
  });
  return {
    stream,
    read: () => chunks.join(""),
  };
}

/**
 * Crea un `req` falso con la forma mínima que necesita el serializer de pino.
 *
 * @param headers - Cabeceras HTTP de la petición simulada.
 * @returns Objeto req simulando un `IncomingMessage`.
 */
function buildFakeRequest(
  headers: Record<string, string>,
): IncomingMessage {
  return {
    id: undefined,
    method: "GET",
    url: "/api/v1/health",
    headers,
    socket: { remoteAddress: "127.0.0.1", remotePort: 51_234 },
  } as unknown as IncomingMessage;
}

/**
 * Crea un `res` falso tipo EventEmitter para disparar el evento `finish`
 * que activa el log de fin de request de pino-http.
 *
 * @returns Objeto res simulando un `ServerResponse`.
 */
function buildFakeResponse(): ServerResponse {
  const res = new EventEmitter() as EventEmitter & {
    statusCode: number;
    headersSent: boolean;
    writableEnded: boolean;
    getHeaders: () => Record<string, string>;
  };
  res.statusCode = 200;
  res.headersSent = true;
  res.writableEnded = true;
  res.getHeaders = () => ({ "x-request-id": "trace-1234" });
  return res as unknown as ServerResponse;
}

describe("createRequestLogger", () => {
  it("redacts cookie and authorization headers from the access log", () => {
    const { stream, read } = createCapturingStream();
    const logger = pino({ level: "info" }, stream);
    const requestLogger = createRequestLogger(logger);
    const req = buildFakeRequest({
      cookie: "session=super-secret-value",
      authorization: "Bearer super-secret-token",
      "x-request-id": "trace-1234",
    });
    const res = buildFakeResponse();

    requestLogger(req, res);
    res.emit("finish");

    const output = read();
    expect(output).not.toContain("super-secret-value");
    expect(output).not.toContain("super-secret-token");
    expect(output).toContain("[Redacted]");
  });

  it("reuses the incoming x-request-id as the access-log request id", () => {
    const { stream, read } = createCapturingStream();
    const logger = pino({ level: "info" }, stream);
    const requestLogger = createRequestLogger(logger);
    const req = buildFakeRequest({ "x-request-id": "trace-1234" });
    const res = buildFakeResponse();

    requestLogger(req, res);
    res.emit("finish");

    expect(req.id).toBe("trace-1234");
    expect(read()).toContain('"id":"trace-1234"');
  });

  it("generates a UUID request id when no x-request-id is present", () => {
    const { stream, read } = createCapturingStream();
    const logger = pino({ level: "info" }, stream);
    const requestLogger = createRequestLogger(logger);
    const req = buildFakeRequest({});
    const res = buildFakeResponse();

    requestLogger(req, res);
    res.emit("finish");

    expect(req.id).toMatch(UUID_PATTERN);
    expect(read()).toContain(`"id":"${req.id}"`);
  });
});