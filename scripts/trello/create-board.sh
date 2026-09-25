#!/usr/bin/env bash
# Bootstrap del tablero Kanban de Red FaCyT en Trello.
# Crea (una sola vez) el tablero, sus 6 columnas y sus labels de prioridad y tipo,
# y persiste la configuracion en docs/trello/board.json.
# Es idempotente: si docs/trello/board.json ya existe, no modifica nada.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

API="https://api.trello.com/1"
BOARD_NAME="Red FaCyT - Kanban"
BOARD_DESC="Tablero Kanban de seguimiento de actividades del proyecto Red FaCyT (Desarrollo de Aplicaciones Web - junio 2026)."
BOARD_JSON="docs/trello/board.json"
CONFIG_FILE="${OPENCODE_CONFIG:-${HOME}/.config/opencode/opencode.jsonc}"

# --- Credenciales -----------------------------------------------------------
# Se pueden pasar en variables de entorno (TRELLO_API_KEY/TRELLO_API_TOKEN);
# de lo contrario se leen de la config global de opencode.
get_secret() {
  local key="$1"
  if [[ -n "${!key:-}" ]]; then
    printf '%s' "${!key}"
    return
  fi
  if [[ ! -f "$CONFIG_FILE" ]]; then
    echo "No se encuentra el archivo de configuracion: $CONFIG_FILE" >&2
    exit 1
  fi
  sed -n "s/.*\"${key}\"[[:space:]]*:[[:space:]]*\"\([^\"]*\)\".*/\1/p" "$CONFIG_FILE" | head -n1
}

TRELLO_API_KEY="$(get_secret TRELLO_API_KEY)"
TRELLO_API_TOKEN="$(get_secret TRELLO_API_TOKEN)"

if [[ -z "$TRELLO_API_KEY" || -z "$TRELLO_API_TOKEN" ]]; then
  echo "Faltan TRELLO_API_KEY / TRELLO_API_TOKEN (variables de entorno o $CONFIG_FILE)." >&2
  exit 1
fi

# --- Idempotencia -----------------------------------------------------------
if [[ -f "$BOARD_JSON" ]]; then
  echo "El tablero ya existe ($BOARD_JSON). Nada que hacer."
  cat "$BOARD_JSON"
  exit 0
fi

TMP="$(mktemp -d "/tmp/opencode/trello.XXXXXX")"
trap 'rm -rf "$TMP"' EXIT

# --- Helpers ----------------------------------------------------------------
trello_post() {
  curl -sS -X POST "$1" \
    -d "key=${TRELLO_API_KEY}" \
    -d "token=${TRELLO_API_TOKEN}" \
    "${@:2}"
}

# Valida una respuesta JSON de Trello e imprime su campo `id`.
extract_id() {
  node -e '
    const fs = require("fs");
    const raw = fs.readFileSync(0, "utf8").trim();
    let j;
    try { j = JSON.parse(raw); } catch { console.error("Respuesta no JSON:", raw); process.exit(1); }
    if (j.error || j.message || !j.id) { console.error("Error de Trello:", JSON.stringify(j)); process.exit(1); }
    console.log(j.id);
  '
}

# Agrega un par {name, id} a un arreglo JSON en disco.
append_pair() {
  local file="$1" name="$2" id="$3"
  node -e '
    const fs = require("fs");
    const file = process.argv[1], name = process.argv[2], id = process.argv[3];
    let arr = [];
    try { arr = JSON.parse(fs.readFileSync(file, "utf8")); } catch {}
    arr.push({ name, id });
    fs.writeFileSync(file, JSON.stringify(arr));
  ' "$file" "$name" "$id"
}

# --- Tablero ----------------------------------------------------------------
echo "Creando tablero '$BOARD_NAME'..."
BOARD_RESP="$(trello_post "$API/boards" \
  --data-urlencode "name=${BOARD_NAME}" \
  --data-urlencode "desc=${BOARD_DESC}" \
  --data-urlencode "defaultLists=false" \
  --data-urlencode "defaultLabels=false")"

BOARD_ID="$(printf '%s\n' "$BOARD_RESP" | extract_id)"
BOARD_URL="$(printf '%s\n' "$BOARD_RESP" | node -e '
  const fs = require("fs");
  const j = JSON.parse(fs.readFileSync(0, "utf8"));
  console.log(j.url || "");
')"
echo "  boardId=${BOARD_ID}"
echo "  url=${BOARD_URL}"

# --- Columnas ---------------------------------------------------------------
echo "Creando columnas (6)..."
LISTS_FILE="$TMP/lists.json"
echo "[]" > "$LISTS_FILE"
for name in "Pendiente" "En análisis" "En desarrollo" "En prueba" "En revisión" "Terminado"; do
  resp="$(trello_post "$API/boards/${BOARD_ID}/lists" \
    --data-urlencode "name=${name}" \
    --data-urlencode "pos=bottom")"
  id="$(printf '%s\n' "$resp" | extract_id)"
  append_pair "$LISTS_FILE" "$name" "$id"
  echo "  - ${name} (${id})"
done

# --- Labels -----------------------------------------------------------------
labels_defs=(
  "Alta|red"
  "Media|orange"
  "Baja|green"
  "feature|blue"
  "fix|sky"
  "refactor|purple"
  "docs|black"
  "test|pink"
  "chore|yellow"
  "perf|lime"
)

echo "Creando labels (prioridad + tipo)..."
LABELS_FILE="$TMP/labels.json"
echo "[]" > "$LABELS_FILE"
for def in "${labels_defs[@]}"; do
  name="${def%%|*}"
  color="${def##*|}"
  resp="$(trello_post "$API/boards/${BOARD_ID}/labels" \
    --data-urlencode "name=${name}" \
    --data-urlencode "color=${color}")"
  id="$(printf '%s\n' "$resp" | extract_id)"
  append_pair "$LABELS_FILE" "$name" "$id"
  echo "  - ${name} (${id}) / ${color}"
done

# --- Persistir board.json ---------------------------------------------------
mkdir -p "$(dirname "$BOARD_JSON")"
BOARD_ID="$BOARD_ID" BOARD_NAME="$BOARD_NAME" BOARD_URL="$BOARD_URL" \
LISTS_FILE="$LISTS_FILE" LABELS_FILE="$LABELS_FILE" node -e '
  const fs = require("fs");
  const lists = JSON.parse(fs.readFileSync(process.env.LISTS_FILE, "utf8"));
  const labels = JSON.parse(fs.readFileSync(process.env.LABELS_FILE, "utf8"));
  const toMap = (arr) => Object.fromEntries(arr.map((x) => [x.name, x.id]));
  const doc = {
    boardName: process.env.BOARD_NAME,
    boardId: process.env.BOARD_ID,
    url: process.env.BOARD_URL,
    lists: toMap(lists),
    labels: toMap(labels),
  };
  fs.writeFileSync(process.argv[1], JSON.stringify(doc, null, 2) + "\n");
' "$BOARD_JSON"

echo
echo "Listo: $BOARD_JSON"
cat "$BOARD_JSON"