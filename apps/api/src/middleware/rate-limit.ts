import type { Context, MiddlewareHandler } from "hono";

/**
 * Rate limiter en memoria de ventana fija (requisito P0 R7/R12/R13).
 *
 * Soporta dos semánticas:
 * - `check(key)`: cuenta TODAS las peticiones (registra y comprueba en una
 *   llamada); usada por el middleware genérico y por el registro.
 * - `isBlocked(key)` + `record(key)`: cuenta SOLO los intentos fallidos; el
 *   llamante decide cuándo registrar un fallo (usada por login, H2).
 *
 * El store en memoria no escala a multi-instancia (aceptado para el MVP;
 * migrable a Redis sin cambiar el middleware).
 *
 * Complejidad: O(1) amortizado por operación (la poda de entradas expiradas
 * se ejecuta como mucho una vez por ventana).
 */
export class MemoryRateLimiter {
  private readonly counters = new Map<string, { count: number; resetAt: number }>();
  private lastSweepAt = 0;

  /**
   * @param max      - Máximo de intentos/peticiones por ventana.
   * @param windowMs - Duración de la ventana en milisegundos.
   */
  constructor(
    private readonly max: number,
    private readonly windowMs: number,
  ) {}

  /**
   * Podas de entradas expiradas para evitar crecimiento sin límite (H2).
   *
   * Se ejecuta como mucho una vez por ventana (`lastSweepAt`), de modo que
   * una entrada vive a lo sumo ~`windowMs` extra tras expirar.
   *
   * @param now - Marca de tiempo actual (para tests con reloj simulado).
   */
  private sweepExpired(now: number): void {
    if (now - this.lastSweepAt < this.windowMs) return;
    this.lastSweepAt = now;
    for (const [key, entry] of this.counters) {
      if (entry.resetAt <= now) this.counters.delete(key);
    }
  }

  /**
   * Registra una petición/intento para la clave (incrementa el contador).
   *
   * @param key - Clave del límite (IP, username, ...).
   */
  record(key: string): void {
    const now = Date.now();
    this.sweepExpired(now);
    const entry = this.counters.get(key);
    if (!entry || entry.resetAt <= now) {
      this.counters.set(key, { count: 1, resetAt: now + this.windowMs });
      return;
    }
    entry.count += 1;
  }

  /**
   * Comprueba si la clave está bloqueada SIN registrar una petición nueva.
   *
   * Una clave se considera bloqueada cuando los intentos registrados alcanzan
   * el máximo (`count >= max`).
   *
   * @param key - Clave del límite.
   * @returns `true` si la clave está bloqueada.
   */
  isBlocked(key: string): boolean {
    const now = Date.now();
    this.sweepExpired(now);
    const entry = this.counters.get(key);
    if (!entry || entry.resetAt <= now) return false;
    return entry.count >= this.max;
  }

  /**
   * Registra una petición para la clave y comprueba si se permite
   * (semántica «cuenta todos los requests»).
   *
   * @param key - Clave del límite (IP, username, ...).
   * @returns `true` si la petición se permite; `false` si superó el límite.
   */
  check(key: string): boolean {
    this.record(key);
    const entry = this.counters.get(key);
    return entry !== undefined && entry.count <= this.max;
  }

  /**
   * Elimina la clave del registro (para ventanas expiradas en tests).
   *
   * @param key - Clave a limpiar.
   */
  reset(key: string): void {
    this.counters.delete(key);
  }

  /**
   * Número de claves registradas (podando las expiradas).
   *
   * @returns Tamaño del registro tras la poda.
   */
  size(): number {
    this.sweepExpired(Date.now());
    return this.counters.size;
  }
}

/** Límite de longitud de la señal XFF saneada (anti abuso de cabecera). */
const MAX_FORWARDED_LENGTH = 64;

/**
 * Sanea el primer hop de `x-forwarded-for`: trim y acota la longitud, sin
 * caracteres de control.
 *
 * @param value - Valor crudo del header.
 * @returns Hop saneado, o `"unknown"` si queda vacío.
 */
function sanitizeForwardedFor(value: string): string {
  const hop = value.split(",")[0]?.trim() ?? "";
  const cleaned = hop.replace(/[^\x21-\x7e]/g, "").slice(0, MAX_FORWARDED_LENGTH);
  return cleaned.length > 0 ? cleaned : "unknown";
}

/**
 * Dirección del peer TCP del socket cuando el runtime la expone.
 *
 * En `@hono/node-server` el entorno del contexto (`c.env`) es
 * `{ incoming, server }`; `incoming.socket.remoteAddress` es la dirección del
 * par TCP, que el cliente NO puede forjar (la fija el servidor de red).
 *
 * @param c - Contexto de Hono.
 * @returns Dirección remota, o `null` si no está disponible.
 */
function remoteSocketAddress(c: Context): string | null {
  const env = c.env as
    | { incoming?: { socket?: { remoteAddress?: unknown } } }
    | undefined;
  const address = env?.incoming?.socket?.remoteAddress;
  if (typeof address === "string" && address.length > 0) return address;
  return null;
}

/**
 * Resuelve la clave de identidad del cliente para rate limit (H2).
 *
 * Decisión de seguridad documentada: el primer hop de `x-forwarded-for` es
 * controlable por el cliente si el proxy no lo sobrescribe, por lo que NO se
 * usa como identidad única. Se compone una clave híbrida:
 *
 *    `<peer TCP del socket>|<primer hop XFF saneado>`
 *
 * - El peer TCP del socket (`remoteAddress`) NO es forjable por el cliente; lo
 *   fija el servidor de red. Tras un reverse proxy es la dirección del propio
 *   proxy (común a todos los clientes), por lo que se combina con el XFF para
 *   diferenciar clientes tras el mismo proxy.
 * - El primer hop de `x-forwarded-for`, saneado, actúa como señal secundaria
 *   de cliente.
 *
 * Requisito operativo de despliegue: el reverse proxy DEBE sobrescribir
 * `X-Forwarded-For` con la dirección real del cliente. Con ello el XFF deja de
 * ser forjable y la clave es estable por cliente. Mientras el proxy no esté
 * configurado así, el XFF sigue siendo forjable (el peer TCP no lo compensa en
 * un despliegue tras proxy): riesgo residual aceptado y documentado para el
 * modelo de amenaza del MVP.
 *
 * @param remoteAddress - Peer TCP del socket (o `null` si no está expuesto).
 * @param forwardedFor  - Valor crudo del header `x-forwarded-for`.
 * @returns Clave de identidad para las claves de rate limit.
 */
export function resolveClientIdentity(
  remoteAddress: string | null,
  forwardedFor: string | undefined,
): string {
  const remote = remoteAddress ?? "none";
  if (forwardedFor) return `${remote}|${sanitizeForwardedFor(forwardedFor)}`;
  return remote;
}

/**
 * Identidad del cliente para rate limit (ver `resolveClientIdentity`).
 *
 * @param c - Contexto de Hono.
 * @returns Clave de identidad del cliente.
 */
export function clientIp(c: Context): string {
  return resolveClientIdentity(
    remoteSocketAddress(c),
    c.req.header("x-forwarded-for"),
  );
}

/**
 * Crea un middleware de rate limit por clave (cuenta todos los requests).
 *
 * @param limiter - Limiter compartido.
 * @param keyOf   - Extrae la clave del contexto (IP, username, ...).
 * @returns Middleware de Hono que responde 429 genérico al superar el límite.
 */
export function rateLimitByKey(
  limiter: MemoryRateLimiter,
  keyOf: (c: Context) => string,
): MiddlewareHandler {
  return async (c, next) => {
    if (!limiter.check(keyOf(c))) {
      return c.json(
        {
          error: "rate_limited",
          message: "Demasiadas solicitudes. Intenta de nuevo más tarde.",
        },
        429,
      );
    }
    await next();
  };
}