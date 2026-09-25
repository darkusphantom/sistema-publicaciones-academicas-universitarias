#!/usr/bin/env node
/* Servidor MCP (stdio) para checklists de Trello.
 * Protocolo Model Context Protocol sobre stdio, sin dependencias externas.
 * Expone las operaciones de checklist que el server "trello-mcp-server" no incluye.
 * Requiere en el entorno: TRELLO_API_KEY y TRELLO_API_TOKEN.
 */
import { createInterface } from "node:readline";

const API = "https://api.trello.com/1";
const TRELLO_API_KEY = process.env.TRELLO_API_KEY ?? "";
const TRELLO_API_TOKEN = process.env.TRELLO_API_TOKEN ?? "";

/** Definiciones de las herramientas expuestas (tools/list). */
const TOOLS = [
  {
    name: "create-checklist",
    description:
      "Crea un checklist de Trello dentro de una tarjeta existente. Devuelve el id y nombre del checklist creado.",
    inputSchema: {
      type: "object",
      properties: {
        cardId: {
          type: "string",
          description: "ID de la tarjeta que contendra el checklist.",
        },
        name: {
          type: "string",
          description: "Nombre del checklist (ej. 'Subtareas').",
        },
      },
      required: ["cardId", "name"],
      additionalProperties: false,
    },
  },
  {
    name: "get-checklists",
    description:
      "Lista los checklists de una tarjeta con el numero de subtareas de cada uno.",
    inputSchema: {
      type: "object",
      properties: {
        cardId: { type: "string", description: "ID de la tarjeta." },
      },
      required: ["cardId"],
      additionalProperties: false,
    },
  },
  {
    name: "add-checklist-item",
    description:
      "Agrega una subtarea (checkItem) a un checklist. Devuelve el id y estado de la subtarea creada.",
    inputSchema: {
      type: "object",
      properties: {
        checklistId: { type: "string", description: "ID del checklist." },
        name: { type: "string", description: "Texto de la subtarea." },
      },
      required: ["checklistId", "name"],
      additionalProperties: false,
    },
  },
  {
    name: "get-checklist-items",
    description:
      "Lista las subtareas de un checklist con su estado (complete/incomplete) y su id.",
    inputSchema: {
      type: "object",
      properties: {
        checklistId: { type: "string", description: "ID del checklist." },
      },
      required: ["checklistId"],
      additionalProperties: false,
    },
  },
  {
    name: "set-checklist-item-checked",
    description:
      "Marca una subtarea como completada (checked=true) o pendiente (checked=false).",
    inputSchema: {
      type: "object",
      properties: {
        cardId: {
          type: "string",
          description: "ID de la tarjeta que contiene el checklist.",
        },
        checklistId: { type: "string", description: "ID del checklist." },
        itemId: { type: "string", description: "ID de la subtarea (checkItem)." },
        checked: {
          type: "boolean",
          description: "true para completar, false para revertir.",
        },
      },
      required: ["cardId", "checklistId", "itemId", "checked"],
      additionalProperties: false,
    },
  },
];

/** Implementaciones de cada herramienta (tools/call). */
const handlers = {
  async "create-checklist"(args) {
    const res = await trello("POST", "/checklists", {
      name: args.name,
      idCard: args.cardId,
    });
    return {
      ok: true,
      checklist: { id: res.id, name: res.name, cardId: res.idCard },
    };
  },
  async "get-checklists"(args) {
    const res = await trello("GET", `/cards/${args.cardId}/checklists`);
    return {
      ok: true,
      checklists: res.map((c) => ({
        id: c.id,
        name: c.name,
        cardId: args.cardId,
        count: (c.checkItems ?? []).length,
      })),
    };
  },
  async "add-checklist-item"(args) {
    const res = await trello("POST", `/checklists/${args.checklistId}/checkItems`, {
      name: args.name,
    });
    return {
      ok: true,
      item: { id: res.id, name: res.name, state: res.state ?? "incomplete" },
    };
  },
  async "get-checklist-items"(args) {
    const res = await trello("GET", `/checklists/${args.checklistId}/checkItems`);
    return {
      ok: true,
      items: res.map((i) => ({
        id: i.id,
        name: i.name,
        state: i.state ?? "incomplete",
        checked: (i.state ?? "incomplete") === "complete",
      })),
    };
  },
  async "set-checklist-item-checked"(args) {
    const state = args.checked ? "complete" : "incomplete";
    const res = await trello(
      "PUT",
      `/cards/${args.cardId}/checklist/${args.checklistId}/checkItem/${args.itemId}`,
      { state }
    );
    return {
      ok: true,
      item: { id: res.id, name: res.name, state: res.state ?? state },
    };
  },
};

/** Llama a la API REST de Trello con autenticacion por query params. */
async function trello(method, path, params = {}) {
  if (!TRELLO_API_KEY || !TRELLO_API_TOKEN) {
    throw new Error(
      "Faltan TRELLO_API_KEY/TRELLO_API_TOKEN en el entorno del MCP."
    );
  }
  const url = new URL(API + path);
  url.searchParams.set("key", TRELLO_API_KEY);
  url.searchParams.set("token", TRELLO_API_TOKEN);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, String(v));
  }
  const resp = await fetch(url, { method });
  const body = await resp.text();
  let json;
  try {
    json = body ? JSON.parse(body) : {};
  } catch {
    json = { raw: body };
  }
  if (!resp.ok && json.detail) {
    throw new Error(String(json.detail));
  }
  if (Array.isArray(json?.errors) && json.errors.length > 0) {
    throw new Error(json.errors.map((e) => e.message).join("; "));
  }
  return json;
}

// --- Protocolo MCP sobre stdio ---------------------------------------------
const rl = createInterface({ input: process.stdin, crlfDelay: Infinity });

function respond(id, result) {
  process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id, result }) + "\n");
}

function respondError(id, code, message) {
  process.stdout.write(
    JSON.stringify({ jsonrpc: "2.0", id, error: { code, message } }) + "\n"
  );
}

rl.on("line", async (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;

  let msg;
  try {
    msg = JSON.parse(trimmed);
  } catch {
    return; // ignorar lineas malformadas
  }

  // Las notificaciones no llevan id: se ignoran (initialize/initialized, cancelled).
  if (typeof msg.id !== "number") return;

  try {
    switch (msg.method) {
      case "initialize":
        respond(msg.id, {
          protocolVersion: msg.params?.protocolVersion ?? "2024-11-05",
          capabilities: { tools: { listChanged: false } },
          serverInfo: { name: "trello-checklists", version: "0.1.0" },
        });
        return;
      case "ping":
        respond(msg.id, {});
        return;
      case "tools/list":
        respond(msg.id, { tools: TOOLS });
        return;
      case "tools/call": {
        const { name, arguments: args } = msg.params ?? {};
        const handler = handlers[name];
        if (!handler) {
          respond(msg.id, {
            content: [{ type: "text", text: `Herramienta desconocida: ${name}` }],
            isError: true,
          });
          return;
        }
        const result = await handler(args ?? {});
        respond(msg.id, {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        });
        return;
      }
      default:
        respondError(msg.id, -32601, `Metodo no soportado: ${msg.method}`);
    }
  } catch (err) {
    respond(msg.id, {
      content: [{ type: "text", text: `Error: ${err.message}` }],
      isError: true,
    });
  }
});