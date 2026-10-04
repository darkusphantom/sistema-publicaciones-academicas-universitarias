import type { BinaryLike, ScryptOptions } from "node:crypto";
import { scrypt as scryptCallback, scryptSync, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scryptCallback) as (
  password: BinaryLike,
  salt: BinaryLike,
  keylen: number,
  options: ScryptOptions,
) => Promise<Buffer>;

/**
 * Parámetros Scrypt idénticos a los que usa Better Auth v1.7.7
 * (`@better-auth/utils/password`: N=16384, r=16, p=1, dkLen=64, sal de 16
 * bytes, normalización NFKC), confirmados contra el código instalado.
 */
const DECOY_N = 16384;
const DECOY_R = 16;
const DECOY_P = 1;
const DECOY_DK_LEN = 64;
const DECOY_MAXMEM = 128 * DECOY_N * DECOY_R * 2;

/** Sal fija del hash señuelo (no es un secreto; solo iguala el coste). */
const DECOY_SALT = "red-facyt-login-decoy";

/**
 * Clave derivada fija para la comparación de tiempo constante del señuelo.
 * Se calcula una sola vez al cargar el módulo (fuera de la ruta de request):
 * no bloquea el event loop por petición.
 */
const DECOY_TARGET = scryptSync(
  "decoy-target-password".normalize("NFKC"),
  DECOY_SALT,
  DECOY_DK_LEN,
  { N: DECOY_N, r: DECOY_R, p: DECOY_P, maxmem: DECOY_MAXMEM },
);

/**
 * Ejecuta una derivación Scrypt ASÍNCRONA de coste equivalente a la de
 * Better Auth (H5).
 *
 * Cuando una cuenta no existe (login) o ya existe (register), Better Auth no
 * deriva ninguna clave, por lo que la respuesta sería más rápida y filtraría
 * la existencia de cuentas por timing. Este señuelo ejecuta la MISMA derivación
 * Scrypt (mismos N/r/p/dkLen, normalización NFKC) en el mismo camino de
 * ejecución para igualar el coste temporal real. Usa la variante asíncrona de
 * `node:crypto` (libuv thread pool) para no bloquear el event loop — a
 * diferencia del `scryptSync` previo.
 *
 * @param password - Contraseña del intento (solo para derivar la clave).
 * @returns Promesa que resuelve cuando la derivación señuelo termina.
 */
export async function verifyPasswordDecoy(password: string): Promise<void> {
  const derived = (await scryptAsync(
    password.normalize("NFKC"),
    DECOY_SALT,
    DECOY_DK_LEN,
    { N: DECOY_N, r: DECOY_R, p: DECOY_P, maxmem: DECOY_MAXMEM },
  )) as Buffer;
  timingSafeEqual(derived, DECOY_TARGET);
}