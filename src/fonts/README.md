# Fuentes autoalojadas

Los `.woff2` de esta carpeta se generan a partir de las descargas de Google
Fonts que hay en `/fonts` (en la raiz del repo), con:

    pip install fonttools brotli
    python3 scripts/build-fonts.py

Se versionan para que ni el build normal ni Netlify necesiten Python. Solo hay
que volver a ejecutarlo si se cambia de tipografia o de rango de pesos.

Ambas familias son SIL Open Font License: los archivos `OFL-*.txt` que genera
el script tienen que acompanar a las fuentes.
