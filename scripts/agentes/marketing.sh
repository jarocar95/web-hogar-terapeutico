#!/usr/bin/env bash
# Departamento de marketing: Gemini (agy) diseña la parrilla semanal. Principal y respaldo configurables.
#   scripts/agentes/marketing.sh <lunes AAAA-MM-DD> [notas-de-Javi.txt] [rama-o-commit]
# Principal: gemini-3.8-flash-high. Respaldo: gemini-3.8-flash-medium (MK_MODELO / MK_RESPALDO lo cambian).
# Flujo: encargo → parrilla.json + informe.md → `validar-parrilla.js` → hasta 2 rondas de corrección con el
# mismo modelo → si sigue mal o no hay cupo, empieza de cero con el respaldo.
#
# Gemini trabaja en un worktree aparte (../ht-wt-marketing), no en tu árbol: solo se copia a
# docs/marketing/semanas/<lunes>/ lo que pasa la validación, y cualquier otro cambio suyo se descarta y se avisa.
# El contenido del brief y del validador tiene que estar commiteado en <rama-o-commit> (por defecto HEAD).
set -uo pipefail

LUNES="${1:?Uso: marketing.sh <lunes AAAA-MM-DD> [notas.txt] [rama]}"; NOTAS="${2:-}"; REF="${3:-HEAD}"
RAIZ="$(git -C "$(dirname "$0")" rev-parse --show-toplevel)"
PADRE="$(dirname "$RAIZ")"
WT="$PADRE/ht-wt-marketing"
LOGS="$PADRE/ht-agentes-logs"; mkdir -p "$LOGS"
[ -f "$LOGS/registro.csv" ] || echo "fecha,tarea,ejecutor,modelo,segundos,resultado,commits" > "$LOGS/registro.csv"
MODELO="${MK_MODELO:-gemini-3.8-flash-high}"; RESPALDO="${MK_RESPALDO:-gemini-3.8-flash-medium}"
CUPO='429|RESOURCE_EXHAUSTED|[Qq]uota|[Rr]ate.?limit|[Tt]oo [Mm]any [Rr]equests'

read -r DESDE HASTA < <(node -e '
  const d=new Date(process.argv[1]+"T00:00:00Z");
  if(isNaN(d)||d.getUTCDay()!==1){console.error("La fecha debe ser un lunes AAAA-MM-DD");process.exit(1)}
  const h=new Date(d.getTime()+6*864e5); const f=x=>x.toISOString().slice(0,10); console.log(f(d),f(h));' "$LUNES") || exit 2

DIR="docs/marketing/semanas/$LUNES"

[ -d "$WT" ] || git -C "$RAIZ" worktree add -q --detach "$WT" "$REF" || exit 1
git -C "$WT" checkout -q --detach "$REF" && git -C "$WT" reset -q --hard && git -C "$WT" clean -qfd
# Las semanas anteriores ya aprobadas viven en el árbol principal (sin commitear): se copian para no repetir temas.
[ -d "$RAIZ/docs/marketing/semanas" ] && mkdir -p "$WT/docs/marketing/semanas" && cp -R "$RAIZ/docs/marketing/semanas/." "$WT/docs/marketing/semanas/" 2>/dev/null
[ -f "$RAIZ/docs/marketing/metricas.md" ] && cp "$RAIZ/docs/marketing/metricas.md" "$WT/docs/marketing/metricas.md"
rm -rf "$WT/$DIR"; mkdir -p "$WT/$DIR"

PROMPT="Eres el departamento de marketing de Hogar Terapéutico. Lee primero docs/marketing/BRIEF.md y sigue sus reglas al pie de la letra; después PRODUCT.md y docs/00-contexto-proyecto.md y docs/01-marketing.md.
Diseña la parrilla de la semana del lunes $DESDE al domingo $HASTA: campos semana=\"$DESDE\", desde=\"$DESDE\", hasta=\"$HASTA\".
Mira docs/marketing/semanas/ para no repetir temas de semanas anteriores, docs/marketing/metricas.md para saber si hay datos (si no, no inventes rendimiento) y los artículos publicados en src/blog/*.md (título y descripción del frontmatter) por si alguno sirve para el carrusel.
Escribe SOLO estos archivos: $DIR/parrilla.json (formato de docs/marketing/ejemplo-parrilla.json) y $DIR/informe.md.
No ejecutes comandos de terminal: lee y escribe archivos nada más. No toques ningún otro archivo del repositorio.
${NOTAS:+
Notas para esta semana (de Javi o de la revisión; prioridad alta):
$(cat "$NOTAS")}"

ejecutar() { # $1=modelo  $2=prompt  [$3=conversación]  → deja la respuesta en $OUT y el id en $CONV
  OUT="$LOGS/marketing-$LUNES-$1.json"
  if [ -n "${3:-}" ]; then
    (cd "$WT" && agy -p "$2" --conversation "$3" --model "$1" --mode accept-edits --output-format json --print-timeout 25m) >"$OUT" 2>>"$OUT.err"
  else
    (cd "$WT" && agy -p "$2" --model "$1" --mode accept-edits --output-format json --print-timeout 25m) >"$OUT" 2>"$OUT.err"
  fi
  CONV=$(node -e 'try{console.log(JSON.parse(require("fs").readFileSync(process.argv[1],"utf8")).conversation_id||"")}catch{}' "$OUT")
}
sin_cupo() { grep -Eq "$CUPO" "$OUT" "$OUT.err" 2>/dev/null; }
validar() { (cd "$WT" && node scripts/agentes/validar-parrilla.js "$DIR/parrilla.json" 2>&1); }

intentar() { # $1=modelo → 0 si la parrilla queda válida
  local m="$1" ronda=0 prompt="$PROMPT" conv=""
  while [ "$ronda" -le 2 ]; do
    ejecutar "$m" "$prompt" "$conv"; conv="$CONV"
    if sin_cupo && [ ! -s "$WT/$DIR/parrilla.json" ]; then echo "Sin cupo en $m." >&2; return 2; fi
    if [ ! -s "$WT/$DIR/parrilla.json" ]; then
      prompt="No has escrito $DIR/parrilla.json. Escríbelo ahora con las herramientas de archivos, sin comandos de terminal."
    else
      INFORME=$(validar) && { echo "$INFORME"; return 0; }
      echo "$INFORME" >&2
      prompt="La validación automática ha rechazado la parrilla. Corrige $DIR/parrilla.json (y solo ese archivo) y devuélvelo completo. Errores:

$INFORME"
    fi
    ronda=$((ronda + 1))
  done
  return 1
}

INICIO=$(date +%s)
echo "Marketing · semana $DESDE → $HASTA · modelo $MODELO (respaldo $RESPALDO)"
RES="ok"; USADO="$MODELO"
if ! intentar "$MODELO"; then
  echo "Paso al respaldo $RESPALDO" >&2
  rm -f "$WT/$DIR/parrilla.json"; USADO="$RESPALDO"
  intentar "$RESPALDO" && RES="ok_respaldo" || RES="fallo"
fi

# Alcance: marketing solo escribe en su carpeta. Lo demás se descarta y se avisa.
FUERA=$(git -C "$WT" status --porcelain | awk '{print $2}' | grep -v "^docs/marketing/semanas/" || true)
[ -n "$FUERA" ] && echo "⚠ Gemini tocó archivos fuera de $DIR; se descartan:
$FUERA" >&2

if [ "$RES" != "fallo" ]; then
  mkdir -p "$RAIZ/$DIR" && cp "$WT/$DIR/"* "$RAIZ/$DIR/"
fi
echo "$(date -u +%FT%TZ),marketing-$LUNES,gemini,$USADO,$(( $(date +%s) - INICIO )),$RES,0" >> "$LOGS/registro.csv"
if [ "$RES" = "fallo" ]; then echo "La parrilla no pasa la validación: revisa $WT/$DIR/ y los errores de arriba." >&2; exit 1; fi
echo "Parrilla lista: $DIR/parrilla.json (informe: $DIR/informe.md). Siguiente: revisor-contenido y aprobación de Angie (guion) y Javi."
