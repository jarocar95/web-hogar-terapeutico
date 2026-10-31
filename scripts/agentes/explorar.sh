#!/usr/bin/env bash
# Explorador de solo lectura: busca en el repo y responde a una pregunta.
#   scripts/agentes/explorar.sh "¿Dónde se carga el calendario de reservas?" [deepseek,glm,haiku] [rama]
# Por defecto prueba deepseek -> glm -> haiku: Haiku solo gasta cuota de Claude si los gratuitos no tienen cupo.
# Con "haiku" como segundo argumento va directo a Haiku (el más rápido).
set -uo pipefail
PREGUNTA="$1"; LISTA_EJ="${2:-deepseek,glm,haiku}"; REF="${3:-main}"
RAIZ="$(git -C "$(dirname "$0")" rev-parse --show-toplevel)"
PADRE="$(dirname "$RAIZ")"   # worktrees con prefijo "ht-": el directorio padre lo comparten otros proyectos

PROMPT="Eres un explorador de código de solo lectura en este repositorio (lee AGENTS.md si necesitas contexto).
No modifiques ningún archivo. Para leer y buscar usa tus herramientas de lectura; por terminal solo ls y git log/show.
Pregunta: $PREGUNTA
Responde en español, en menos de 80 líneas: la conclusión primero y después las pruebas con ruta:línea exacta.
Si algo no lo has comprobado, dilo."

IFS=',' read -ra EJECUTORES <<< "$LISTA_EJ"
for EJ in "${EJECUTORES[@]}"; do
  WT="$PADRE/ht-wt-explorar-$EJ"
  [ -d "$WT" ] || git -C "$RAIZ" worktree add -q --detach "$WT" "$REF"
  git -C "$WT" checkout -q --detach "$REF" && git -C "$WT" reset -q --hard && git -C "$WT" clean -qfd

  ERR="$(mktemp)"
  case "$EJ" in
    gemini)
      SALIDA="$(cd "$WT" && agy -p "$PROMPT" --model gemini-3.8-flash-high --output-format json --print-timeout 10m 2>"$ERR")"
      TEXTO="$(echo "$SALIDA" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{const j=JSON.parse(s);console.log(j.response||s)}catch{console.log(s)}})')" ;;
    glm|deepseek)
      [ "$EJ" = glm ] && M="opencode/glm-5.3-flash-free" || M="opencode/deepseek-v4.1-flash-free"
      SALIDA="$(OPENCODE_CONFIG="$RAIZ/scripts/agentes/opencode-explorador.json" timeout 900 opencode run --dir "$WT" -m "$M" "$PROMPT" 2>"$ERR")"
      TEXTO="$SALIDA" ;;
    haiku)
      SALIDA="$(cd "$WT" && timeout 900 claude -p "$PROMPT" --model haiku --allowedTools "Read" "Glob" "Grep" "Bash(ls:*)" "Bash(git log:*)" "Bash(git show:*)" --disallowedTools "Read(**/.env*)" "Read(.mcp.json)" "Edit" "Write" 2>"$ERR")"
      TEXTO="$SALIDA" ;;
    *) echo "ejecutor desconocido: $EJ" >&2; rm -f "$ERR"; exit 2 ;;
  esac

  if echo "$SALIDA$(cat "$ERR")" | grep -Eq '429|RESOURCE_EXHAUSTED|[Qq]uota|[Rr]ate.?limit|[Tt]oo [Mm]any [Rr]equests'; then
    echo "($EJ sin cupo, probando siguiente...)" >&2
    rm -f "$ERR"
    continue
  fi

  echo "$TEXTO"
  rm -f "$ERR"
  exit 0
done

echo "Ningún explorador con cupo disponible." >&2
exit 3
