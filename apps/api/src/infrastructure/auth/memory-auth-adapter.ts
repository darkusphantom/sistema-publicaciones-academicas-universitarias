import {
  createAdapterFactory,
  type AdapterFactoryCustomizeAdapterCreator,
  type CleanedWhere,
} from "@better-auth/core/db/adapter";
import type { DBAdapterInstance } from "better-auth";
import {
  MemoryUserStore,
  type AuthModelName,
  type AuthRecord,
  type StoredUser,
} from "../repositories/in-memory/user-store";

/** Operadores de comparación soportados por el adaptador. */
type WhereOperator =
  | "eq"
  | "ne"
  | "lt"
  | "lte"
  | "gt"
  | "gte"
  | "in"
  | "not_in"
  | "contains"
  | "starts_with"
  | "ends_with";

/**
 * Evalúa una cláusula `where` de Better Auth contra un registro.
 *
 * Comparaciones insensibles a mayúsculas cuando `mode === "insensitive"`.
 *
 * @param record - Registro almacenado.
 * @param where  - Cláusula limpiada por la fábrica del adaptador.
 * @returns `true` si el registro cumple la cláusula.
 * @complexity O(1) por cláusula.
 */
function matchesClause(record: AuthRecord, where: CleanedWhere): boolean {
  const operator = (where.operator ?? "eq") as WhereOperator;
  const field = where.field;
  const value = where.value;
  const isInsensitive =
    where.mode === "insensitive" &&
    (typeof value === "string" ||
      (Array.isArray(value) && value.every((v) => typeof v === "string")));

  const insensitiveCompare = (a: unknown, b: unknown): boolean => {
    if (typeof a === "string" && typeof b === "string") {
      return a.toLowerCase() === b.toLowerCase();
    }
    return a === b;
  };
  const insensitiveIncludes = (haystack: unknown, needle: string): boolean =>
    typeof haystack === "string" &&
    haystack.toLowerCase().includes(needle.toLowerCase());
  const insensitiveStartsWith = (haystack: unknown, needle: string): boolean =>
    typeof haystack === "string" &&
    haystack.toLowerCase().startsWith(needle.toLowerCase());
  const insensitiveEndsWith = (haystack: unknown, needle: string): boolean =>
    typeof haystack === "string" &&
    haystack.toLowerCase().endsWith(needle.toLowerCase());

  switch (operator) {
    case "in":
      if (!Array.isArray(value)) return false;
      return isInsensitive
        ? value.some((v) => insensitiveCompare(record[field], v))
        : (value as unknown[]).includes(record[field]);
    case "not_in":
      if (!Array.isArray(value)) return false;
      return isInsensitive
        ? !value.some((v) => insensitiveCompare(record[field], v))
        : !(value as unknown[]).includes(record[field]);
    case "contains":
      return isInsensitive
        ? insensitiveIncludes(record[field], value as string)
        : (record[field] as string)?.includes(value as string) ?? false;
    case "starts_with":
      return isInsensitive
        ? insensitiveStartsWith(record[field], value as string)
        : (record[field] as string)?.startsWith(value as string) ?? false;
    case "ends_with":
      return isInsensitive
        ? insensitiveEndsWith(record[field], value as string)
        : (record[field] as string)?.endsWith(value as string) ?? false;
    case "ne":
      return isInsensitive
        ? !insensitiveCompare(record[field], value)
        : record[field] !== value;
    case "gt":
      return value != null && Boolean((record[field] as number) > (value as number));
    case "gte":
      return value != null && Boolean((record[field] as number) >= (value as number));
    case "lt":
      return value != null && Boolean((record[field] as number) < (value as number));
    case "lte":
      return value != null && Boolean((record[field] as number) <= (value as number));
    default:
      if (isInsensitive) return insensitiveCompare(record[field], value);
      if (value === null) return record[field] == null;
      return record[field] === value;
  }
}

/**
 * Determina si un registro cumple todas las cláusulas (conectores AND/OR).
 *
 * @param record - Registro almacenado.
 * @param where  - Lista de cláusulas.
 * @returns `true` si cumple el predicado completo.
 * @complexity O(k) con k = número de cláusulas.
 */
function matchesWhere(record: AuthRecord, where: CleanedWhere[]): boolean {
  if (!where.length) return true;
  let result = matchesClause(record, where[0]);
  for (const clause of where.slice(1)) {
    const clauseResult = matchesClause(record, clause);
    result =
      clause.connector === "OR" ? result || clauseResult : result && clauseResult;
  }
  return result;
}

/**
 * Ordena un arreglo de registros según `sortBy`.
 *
 * @param records  - Registros a ordenar.
 * @param sortBy   - Campo y dirección.
 * @param model    - Modelo (para resolver el nombre físico del campo).
 * @param getFieldName - Mapeo de nombre de campo (identidad en memoria).
 */
function applySort(
  records: AuthRecord[],
  sortBy: { field: string; direction: "asc" | "desc" } | undefined,
  model: string,
  getFieldName: (params: { model: string; field: string }) => string,
): AuthRecord[] {
  if (!sortBy) return records;
  return records.sort((a, b) => {
    const field = getFieldName({ model, field: sortBy.field });
    const aValue = a[field];
    const bValue = b[field];
    let comparison: number;
    if (aValue == null && bValue == null) comparison = 0;
    else if (aValue == null) comparison = -1;
    else if (bValue == null) comparison = 1;
    else if (typeof aValue === "string" && typeof bValue === "string") {
      comparison = aValue.localeCompare(bValue);
    } else if (aValue instanceof Date && bValue instanceof Date) {
      comparison = aValue.getTime() - bValue.getTime();
    } else if (typeof aValue === "number" && typeof bValue === "number") {
      comparison = aValue - bValue;
    } else {
      comparison = String(aValue).localeCompare(String(bValue));
    }
    return sortBy.direction === "asc" ? comparison : -comparison;
  });
}

/**
 * Construye el `CustomAdapter` de Better Auth sobre el store compartido.
 *
 * Se tipa internamente con tipos concretos (`AuthRecord`) y el objeto final se
 * castea a `CustomAdapter` en la fábrica: la interfaz de Better Auth es
 * genérica (`<T>`) y no admite asignación directa de implementaciones
 * concretas sin `as`.
 *
 * @param store - Store compartido (fuente única de verdad).
 * @param getFieldName - Mapeo de nombre de campo que provee la fábrica.
 * @returns Objeto con las operaciones del `CustomAdapter`.
 */
function createMemoryCustomAdapter(
  store: MemoryUserStore,
  getFieldName: (params: { model: string; field: string }) => string,
) {
  type CreateInput = { model: string; data: Record<string, unknown> };
  type FindOneInput = { model: string; where: CleanedWhere[] };
  type FindManyInput = FindOneInput & {
    sortBy?: { field: string; direction: "asc" | "desc" } | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
  };
  type UpdateInput = FindOneInput & { update: Record<string, unknown> };
  type CountInput = FindOneInput;

  /**
   * Busca todos los registros de un modelo que cumplan el predicado.
   *
   * @param model - Modelo de Better Auth.
   * @param where - Cláusulas.
   * @returns Registros coincidentes.
   * @complexity O(n·k) con n = registros del modelo.
   */
  const query = (model: string, where: CleanedWhere[]): AuthRecord[] => {
    const collection = store.authCollection(model as AuthModelName);
    return [...collection.values()].filter((record) =>
      matchesWhere(record, where),
    );
  };

  /**
   * Mantiene los índices de usuario tras una escritura.
   *
   * @param model  - Modelo escrito.
   * @param record - Registro afectado.
   */
  const syncUserIndex = (model: string, record: AuthRecord): void => {
    if (model === "user") {
      store.saveUser(record as StoredUser);
    }
  };

  return {
    create: async ({ model, data }: CreateInput) => {
      const collection = store.authCollection(model as AuthModelName);
      const record = data as AuthRecord;
      collection.set(record.id, record);
      syncUserIndex(model, record);
      return data;
    },
    findOne: async ({ model, where }: FindOneInput) => {
      const found = query(model, where);
      return found[0] ?? null;
    },
    findMany: async ({ model, where = [], sortBy, limit, offset }: FindManyInput) => {
      let records = query(model, where);
      records = applySort(records, sortBy, model, getFieldName);
      if (offset !== undefined) records = records.slice(offset);
      if (limit !== undefined) records = records.slice(0, limit);
      return records;
    },
    update: async ({ model, where, update }: UpdateInput) => {
      const collection = store.authCollection(model as AuthModelName);
      const targets = query(model, where);
      if (!targets.length) return null;
      const first = targets[0];
      const updated = { ...first, ...update };
      collection.set(first.id, updated);
      syncUserIndex(model, updated);
      return updated;
    },
    updateMany: async ({ model, where, update }: UpdateInput) => {
      const collection = store.authCollection(model as AuthModelName);
      const targets = query(model, where);
      for (const target of targets) {
        const updated = { ...target, ...update };
        collection.set(target.id, updated);
        syncUserIndex(model, updated);
      }
      return targets.length;
    },
    delete: async ({ model, where }: FindOneInput) => {
      const collection = store.authCollection(model as AuthModelName);
      const targets = query(model, where);
      for (const target of targets) {
        collection.delete(target.id);
        if (model === "user") store.removeUser(target.id);
      }
    },
    deleteMany: async ({ model, where }: FindOneInput) => {
      const collection = store.authCollection(model as AuthModelName);
      const targets = query(model, where);
      for (const target of targets) {
        collection.delete(target.id);
        if (model === "user") store.removeUser(target.id);
      }
      return targets.length;
    },
    count: async ({ model, where = [] }: CountInput) => query(model, where).length,
  };
}

/**
 * Crea la instancia de adaptador de datos que exige Better Auth, sobre el
 * `MemoryUserStore` compartido (api-structure.md §8.5).
 *
 * Desvío registrado: la interfaz exacta de adaptador de Better Auth v1.7.7 es
 * la fábrica `createAdapterFactory` + `CustomAdapter` (no la interfaz
 * `DatabaseAdapter` del borrador §8.5, que correspondía a v0.x). El
 * `CustomAdapter` implementa create/findOne/findMany/update/updateMany/
 * delete/deleteMany/count; la fábrica añade generación de ids, defaults y
 * transformaciones de campos. `consumeOne`/`incrementOne` usan los fallbacks
 * de la fábrica (no hace falta implementarlos en memoria).
 *
 * @param store - Store compartido (fuente única de verdad).
 * @returns Instancia de adaptador lista para `betterAuth({ database: { adapter } })`.
 */
export function memoryAdapter(store: MemoryUserStore): DBAdapterInstance {
  return createAdapterFactory({
    config: {
      adapterId: "red-facyt-memory",
      adapterName: "Red FaCyT Memory Adapter",
      usePlural: false,
      debugLogs: false,
      supportsArrays: true,
      transaction: false,
    },
    adapter: ({ getFieldName }) =>
      createMemoryCustomAdapter(store, getFieldName) as ReturnType<
        AdapterFactoryCustomizeAdapterCreator
      >,
  });
}