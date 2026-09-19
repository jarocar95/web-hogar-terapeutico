# -*- coding: utf-8 -*-
"""PCL-5 en PDF rellenable."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SALIDA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'salida')
os.makedirs(SALIDA_DIR, exist_ok=True)

from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from marca import *
from contenido.pcl5 import ITEMS, ESCALA, ENCABEZADO, GRUPOS, CORTE

SALIDA = os.path.join(SALIDA_DIR, 'PCL-5 - Hogar Terapeutico.pdf')
cargar_fuentes()

W, H = A4
MARGEN = 36
ANCHO = W - 2 * MARGEN
N_OPC = len(ESCALA)
COL_OPC = 42
X_OPC = W - MARGEN - COL_OPC * N_OPC
TEXTO = X_OPC - MARGEN - 8
CUERPO, SALTO = 8.0, 9.4

c = canvas.Canvas(SALIDA, pagesize=(W, H))
c.setTitle('PCL-5')
c.setAuthor('Angie Sánchez Gallego · Hogar Terapéutico')
c.setSubject('Lista de comprobación de síntomas de estrés postraumático (DSM-5)')
c.setCreator('hogarterapeutico.com')
form = c.acroForm
centro = lambda i: X_OPC + i * COL_OPC + COL_OPC / 2

fondo(c, W, H)
y = membrete(c, W, H, MARGEN) - 22
c.setFont('FR-b', 18); c.setFillColor(CLAY_600)
c.drawString(MARGEN, y, 'PCL-5')
c.setFont('PS-b', 8.4); c.setFillColor(INK_MUTE)
c.drawString(MARGEN + 52, y + 1, 'Síntomas de estrés postraumático')
y -= 17

for rotulo, clave, ancho_c, x in [('FECHA', 'fecha', 86, MARGEN), ('CÓDIGO', 'codigo', 78, MARGEN + 170)]:
    c.setFont('PS-b', 7.0); c.setFillColor(INK_MUTE)
    c.drawString(x, y + 3, rotulo)
    form.textfield(name=clave, tooltip=rotulo.title(), x=x + 40, y=y - 3, width=ancho_c, height=14,
                   borderWidth=0, borderColor=None, fillColor=HexColor('#F6EFEC'),
                   textColor=INK, fontName='Helvetica', fontSize=9, forceBorder=False)
y -= 24

# El acontecimiento. Sin esto la escala no significa nada: las 20 preguntas se
# refieren a UNA experiencia concreta, no al malestar en general.
c.setFillColor(HexColor('#F7F3F0'))
c.roundRect(MARGEN, y - 34, ANCHO, 42, 6, stroke=0, fill=1)
c.setFont('PS-b', 7.6); c.setFillColor(CLAY_700)
c.drawString(MARGEN + 10, y - 2, 'LA EXPERIENCIA A LA QUE SE REFIEREN LAS PREGUNTAS')
c.setFont('PS', 7.2); c.setFillColor(INK_MUTE)
c.drawString(MARGEN + 10, y - 12, 'Escriba brevemente el acontecimiento. Todas las respuestas se '
                                  'refieren a él, no al malestar en general.')
form.textfield(name='acontecimiento', tooltip='Acontecimiento de referencia',
               x=MARGEN + 10, y=y - 30, width=ANCHO - 20, height=15,
               borderWidth=0.6, borderColor=CLAY_200, fillColor=HexColor('#FDF8F6'),
               textColor=INK, fontName='Helvetica', fontSize=9, forceBorder=True)
y -= 46

c.setFont('PS', 8.2); c.setFillColor(INK)
for linea in cortar(ENCABEZADO, 'PS', 8.2, ANCHO):
    c.drawString(MARGEN, y, linea); y -= 10.4
y -= 8

# cabecera de opciones
alto_cab = 0
for i, t in enumerate(ESCALA):
    lineas = cortar(t, 'PS-b', 6.0, COL_OPC - 5)
    alto_cab = max(alto_cab, len(lineas))
    for j, linea in enumerate(lineas):
        c.setFont('PS-b', 6.0); c.setFillColor(CLAY_600)
        c.drawCentredString(centro(i), y - j * 7.0, linea)
for i in range(N_OPC):
    c.setFont('PS-b', 6.0); c.setFillColor(CLAY_300)
    c.drawCentredString(centro(i), y - alto_cab * 7.0 - 1, str(i))
y -= alto_cab * 7.0 + 10

grupo_por_item = {}
for rotulo, a, b in GRUPOS:
    for n in range(a, b + 1):
        grupo_por_item[n] = rotulo

for n, texto in enumerate(ITEMS, 1):
    if any(n == a for _, a, _ in GRUPOS):
        if n > 1:
            y -= 9          # sin esto la banda del grupo pisa la ultima linea del item anterior
        c.setFillColor(CLAY_100)
        c.roundRect(MARGEN, y - 4, ANCHO, 14, 4, stroke=0, fill=1)
        c.setFont('PS-b', 7.4); c.setFillColor(CLAY_700)
        c.drawString(MARGEN + 8, y, grupo_por_item[n])
        y -= 18
    lineas = cortar(texto, 'PS', CUERPO, TEXTO - 16)
    alto = max(len(lineas) * SALTO + 6, 18.5)
    c.setFont('PS-b', 7.2); c.setFillColor(CLAY_300)
    c.drawString(MARGEN + 3, y - 7, str(n))
    for j, linea in enumerate(lineas):
        c.setFont('PS', CUERPO); c.setFillColor(INK)
        c.drawString(MARGEN + 16, y - 7 - j * SALTO, linea)
    cy = y - 7 + 2.8
    for i in range(N_OPC):
        form.radio(name=f'pcl_{n}', value=str(i), selected=False,
                   tooltip=f'{ESCALA[i]} ({i})',
                   x=centro(i) - 5, y=cy - 5, size=10,
                   buttonStyle='check', shape='square',
                   borderWidth=0.7, borderColor=CLAY_300, fillColor=None,
                   textColor=CLAY_700, forceBorder=True)
    c.setStrokeColor(CLAY_100); c.setLineWidth(0.5)
    c.line(MARGEN, y - alto + 4, W - MARGEN, y - alto + 4)
    y -= alto

# --- correccion -------------------------------------------------------------
y -= 12
ALTO_CAJA = 62
c.setFillColor(HexColor('#F7F3F0'))
c.roundRect(MARGEN, y - ALTO_CAJA, ANCHO, ALTO_CAJA, 7, stroke=0, fill=1)
c.setFont('PS-b', 7.2); c.setFillColor(INK_MUTE)
c.drawString(MARGEN + 12, y - 13, 'CORRECCIÓN')

ancho_sub = (ANCHO - 150) / 4
for i, (rotulo, a, b) in enumerate(GRUPOS):
    x = MARGEN + 12 + i * ancho_sub
    c.setFont('PS-b', 7.4); c.setFillColor(CLAY_700)
    c.drawString(x, y - 30, rotulo.split(' · ')[0])
    form.textfield(name=f'sub_{rotulo[0]}', tooltip=f'Subtotal {rotulo}',
                   x=x + 16, y=y - 35, width=28, height=14,
                   borderWidth=0.7, borderColor=CLAY_200, fillColor=HexColor('#FDF8F6'),
                   textColor=INK, fontName='Helvetica', fontSize=9, forceBorder=True)
    c.setFont('PS', 6.4); c.setFillColor(INK_MUTE)
    c.drawString(x, y - 44, f'de {(b - a + 1) * 4}')

xt = W - MARGEN - 138
c.setFont('PS-b', 8.6); c.setFillColor(CLAY_700)
c.drawString(xt, y - 30, 'TOTAL')
form.textfield(name='total', tooltip='Puntuación total', x=xt + 38, y=y - 36,
               width=36, height=16, borderWidth=0.8, borderColor=CLAY_300,
               fillColor=HexColor('#FDF8F6'), textColor=INK,
               fontName='Helvetica', fontSize=11, forceBorder=True)
c.setFont('PS', 6.6); c.setFillColor(INK_MUTE)
c.drawString(xt + 80, y - 30, 'de 80')
for i, linea in enumerate(cortar(CORTE, 'PS', 6.4, 130)):
    c.drawString(xt, y - 46 - i * 8, linea)

c.save()
rematar(SALIDA)
print(f'PDF generado · caja en y={y - ALTO_CAJA:.0f} (margen {MARGEN})')
