import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SALIDA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'salida')
os.makedirs(SALIDA_DIR, exist_ok=True)
# -*- coding: utf-8 -*-
"""Guia de tecnicas para activar el nervio vago, con la marca de Hogar Terapeutico."""
import json
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from marca import *

SALIDA = os.path.join(SALIDA_DIR, 'Tecnicas para activar el nervio vago - Hogar Terapeutico.pdf')
cargar_fuentes()
D = json.load(open(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'contenido', 'vago.json'), encoding='utf-8'))

# Public Sans no trae el subindice ni el signo de aproximado: sin esto salen como
# hueco en blanco y nadie se entera de por que falta algo.
SUSTITUCIONES = {'\u2082': '2', '\u2248': 'unas '}


def limpiar(v):
    if isinstance(v, str):
        for a, b in SUSTITUCIONES.items():
            v = v.replace(a, b)
        return v.replace('( unas', '(unas').replace('  ', ' ')
    if isinstance(v, list):
        return [limpiar(x) for x in v]
    if isinstance(v, dict):
        return {k: limpiar(x) for k, x in v.items()}
    return v


D = limpiar(D)

# Las dos que la nota final desaconseja con afeccion cardiaca, hipertension no
# controlada o embarazo. El original solo lo decia al final y remitia alli; aqui
# la advertencia va tambien en la tecnica, que es donde hace falta leerla.
CON_PRECAUCION = {6, 14}

W, H = A4
MARGEN, CANAL = 40, 24
COLS = 2
ANCHO_COL = (W - 2 * MARGEN - CANAL * (COLS - 1)) / COLS
CUERPO, SALTO = 8.3, 10.6

c = canvas.Canvas(SALIDA, pagesize=(W, H))
c.setTitle('Técnicas para activar el nervio vago')
c.setAuthor('Angie Sánchez Gallego · Hogar Terapéutico')
c.setSubject('Recurso psicoeducativo: nervio vago y sistema parasimpático')
c.setCreator('hogarterapeutico.com')


def lineas_rotulo(etiqueta, texto, ancho, cuerpo_etq=7.4):
    sangria = pdfmetrics.stringWidth(etiqueta.upper(), 'PS-b', cuerpo_etq) + 5
    lineas, actual, primera = [], '', True
    for p in texto.split():
        cabe = ancho - (sangria if primera else 0)
        prueba = f'{actual} {p}'.strip()
        if pdfmetrics.stringWidth(prueba, 'PS', CUERPO) <= cabe:
            actual = prueba
        else:
            lineas.append(actual); actual = p; primera = False
    if actual:
        lineas.append(actual)
    return sangria, lineas


def rotular(etiqueta, texto, x, y, ancho, tinta):
    sangria, lineas = lineas_rotulo(etiqueta, texto, ancho)
    c.setFont('PS-b', 7.4); c.setFillColor(tinta)
    c.drawString(x, y, etiqueta.upper())
    c.setFont('PS', CUERPO); c.setFillColor(INK)
    for i, linea in enumerate(lineas):
        c.drawString(x + (sangria if i == 0 else 0), y, linea); y -= SALTO
    return y


def alto_tecnica(t, ancho):
    lt = cortar(t['titulo'], 'PS-b', 10.0, ancho - 15)
    alto = 2 + len(lt) * 12 + (15 if t['n'] in CON_PRECAUCION else 0)
    alto += len(lineas_rotulo('Por qué', t['porque'], ancho)[1]) * SALTO + 3
    for p in t['pasos']:
        alto += len(cortar(p, 'PS', CUERPO, ancho - 9)) * SALTO
    alto += 3 + len(lineas_rotulo('Cuándo', t['cuando'], ancho)[1]) * SALTO
    return alto + 20


def dibuja_tecnica(t, x, y, ancho):
    c.setFont('PS-b', 7.4); c.setFillColor(SAGE_200)
    c.drawString(x, y + 4.4, f"{t['n']:02d}")
    lineas_tit = cortar(t['titulo'], 'PS-b', 10.0, ancho - 15)
    c.setFont('PS-b', 10.0); c.setFillColor(SAGE_700)
    for i, linea in enumerate(lineas_tit):
        c.drawString(x + 15, y + 3.4 - i * 12, linea)
    extra = 0
    if t['n'] in CON_PRECAUCION:
        # siempre en linea propia: pegada al titulo no se lee como aviso
        py = y + 0.4 - (len(lineas_tit) - 1) * 12 - 14
        c.setFillColor(CLAY_100); c.roundRect(x + 15, py, 132, 11.5, 5.5, stroke=0, fill=1)
        c.setFillColor(CLAY_500); c.circle(x + 23, py + 5.7, 2.4, stroke=0, fill=1)
        c.setFont('PS-b', 6.5); c.setFillColor(CLAY_700)
        c.drawString(x + 29, py + 3.6, 'CON PRECAUCIÓN · VER NOTA FINAL')
        extra = 15
    y -= 2 + len(lineas_tit) * 12 + extra
    y = rotular('Por qué', t['porque'], x, y, ancho, SAGE_500)
    y -= 3
    for p in t['pasos']:
        c.setFillColor(SAGE_300)
        c.circle(x + 2.6, y + 3, 1.5, stroke=0, fill=1)
        for i, linea in enumerate(cortar(p, 'PS', CUERPO, ancho - 9)):
            c.setFont('PS', CUERPO); c.setFillColor(INK)
            c.drawString(x + 9, y, linea); y -= SALTO
    y -= 3
    y = rotular('Cuándo', t['cuando'], x, y, ancho, SAGE_500)
    return y - 20


fondo(c, W, H)
y = membrete(c, W, H, MARGEN) - 28
c.setFont('FR-b', 21); c.setFillColor(CLAY_600)
c.drawString(MARGEN, y, 'Técnicas para calmar el sistema nervioso')
y -= 14
c.setFont('PS-b', 8.6); c.setFillColor(SAGE_700)
c.drawString(MARGEN, y, 'Nervio vago y sistema parasimpático · recurso psicoeducativo')
y -= 15
for linea in cortar(D['intro'], 'PS', 8.5, W - 2 * MARGEN):
    c.setFont('PS', 8.5); c.setFillColor(INK_MUTE)
    c.drawString(MARGEN, y, linea); y -= 11.0
y -= 8
c.setStrokeColor(SAGE_200); c.setLineWidth(0.7)
c.line(MARGEN, y, W - MARGEN, y)
y -= 20

TOPE, SUELO = y, MARGEN
col, cy = 0, y
bloque_hecho = set()


def nueva_columna():
    global col, cy, TOPE
    col += 1
    if col > COLS - 1:
        c.showPage(); fondo(c, W, H)
        TOPE = membrete(c, W, H, MARGEN, ancho_logo=46, cuerpo_marca=11, ficha=False) - 16
        c.setFont('PS', 7.2); c.setFillColor(INK_MUTE)
        c.drawRightString(W - MARGEN, TOPE + 18, 'Técnicas para calmar el sistema nervioso')
        col = 0
    cy = TOPE


for t in D['tecnicas']:
    if t['bloque'] not in bloque_hecho:
        titulo = ('Bloque A · Para recuperar la calma en el momento' if t['bloque'] == 'A'
                  else 'Bloque B · Para fortalecer el tono vagal a largo plazo')
        if cy - 46 < SUELO:
            nueva_columna()
        c.setFillColor(SAGE_100)
        c.roundRect(MARGEN + col * (ANCHO_COL + CANAL), cy - 4, ANCHO_COL, 17, 5, stroke=0, fill=1)
        c.setFont('PS-b', 8.4); c.setFillColor(SAGE_700)
        c.drawString(MARGEN + col * (ANCHO_COL + CANAL) + 8, cy + 1.5, titulo)
        cy -= 28
        bloque_hecho.add(t['bloque'])
    if cy - alto_tecnica(t, ANCHO_COL) < SUELO:
        nueva_columna()
    cy = dibuja_tecnica(t, MARGEN + col * (ANCHO_COL + CANAL), cy, ANCHO_COL)

# --- consejos y nota --------------------------------------------------------
lineas_cons = [cortar(x, 'PS', CUERPO, ANCHO_COL - 9) for x in D['consejos']]
alto_cons = 22 + sum(len(l) for l in lineas_cons) * SALTO + 12
if cy - alto_cons < SUELO:
    nueva_columna()
x = MARGEN + col * (ANCHO_COL + CANAL)
c.setFillColor(SAGE_50); c.roundRect(x, cy - alto_cons + 10, ANCHO_COL, alto_cons, 7, stroke=0, fill=1)
c.setFont('PS-b', 8.8); c.setFillColor(SAGE_700)
c.drawString(x + 10, cy - 4, 'Para sacarles partido')
yy = cy - 20
for grupo in lineas_cons:
    c.setFillColor(SAGE_200); c.circle(x + 13, yy + 3, 1.5, stroke=0, fill=1)
    for linea in grupo:
        c.setFont('PS', CUERPO); c.setFillColor(INK)
        c.drawString(x + 19, yy, linea); yy -= SALTO
cy = cy - alto_cons - 8

lineas_nota = cortar(D['nota'], 'PS', CUERPO, ANCHO_COL - 20)
alto_nota = 22 + len(lineas_nota) * SALTO + 10
if cy - alto_nota < SUELO:
    nueva_columna()
x = MARGEN + col * (ANCHO_COL + CANAL)
c.setFillColor(CLAY_50); c.roundRect(x, cy - alto_nota + 10, ANCHO_COL, alto_nota, 7, stroke=0, fill=1)
c.setStrokeColor(CLAY_300); c.setLineWidth(2.2)
c.line(x + 1.1, cy - alto_nota + 14, x + 1.1, cy + 6)
c.setFont('PS-b', 8.8); c.setFillColor(CLAY_600)
c.drawString(x + 10, cy - 4, 'Una nota importante')
yy = cy - 19
for linea in lineas_nota:
    c.setFont('PS', CUERPO); c.setFillColor(INK)
    c.drawString(x + 10, yy, linea); yy -= SALTO

c.save()
print('PDF generado')
