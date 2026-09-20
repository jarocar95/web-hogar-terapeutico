#!/usr/bin/env bash
# Genera los materiales en recursos/salida/.
#   ./generar.sh              todos
#   ./generar.sh ventana      solo uno
#
# Los objetivos se descubren solos de generadores/: la lista a mano se quedaba
# corta cada vez que se aniadia un documento. Los que empiezan por _ son
# ayudantes y no se ejecutan sueltos.
set -euo pipefail
cd "$(dirname "$0")"

if [ ! -d venv ]; then
  echo "· creando entorno"
  python3 -m venv venv
  ./venv/bin/pip install -q -r requirements.txt
fi

if [ "$#" -gt 0 ]; then
  objetivos=("$@")
else
  objetivos=()
  for f in generadores/*.py; do
    n=$(basename "$f" .py)
    [[ "$n" == _* ]] && continue
    objetivos+=("$n")
  done
fi

for g in "${objetivos[@]}"; do
  echo "· $g"
  ./venv/bin/python "generadores/$g.py"
done
echo "→ recursos/salida/"
