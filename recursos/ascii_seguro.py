# -*- coding: utf-8 -*-
r"""Deja un fichero de codigo en ASCII puro.

Por que hace falta: el portapapeles de macOS etiqueta lo que copia como Mac
Roman. Al pegar en el editor de Apps Script, cada "o" acentuada llegaba como
dos simbolos raros y los enunciados del cuestionario quedaban inservibles.

Con los acentos escapados a \uXXXX el fichero es ASCII y da igual por donde
viaje: JavaScript los resuelve al ejecutar. Dentro de cadenas se escapan; fuera
(comentarios) se translitera, porque ahi solo importa poder leerlo.
"""

TRANS = str.maketrans({
    'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u',
    'Á': 'A', 'É': 'E', 'Í': 'I', 'Ó': 'O', 'Ú': 'U',
    'ñ': 'n', 'Ñ': 'N', 'ü': 'u', 'Ü': 'U',
    '¿': '?', '¡': '!', '·': '-', '—': '-', '–': '-',
    '«': '"', '»': '"', '“': '"', '”': '"', '’': "'", '…': '...',
})


def a_ascii(src):
    salida, i, n = [], 0, len(src)
    while i < n:
        ch = src[i]
        if ch in '"\'':
            cierre, j, lit = ch, i + 1, [ch]
            while j < n:
                if src[j] == '\\':                    # escape ya existente
                    lit.append(src[j:j + 2]); j += 2; continue
                if src[j] == cierre:
                    lit.append(cierre); j += 1; break
                if src[j] == '\n':                    # cadena sin cerrar: se deja
                    break
                lit.append(src[j] if ord(src[j]) < 128 else '\\u%04x' % ord(src[j]))
                j += 1
            salida.append(''.join(lit)); i = j; continue
        salida.append(ch if ord(ch) < 128 else ch.translate(TRANS))
        i += 1
    texto = ''.join(salida)
    restos = sorted({c for c in texto if ord(c) > 127})
    if restos:
        raise ValueError(f'quedan caracteres no ASCII: {restos}')
    return texto
