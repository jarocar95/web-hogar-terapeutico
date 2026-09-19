# -*- coding: utf-8 -*-
"""Guia del nervio vago, version a una columna.

Alternativa a generadores/vago.py. A todo el ancho de la caja saldrian 110
caracteres por linea, que no se lee; asi que los rotulos se van a un carril
izquierdo y el texto se queda en una medida de unos 65 caracteres.
"""
import os, sys, json
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SALIDA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'salida')
os.makedirs(SALIDA_DIR, exist_ok=True)

from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from marca import *

SALIDA = os.path.join(SALIDA_DIR, 'Tecnicas para activar el nervio vago (1 columna) - Hogar Terapeutico.pdf')
cargar_fuentes()
D = json.load(open(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                                'contenido', 'vago.json'), encoding='utf-8'))
SUST = {'₂': '2', '≈': 'unas '}
def limpiar(v):
    if isinstance(v, str):
        for a, b in SUST.items():
            v = v.replace(a, b)
        return v.replace('( unas', '(unas').replace('  ', ' ')
    if isinstance(v, list):  return [limpiar(x) for x in v]
    if isinstance(v, dict):  return {k: limpiar(x) for k, x in v.items()}
    return v
D = limpiar(D)

CON_PRECAUCION = {6, 14}

W, H = A4
IZQ, ARRIBA, ABAJO = 62, 40, 46
CARRIL, TEXTO = 74, 352          # rotulos a la izquierda, texto a la derecha
XT = IZQ + CARRIL
CUERPO, SALTO = 9.4, 12.6

c = canvas.Canvas(SALIDA, pagesize=(W, H))
c.setTitle('Técnicas para activar el nervio vago')
c.setAuthor('Angie Sánchez Gallego · Hogar Terapéutico')
c.setSubject('Recurso psicoeducativo: nervio vago y sistema parasimpático')
c.setCreator('hogarterapeutico.com')


def rotulo(txt, y, tinta):
    c.setFont('PS-b', 7.4); c.setFillColor(tinta)
    c.drawRightString(XT - 14, y, txt.upper())


def parrafo(txt, y, cuerpo=CUERPO, tinta=INK, ancho=TEXTO, x=None):
    c.setFont('PS', cuerpo); c.setFillColor(tinta)
    for linea in cortar(txt, 'PS', cuerpo, ancho):
        c.drawString(x if x is not None else XT, y, linea); y -= SALTO
    return y


def alto_tecnica(t):
    alto = 6 + len(cortar(t['titulo'], 'PS-b', 12.2, TEXTO)) * 15
    alto += 15 if t['n'] in CON_PRECAUCION else 0
    alto += len(cortar(t['porque'], 'PS', CUERPO, TEXTO)) * SALTO + 8
    for p in t['pasos']:
        alto += len(cortar(p, 'PS', CUERPO, TEXTO - 12)) * SALTO
    alto += 8 + len(cortar(t['cuando'], 'PS', CUERPO, TEXTO)) * SALTO
    return alto + 26


def cabecera_pagina():
    y = membrete(c, W, H, IZQ, ancho_logo=46, cuerpo_marca=11, ficha=False) - 14
    c.setFont('PS', 7.2); c.setFillColor(INK_MUTE)
    c.drawRightString(W - 48, y + 16, 'Técnicas para calmar el sistema nervioso')
    return y


fondo(c, W, H)
y = membrete(c, W, H, IZQ) - 28
c.setFont('FR-b', 22); c.setFillColor(CLAY_600)
c.drawString(IZQ, y, 'Técnicas para calmar')
y -= 24
c.drawString(IZQ, y, 'el sistema nervioso')
y -= 16
c.setFont('PS-b', 8.8); c.setFillColor(SAGE_700)
c.drawString(IZQ, y, 'Nervio vago y sistema parasimpático · recurso psicoeducativo')
y -= 18
y = parrafo(D['intro'], y, cuerpo=9.0, tinta=INK_MUTE, ancho=W - IZQ - 62, x=IZQ)
y -= 12

SUELO = ABAJO
bloques = set()
for t in D['tecnicas']:
    if t['bloque'] not in bloques:
        titulo = ('Bloque A · Para recuperar la calma en el momento' if t['bloque'] == 'A'
                  else 'Bloque B · Para fortalecer el tono vagal a largo plazo')
        if y - 60 < SUELO:
            c.showPage(); fondo(c, W, H); y = cabecera_pagina()
        y -= 10
        c.setFillColor(SAGE_100)
        c.roundRect(IZQ, y - 6, W - IZQ - 62, 20, 6, stroke=0, fill=1)
        c.setFont('PS-b', 9.0); c.setFillColor(SAGE_700)
        c.drawString(IZQ + 10, y, titulo)
        y -= 34
        bloques.add(t['bloque'])

    if y - alto_tecnica(t) < SUELO:
        c.showPage(); fondo(c, W, H); y = cabecera_pagina()

    c.setFont('PS-b', 12.2); c.setFillColor(SAGE_200)
    c.drawRightString(XT - 14, y, f"{t['n']:02d}")
    c.setFillColor(SAGE_700)
    for i, linea in enumerate(cortar(t['titulo'], 'PS-b', 12.2, TEXTO)):
        c.drawString(XT, y - i * 15, linea)
    y -= len(cortar(t['titulo'], 'PS-b', 12.2, TEXTO)) * 15 + 4

    if t['n'] in CON_PRECAUCION:
        c.setFillColor(CLAY_100); c.roundRect(XT, y - 3, 148, 12.5, 6, stroke=0, fill=1)
        c.setFillColor(CLAY_500); c.circle(XT + 9, y + 3.2, 2.6, stroke=0, fill=1)
        c.setFont('PS-b', 6.8); c.setFillColor(CLAY_700)
        c.drawString(XT + 16, y + 0.8, 'CON PRECAUCIÓN · VER NOTA FINAL')
        y -= 17

    rotulo('Por qué', y, SAGE_500)
    y = parrafo(t['porque'], y) - 8
    rotulo('Cómo', y, SAGE_500)
    for p in t['pasos']:
        c.setFillColor(SAGE_300); c.circle(XT + 2.8, y + 3.2, 1.6, stroke=0, fill=1)
        for linea in cortar(p, 'PS', CUERPO, TEXTO - 12):
            c.setFont('PS', CUERPO); c.setFillColor(INK)
            c.drawString(XT + 12, y, linea); y -= SALTO
    y -= 8
    rotulo('Cuándo', y, SAGE_500)
    y = parrafo(t['cuando'], y, tinta=INK_MUTE) - 12
    c.setStrokeColor(CLAY_100); c.setLineWidth(0.7)
    c.line(IZQ, y + 6, W - 62, y + 6)
    y -= 14

# --- consejos y nota --------------------------------------------------------
ancho_caja = W - IZQ - 62
lineas = [cortar(x, 'PS', CUERPO, ancho_caja - 32) for x in D['consejos']]
alto = 26 + sum(len(l) for l in lineas) * SALTO + 12
if y - alto < SUELO:
    c.showPage(); fondo(c, W, H); y = cabecera_pagina()
c.setFillColor(SAGE_50); c.roundRect(IZQ, y - alto + 12, ancho_caja, alto, 8, stroke=0, fill=1)
c.setFont('PS-b', 10); c.setFillColor(SAGE_700)
c.drawString(IZQ + 14, y - 4, 'Para sacarles partido')
yy = y - 24
for grupo in lineas:
    c.setFillColor(SAGE_200); c.circle(IZQ + 18, yy + 3.2, 1.6, stroke=0, fill=1)
    for linea in grupo:
        c.setFont('PS', CUERPO); c.setFillColor(INK)
        c.drawString(IZQ + 26, yy, linea); yy -= SALTO
y = y - alto - 6

ln = cortar(D['nota'], 'PS', CUERPO, ancho_caja - 28)
alto = 26 + len(ln) * SALTO + 12
if y - alto < SUELO:
    c.showPage(); fondo(c, W, H); y = cabecera_pagina()
c.setFillColor(CLAY_50); c.roundRect(IZQ, y - alto + 12, ancho_caja, alto, 8, stroke=0, fill=1)
c.setStrokeColor(CLAY_300); c.setLineWidth(2.6)
c.line(IZQ + 1.3, y - alto + 16, IZQ + 1.3, y + 8)
c.setFont('PS-b', 10); c.setFillColor(CLAY_600)
c.drawString(IZQ + 14, y - 4, 'Una nota importante')
yy = y - 24
for linea in ln:
    c.setFont('PS', CUERPO); c.setFillColor(INK)
    c.drawString(IZQ + 14, yy, linea); yy -= SALTO

c.save()
print('PDF generado')
