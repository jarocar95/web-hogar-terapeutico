#!/usr/bin/env python3
"""
Prepara las fuentes autoalojadas a partir de las descargas de Google Fonts.

Se ejecuta a mano, solo cuando cambian las fuentes. El resultado (src/fonts/)
va versionado, asi que ni el build normal ni Netlify necesitan Python.

    pip install fonttools brotli
    python3 scripts/build-fonts.py

Que hace, y por que:

1. Recorta a latino + latino extendido. Frank Ruhl Libre es una tipografia
   hebrea ademas de latina: trae 53 caracteres hebreos que esta web no usa.

2. Limita el eje de peso al rango que usamos de verdad. Son fuentes variables
   (un solo archivo cubre todos los pesos), pero guardar interpolacion para
   pesos que nadie pide ocupa: recortar 300-900 a 400-700 en Frank Ruhl Libre
   ahorra unos 10 KB.

3. Convierte a WOFF2, que es el formato de la web. Los TTF que descarga Google
   pesan el triple.

4. Copia las licencias OFL, que ambas familias exigen redistribuir.
"""
import shutil
import sys
from pathlib import Path

try:
    from fontTools.ttLib import TTFont
    from fontTools.subset import Subsetter, Options
    from fontTools.varLib import instancer
except ImportError:
    sys.exit("Falta fonttools. Instala con:  pip install fonttools brotli")

RAIZ = Path(__file__).resolve().parent.parent
ORIGEN = RAIZ / "fonts"
DESTINO = RAIZ / "src" / "fonts"

# Los mismos rangos que sirve Google para 'latin' y 'latin-ext'.
RANGOS = (
    "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,"
    "U+0304,U+0308,U+0329,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,"
    "U+2212,U+2215,U+FEFF,U+FFFD,"
    "U+0100-02AF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,"
    "U+2113,U+2C60-2C7F,U+A720-A7FF"
)

CARACTERISTICAS = ["kern", "liga", "clig", "calt", "ccmp", "locl", "mark", "mkmk"]

# (archivo de origen, nombre de salida, rango de peso que usamos)
FUENTES = [
    ("Frank_Ruhl_Libre/FrankRuhlLibre-VariableFont_wght.ttf", "frank-ruhl-libre-var", (400, 700)),
    ("Public_Sans/PublicSans-VariableFont_wght.ttf",          "public-sans-var",      (300, 700)),
    ("Public_Sans/PublicSans-Italic-VariableFont_wght.ttf",   "public-sans-italic-var", (400, 600)),
]

LICENCIAS = [
    ("Frank_Ruhl_Libre/OFL.txt", "OFL-Frank-Ruhl-Libre.txt"),
    ("Public_Sans/OFL.txt",      "OFL-Public-Sans.txt"),
]


def parse_unicodes(spec: str) -> set[int]:
    codigos: set[int] = set()
    for trozo in spec.split(","):
        trozo = trozo.strip().removeprefix("U+")
        if "-" in trozo:
            ini, fin = trozo.split("-")
            codigos.update(range(int(ini, 16), int(fin, 16) + 1))
        else:
            codigos.add(int(trozo, 16))
    return codigos


def main() -> None:
    if not ORIGEN.is_dir():
        sys.exit(f"No encuentro {ORIGEN}. Descarga las familias de Google Fonts y descomprimelas ahi.")

    DESTINO.mkdir(parents=True, exist_ok=True)
    unicodes = parse_unicodes(RANGOS)
    total = 0

    for relativo, nombre, (peso_min, peso_max) in FUENTES:
        entrada = ORIGEN / relativo
        if not entrada.is_file():
            sys.exit(f"No encuentro {entrada}")

        fuente = TTFont(entrada)
        original = entrada.stat().st_size

        instancer.instantiateVariableFont(
            fuente, {"wght": (peso_min, peso_max)}, inplace=True, updateFontNames=False
        )

        opciones = Options()
        opciones.layout_features = CARACTERISTICAS
        opciones.drop_tables += ["DSIG"]
        opciones.hinting = False
        opciones.desubroutinize = True
        opciones.name_IDs = ["*"]
        opciones.notdef_outline = True

        subsetter = Subsetter(options=opciones)
        subsetter.populate(unicodes=unicodes)
        subsetter.subset(fuente)

        fuente.flavor = "woff2"
        salida = DESTINO / f"{nombre}.woff2"
        fuente.save(salida)

        final = salida.stat().st_size
        total += final
        print(f"  {salida.name:28} {original/1024:6.1f} KB TTF  ->  {final/1024:6.1f} KB WOFF2"
              f"   (peso {peso_min}-{peso_max})")

    for relativo, nombre in LICENCIAS:
        origen = ORIGEN / relativo
        if origen.is_file():
            shutil.copy2(origen, DESTINO / nombre)
            print(f"  {nombre:28} licencia copiada")

    print(f"\nTotal servido: {total/1024:.1f} KB en {len(FUENTES)} archivos.")
    print("La cursiva solo se descarga si la pagina pinta texto en cursiva.")


if __name__ == "__main__":
    main()
