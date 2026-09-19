# -*- coding: utf-8 -*-
"""Cuestionario de seguimiento: PHQ-9 + GAD-7 + pregunta de funcionamiento."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SALIDA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'salida')
os.makedirs(SALIDA_DIR, exist_ok=True)

from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from marca import *
from contenido.seguimiento import (PHQ9, GAD7, FRECUENCIA, FUNCIONAMIENTO, DIFICULTAD,
                                   ENCABEZADO, CORTES_PHQ, CORTES_GAD)

SALIDA = os.path.join(SALIDA_DIR, 'Cuestionario de seguimiento - Hogar Terapeutico.pdf')
cargar_fuentes()

W, H = A4
MARGEN = 40
COL_OPC, N_OPC = 47, 4
ANCHO = W - 2 * MARGEN
X_OPC = W - MARGEN - COL_OPC * N_OPC
TEXTO = X_OPC - MARGEN - 10
CUERPO, SALTO = 8.2, 10.0

c = canvas.Canvas(SALIDA, pagesize=(W, H))
c.setTitle('Cuestionario de seguimiento')
c.setAuthor('Angie Sánchez Gallego · Hogar Terapéutico')
c.setSubject('PHQ-9, GAD-7 y pregunta de funcionamiento')
c.setCreator('hogarterapeutico.com')
form = c.acroForm


def centro_opcion(i):
    return X_OPC + i * COL_OPC + COL_OPC / 2


def cabecera_opciones(y, etiquetas):
    """Los rotulos de respuesta, sobre cada columna."""
    alto = 0
    for i, t in enumerate(etiquetas):
        lineas = cortar(t, 'PS-b', 6.2, COL_OPC - 6)
        alto = max(alto, len(lineas))
        for j, linea in enumerate(lineas):
            c.setFont('PS-b', 6.2); c.setFillColor(CLAY_600)
            c.drawCentredString(centro_opcion(i), y - j * 7.4, linea)
    for i in range(N_OPC):
        c.setFont('PS-b', 6.2); c.setFillColor(CLAY_300)
        c.drawCentredString(centro_opcion(i), y - alto * 7.4 - 1, str(i))
    return y - alto * 7.4 - 10


def fila(n, texto, y, clave, etiquetas, resaltar=False):
    lineas = cortar(texto, 'PS', CUERPO, TEXTO - 16)
    alto = max(len(lineas) * SALTO + 8, 21)
    if resaltar:
        c.setFillColor(HexColor('#FAEDEA'))
        c.rect(MARGEN, y - alto + 4, ANCHO, alto, stroke=0, fill=1)
        c.setFillColor(CLAY_400); c.rect(MARGEN, y - alto + 4, 2.4, alto, stroke=0, fill=1)
    c.setFont('PS-b', 7.4); c.setFillColor(CLAY_300 if not resaltar else CLAY_500)
    c.drawString(MARGEN + 4, y - 7, str(n))
    for j, linea in enumerate(lineas):
        c.setFont('PS', CUERPO); c.setFillColor(INK)
        c.drawString(MARGEN + 16, y - 7 - j * SALTO, linea)
    cy = y - 7 + 2.9      # centrado con la primera linea del enunciado
    for i in range(N_OPC):
        form.radio(name=clave, value=str(i), selected=False,
                   tooltip=f'{etiquetas[i]} ({i})',
                   x=centro_opcion(i) - 5, y=cy - 5, size=10,
                   # shape='circle' sale mal: reportlab dibuja el circulo con centro en
                   # (2.5,2.5) y radio 2.3 dentro de una caja de 10x10, o sea en el
                   # cuarto inferior izquierdo. La caja cuadrada la dibuja bien.
                   buttonStyle='check', shape='square',
                   borderWidth=0.7, borderColor=CLAY_300, fillColor=None,
                   textColor=CLAY_700, forceBorder=True)
    c.setStrokeColor(CLAY_100); c.setLineWidth(0.5)
    c.line(MARGEN, y - alto + 4, W - MARGEN, y - alto + 4)
    return y - alto


def titulo_bloque(rotulo, apunte, y):
    c.setFillColor(CLAY_100)
    c.roundRect(MARGEN, y - 5, ANCHO, 18, 5, stroke=0, fill=1)
    c.setFont('PS-b', 9.0); c.setFillColor(CLAY_700)
    c.drawString(MARGEN + 9, y, rotulo)
    c.setFont('PS', 7.2); c.setFillColor(INK_MUTE)
    c.drawRightString(W - MARGEN - 9, y + 0.6, apunte)
    return y - 20


# --- cabecera ---------------------------------------------------------------
fondo(c, W, H)
y = membrete(c, W, H, MARGEN) - 24
c.setFont('FR-b', 19); c.setFillColor(CLAY_600)
c.drawString(MARGEN, y, 'Cuestionario de seguimiento')
y -= 20

for rotulo, clave, ancho_campo in [('Fecha', 'fecha', 96), ('Código', 'codigo', 96)]:
    x = MARGEN if clave == 'fecha' else MARGEN + 150
    c.setFont('PS-b', 7.2); c.setFillColor(INK_MUTE)
    c.drawString(x, y + 3, rotulo.upper())
    form.textfield(name=clave, tooltip=rotulo, x=x + 38, y=y - 3, width=ancho_campo, height=14,
                   borderWidth=0, borderColor=None, fillColor=HexColor('#F6EFEC'),
                   textColor=INK, fontName='Helvetica', fontSize=9, forceBorder=False)
c.setFont('PS', 6.8); c.setFillColor(INK_MUTE)
c.drawRightString(W - MARGEN, y + 3, 'Sin nombre: identifícalo con un código si lo prefieres')
y -= 22

c.setFont('PS', 8.6); c.setFillColor(INK)
for linea in cortar(ENCABEZADO, 'PS', 8.6, ANCHO):
    c.drawString(MARGEN, y, linea); y -= 11
y -= 8

# --- PHQ-9 ------------------------------------------------------------------
y = titulo_bloque('PHQ-9 · Estado de ánimo', 'Marque una casilla por fila', y)
y = cabecera_opciones(y, FRECUENCIA)
for i, texto in enumerate(PHQ9, 1):
    y = fila(i, texto, y, f'phq_{i}', FRECUENCIA, resaltar=(i == 9))
y -= 12

# --- GAD-7 ------------------------------------------------------------------
y = titulo_bloque('GAD-7 · Ansiedad', 'Marque una casilla por fila', y)
y = cabecera_opciones(y, FRECUENCIA)
for i, texto in enumerate(GAD7, 1):
    y = fila(i, texto, y, f'gad_{i}', FRECUENCIA)
y -= 12

# --- funcionamiento ---------------------------------------------------------
y = titulo_bloque('Funcionamiento', 'Ítem 10 del PHQ-9', y)
y = cabecera_opciones(y, DIFICULTAD)
y = fila(10, FUNCIONAMIENTO, y, 'func', DIFICULTAD)

# --- correccion, para la consulta -------------------------------------------
y -= 16
ALTO_CAJA = 86
c.setFillColor(HexColor('#F7F3F0'))
c.roundRect(MARGEN, y - ALTO_CAJA, ANCHO, ALTO_CAJA, 7, stroke=0, fill=1)
c.setFont('PS-b', 7.4); c.setFillColor(INK_MUTE)
c.drawString(MARGEN + 12, y - 14, 'CORRECCIÓN')

def casilla_total(rotulo, clave, cortes, maximo, x, yy, ancho_tramos):
    c.setFont('PS-b', 8.2); c.setFillColor(CLAY_700)
    c.drawString(x, yy, rotulo)
    form.textfield(name=clave, tooltip=f'Total {rotulo}', x=x + 52, y=yy - 4, width=34, height=15,
                   borderWidth=0.7, borderColor=CLAY_200, fillColor=HexColor('#FDF8F6'),
                   textColor=INK, fontName='Helvetica', fontSize=10, forceBorder=True)
    c.setFont('PS', 6.6); c.setFillColor(INK_MUTE)
    c.drawString(x + 92, yy + 3.5, f'de {maximo}')
    tramos = ' · '.join(f'{a}-{b} {n}' for a, b, n in cortes)
    c.setFont('PS', 6.6); c.setFillColor(INK_MUTE)
    for i, linea in enumerate(cortar(tramos, 'PS', 6.6, ancho_tramos)):
        c.drawString(x, yy - 14 - i * 8.4, linea)

casilla_total('PHQ-9', 'total_phq', CORTES_PHQ, 27, MARGEN + 12, y - 34, 240)
casilla_total('GAD-7', 'total_gad', CORTES_GAD, 21, MARGEN + 268, y - 34, 225)

# El aviso que justifica que el item 9 vaya resaltado: lo que se escapa al sumar
c.setFillColor(HexColor('#F6E3DF'))
c.roundRect(MARGEN + 12, y - ALTO_CAJA + 8, ANCHO - 24, 20, 5, stroke=0, fill=1)
c.setFillColor(CLAY_500); c.circle(MARGEN + 24, y - ALTO_CAJA + 18, 3, stroke=0, fill=1)
c.setFont('PS-b', 7.6); c.setFillColor(CLAY_700)
c.drawString(MARGEN + 32, y - ALTO_CAJA + 15.5,
             'Ítem 9 distinto de 0: valorar riesgo antes de cerrar la sesión, sea cual sea el total.')

c.save()
rematar(SALIDA)
print(f'PDF generado · borde inferior en y={y:.0f} (margen {MARGEN})')
