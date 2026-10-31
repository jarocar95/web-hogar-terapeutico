#!/usr/bin/env bash
# Lanza una tarea en un ejecutor externo, pasa tests y build en Bash y, si fallan,
# le pide 1 autocorrección en la misma sesión ANTES de gastar cuota de Claude en revisión.
#   scripts/agentes/lanzar.sh <NN-nombre> <ejecutores> <archivo-encargo> [rama-base]
#   ejecutores: lista separada por comas con failover si uno se queda sin cupo
#               (glm, deepseek, gemini, haiku)
#   VERIFICACION=ninguna  para tareas que no tocan código (informes, borradores, datos)
#
# Worktrees y logs viven FUERA del repo y con prefijo "ht-": el directorio padre lo comparten
# otros proyectos que usan el mismo sistema, y sin prefijo se pisarían los worktrees y el registro.
set -uo pipefail

TAREA="$1"; EJECUTORES="$2"; ENCARGO="$3"; BASE="${4:-main}"
VERIFICACION="${VERIFICACION:-completa}"
RAIZ="$(git -C "$(dirname "$0")" rev-parse --show-toplevel)"
PADRE="$(dirname "$RAIZ")"
WT="$PADRE/ht-wt-tarea-$TAREA"
LOGS="$PADRE/ht-agentes-logs"
mkdir -p "$LOGS"
[ -f "$LOGS/registro.csv" ] || echo "fecha,tarea,ejecutor,modelo,segundos,resultado,commits" > "$LOGS/registro.csv"

if [ ! -d "$WT" ]; then
  git -C "$RAIZ" worktree add -q "$WT" -b "tarea/$TAREA" "$BASE" || exit 1
  ln -s "$RAIZ/node_modules" "$WT/node_modules"
fi

PROMPT="$(cat "$ENCARGO")"
CUPO='429|RESOURCE_EXHAUSTED|[Qq]uota|[Rr]ate.?limit|[Tt]oo [Mm]any [Rr]equests|insufficient'

# Permisos de Haiku: edita y prueba, pero no construye, no instala y no toca secretos.
HAIKU_PERMITIDO=("Read" "Edit" "Write" "Glob" "Grep" "Bash(ls:*)" "Bash(git status:*)" "Bash(git diff:*)"
  "Bash(git log:*)" "Bash(git show:*)" "Bash(git add:*)" "Bash(git commit:*)" "Bash(npm test:*)"
  "Bash(npm run typecheck:*)" "Bash(npx jest:*)")
HAIKU_PROHIBIDO=("Read(**/.env*)" "Read(.mcp.json)" "WebFetch" "WebSearch")

extraer_sesion() { # $1=ejecutor, $2=archivo_json
  local e="$1" f="$2"
  case "$e" in
    gemini) node -e 'try{const j=require(process.argv[1]);console.log(j.conversation_id||"")}catch{}' "$f" ;;
    deepseek|glm)
      # opencode --format json emite líneas JSON (JSONL) con sessionID
      node -e 'const fs=require("fs");try{for(const l of fs.readFileSync(process.argv[1],"utf8").split("\n")){if(!l.trim())continue;const j=JSON.parse(l);if(j.sessionID||j.session_id){console.log(j.sessionID||j.session_id);break}}}catch{}' "$f" ;;
    haiku) node -e 'try{const j=require(process.argv[1]);console.log(j.session_id||"")}catch{}' "$f" ;;
  esac
}

continuar_sesion() { # $1=ejecutor, $2=id_sesion, $3=mensaje, $4=out, $5=err
  local e="$1" sid="$2" msg="$3" out="$4" err="$5"
  case "$e" in
    gemini)
      (cd "$WT" && agy -p "$msg" --conversation "$sid" --model "$MODELO" --output-format json --print-timeout 15m) >"$out" 2>>"$err" ;;
    deepseek|glm)
      if [ -n "$sid" ]; then
        OPENCODE_CONFIG="$RAIZ/scripts/agentes/opencode-ejecutor.json" timeout 900 \
          opencode run -s "$sid" --dir "$WT" -m "$MODELO" --format json "$msg" >"$out" 2>>"$err"
      else
        OPENCODE_CONFIG="$RAIZ/scripts/agentes/opencode-ejecutor.json" timeout 900 \
          opencode run --dir "$WT" -m "$MODELO" --format json "$msg" >"$out" 2>>"$err"
      fi ;;
    haiku)
      (cd "$WT" && timeout 900 claude -p "$msg" --resume "$sid" --model haiku --output-format json --permission-mode acceptEdits \
        --allowedTools "${HAIKU_PERMITIDO[@]}" --disallowedTools "${HAIKU_PROHIBIDO[@]}") >"$out" 2>>"$err" ;;
  esac
}

ejecutar() {
  local e="$1" out="$LOGS/tarea-$TAREA-$1.json" err="$LOGS/tarea-$TAREA-$1.err"
  case "$e" in
    gemini)
      MODELO="gemini-3.8-flash-high"
      (cd "$WT" && agy -p "$PROMPT" --model "$MODELO" --output-format json --print-timeout 19m) >"$out" 2>"$err"
      local denied
      denied=$(node -e 'try{const j=require(process.argv[1]);if((j.denied_actions||[]).length)console.log(j.conversation_id||"")}catch{}' "$out")
      if [ -n "$denied" ]; then
        echo "agy se cortó por comando no permitido; reanudando $denied..." >&2
        continuar_sesion gemini "$denied" "Continúa donde lo dejaste usando solo comandos permitidos uno a uno sin tuberías. Haz commit al terminar." "$out.cont" "$err"
      fi ;;
    deepseek|glm)
      [ "$e" = deepseek ] && MODELO="opencode/deepseek-v4.1-flash-free" || MODELO="opencode/glm-5.3-flash-free"
      # opencode guarda su estado en SQLite: dos procesos que arrancan a la vez chocan con
      # "database is locked" y mueren al instante. Si pasa, se reintenta tras una espera al azar.
      local intento rc
      for intento in 1 2 3 4; do
        OPENCODE_CONFIG="$RAIZ/scripts/agentes/opencode-ejecutor.json" timeout 1200 \
          opencode run --dir "$WT" -m "$MODELO" --format json "$PROMPT" >"$out" 2>"$err"; rc=$?
        grep -q "database is locked" "$err" 2>/dev/null || break
        sleep $(( RANDOM % 8 + 3 ))
      done
      return $rc ;;
    haiku)
      MODELO="claude-haiku (claude -p)"
      (cd "$WT" && timeout 1200 claude -p "$PROMPT" --model haiku --output-format json --permission-mode acceptEdits \
        --allowedTools "${HAIKU_PERMITIDO[@]}" --disallowedTools "${HAIKU_PROHIBIDO[@]}") >"$out" 2>"$err" ;;
    *) echo "ejecutor desconocido: $e" >&2; return 2 ;;
  esac
}

# El build reescribe public/ (que está versionado) y siempre toca ~4 líneas por página por el hash
# anticaché de HEAD. Si la tarea cambia src/ o la config del build, el resultado se commitea; si no,
# sería ruido puro y se descarta.
asentar_public() {
  git -C "$WT" diff --quiet -- public && return 0
  if git -C "$WT" diff --name-only "$BASE...HEAD" | grep -Eq '^(src/|\.eleventy\.js|tailwind\.config\.js|scripts/build-)'; then
    git -C "$WT" add public && git -C "$WT" commit -q -m "Regenera public/ con el build

Salida del build tras los cambios de esta tarea. La genera lanzar.sh, no el ejecutor."
  else
    git -C "$WT" checkout -q -- public
  fi
}

verificar_worktree() { # Devuelve 0 si todo está OK; si no, imprime el fallo
  local fallo="" sin_guardar
  sin_guardar=$(git -C "$WT" status --porcelain | grep -v '^??' || true)
  if [ -n "$sin_guardar" ]; then
    fallo+="Archivos modificados sin commit:\n$sin_guardar\n"
  fi
  if [ "$VERIFICACION" = completa ]; then
    local check_out
    if ! check_out=$(cd "$WT" && npm run verificar 2>&1); then
      fallo+="Fallo en verificación (tests/typecheck/build):\n$(echo "$check_out" | tail -n 45)\n"
    fi
    asentar_public
  fi
  if [ -n "$fallo" ]; then
    echo -e "$fallo"
    return 1
  fi
  return 0
}

IFS=',' read -ra LISTA <<< "$EJECUTORES"
for e in "${LISTA[@]}"; do
  ANTES=$(git -C "$WT" rev-list --count HEAD)
  INICIO=$(date +%s)
  ejecutar "$e"; CODIGO=$?
  COMMITS=$(( $(git -C "$WT" rev-list --count HEAD) - ANTES ))

  if grep -Eq "$CUPO" "$LOGS/tarea-$TAREA-$e.err" "$LOGS/tarea-$TAREA-$e.json" 2>/dev/null && [ "$COMMITS" -eq 0 ]; then
    SEG=$(( $(date +%s) - INICIO ))
    echo "$(date -u +%FT%TZ),$TAREA,$e,$MODELO,$SEG,sin_cupo,0" >> "$LOGS/registro.csv"
    echo "Sin cupo en $e; limpiando y pasando al siguiente."
    git -C "$WT" reset -q --hard "$BASE" && git -C "$WT" clean -qfd
    continue
  fi

  # Pre-filtro en Bash (0 tokens de Claude): si falla algo, 1 intento de autocorrección
  FALLO_VERIF=""
  if [ "$CODIGO" -eq 0 ]; then
    if ! FALLO_VERIF=$(verificar_worktree); then
      echo "$e terminó pero falló la pre-verificación. Pidiendo autocorrección automática..." >&2
      SID=$(extraer_sesion "$e" "$LOGS/tarea-$TAREA-$e.json")
      MSG_CORR="Tu entrega aún no pasa la verificación automática. Corrige estos errores, ejecuta npm test y npm run typecheck, y haz commit en español de los cambios (no commitees public/: lo regenera el script):

$FALLO_VERIF"
      continuar_sesion "$e" "$SID" "$MSG_CORR" "$LOGS/tarea-$TAREA-$e.fix.json" "$LOGS/tarea-$TAREA-$e.err"
      FALLO_VERIF=$(verificar_worktree) || true
    fi
  fi

  SEG=$(( $(date +%s) - INICIO ))
  COMMITS=$(( $(git -C "$WT" rev-list --count HEAD) - ANTES ))
  SIN_GUARDAR=$(git -C "$WT" status --porcelain | grep -vc '^??' || true)

  if [ "$CODIGO" -eq 124 ]; then RESULTADO="tiempo_agotado"
  elif [ "$CODIGO" -ne 0 ]; then RESULTADO="error_$CODIGO"
  elif [ "$SIN_GUARDAR" -gt 0 ]; then RESULTADO="cortado_sin_commit"
  elif [ -n "$FALLO_VERIF" ]; then RESULTADO="falla_verificacion"
  else RESULTADO="terminado_verificado"; fi

  echo "$(date -u +%FT%TZ),$TAREA,$e,$MODELO,$SEG,$RESULTADO,$COMMITS" >> "$LOGS/registro.csv"

  # Informe pre-digerido para ahorrar lecturas a quien revise
  {
    echo "=== RESUMEN TAREA $TAREA ($e - $RESULTADO en ${SEG}s) ==="
    echo "--- Commits ($COMMITS) ---"
    git -C "$WT" log --oneline "$BASE..HEAD"
    echo "--- Archivos tocados fuera de public/ (--stat) ---"
    git -C "$WT" diff "$BASE...HEAD" --stat -- . ':(exclude)public'
    echo "--- Estado verificación ($VERIFICACION: tests + build) ---"
    if [ -z "$FALLO_VERIF" ]; then echo "VERDE (OK)"; else echo -e "$FALLO_VERIF"; fi
  } > "$LOGS/resumen-$TAREA.txt"

  echo "$e ($MODELO): $RESULTADO en ${SEG}s, $COMMITS commits. Resumen: $LOGS/resumen-$TAREA.txt"
  exit 0
done
echo "Ningún ejecutor disponible."; exit 3
