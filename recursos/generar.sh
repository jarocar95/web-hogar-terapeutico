#!/usr/bin/env bash
# Genera todos los materiales en recursos/salida/.
# Uso:  ./generar.sh            (todos)
#       ./generar.sh ventana    (solo uno)
set -euo pipefail
cd "$(dirname "$0")"

if [ ! -d venv ]; then
  echo "· creando entorno"
  python3 -m venv venv
  ./venv/bin/pip install -q -r requirements.txt
fi

objetivos=("${@:-}")
if [ -z "${objetivos[0]}" ]; then
  objetivos=(registro distorsiones autoregistro ventana vago)
fi

for g in "${objetivos[@]}"; do
  echo "· $g"
  ./venv/bin/python "generadores/$g.py"
done
echo "→ recursos/salida/"
