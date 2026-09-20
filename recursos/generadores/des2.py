# -*- coding: utf-8 -*-
"""DES-II en PDF rellenable."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SALIDA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'salida')
os.makedirs(SALIDA_DIR, exist_ok=True)

from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from marca import *
from contenido.des2 import ITEMS, DES_T, INSTRUCCIONES, FUENTE

SALIDA = os.path.join(SALIDA_DIR, 'DES-II - Hogar Terapeutico.pdf')
cargar_fuentes()

W, H = A4
MARGEN = 34
ANCHO = W - 2 * MARGEN
OPCIONES = list(range(0, 101, 10))          # 0 % a 100 % de diez en diez
COL = 15.6
X_OPC = W - MARGEN - COL * len(OPCIONES)
TEXTO = X_OPC - MARGEN - 10
CUERPO, SALTO = 8.0, 9.6

c = canvas.Canvas(SALIDA, pagesize=(W, H))
c.setTitle('DES-II · Escala de Experiencias Disociativas')
c.setAuthor('Angie Sánchez Gallego · Hogar Terapéutico')
c.setSubject('Cribado de experiencias disociativas')
c.setCreator('hogarterapeutico.com')
form = c.acroForm
centro = lambda i: X_OPC + i * COL + COL / 2


def cabecera_escala(y):
    for i, v in enumerate(OPCIONES):
        c.setFont('PS-b', 5.8); c.setFillColor(CLAY_600)
        c.drawCentredString(centro(i), y, str(v))
    c.setFont('PS', 5.8); c.setFillColor(INK_MUTE)
    c.drawCentredString(centro(0), y - 7.5, 'nunca')
    c.drawCentredString(centro(len(OPCIONES) - 1), y - 7.5, 'siempre')
    return y - 16


def alto_fila(texto):
    return max(len(cortar(texto, 'PS', CUERPO, TEXTO - 20)) * SALTO + 7, 19)


def fila(n, texto, y):
    taxon = n in DES_T
    lineas = cortar(texto, 'PS', CUERPO, TEXTO - 20)
    alto = alto_fila(texto)
    if taxon:
        c.setFillColor(HexColor('#F8EDEA'))
        c.rect(MARGEN, y - alto + 4, ANCHO, alto, stroke=0, fill=1)
        c.setFillColor(CLAY_400); c.rect(MARGEN, y - alto + 4, 2.2, alto, stroke=0, fill=1)
    c.setFont('PS-b', 7.2); c.setFillColor(CLAY_500 if taxon else CLAY_300)
    c.drawString(MARGEN + 5, y - 7, f'{n:02d}')
    for j, linea in enumerate(lineas):
        c.setFont('PS', CUERPO); c.setFillColor(INK)
        c.drawString(MARGEN + 19, y - 7 - j * SALTO, linea)
    cy = y - 7 + 2.8
    for i, v in enumerate(OPCIONES):
        form.radio(name=f'des_{n}', value=str(v), selected=False,
                   tooltip=f'Ítem {n}: {v} %',
                   x=centro(i) - 4.6, y=cy - 4.6, size=9.2,
                   buttonStyle='check', shape='square',
                   borderWidth=0.6, borderColor=CLAY_300, fillColor=None,
                   textColor=CLAY_700, forceBorder=True)
    c.setStrokeColor(CLAY_100); c.setLineWidth(0.5)
    c.line(MARGEN, y - alto + 4, W - MARGEN, y - alto + 4)
    return y - alto


def portada():
    y = membrete(c, W, H, MARGEN) - 22
    c.setFont('FR-b', 19); c.setFillColor(CLAY_600)
    c.drawString(MARGEN, y, 'Escala de Experiencias Disociativas')
    c.setFont('PS-b', 9); c.setFillColor(INK_MUTE)
    c.drawRightString(W - MARGEN, y + 2, 'DES-II')
    y -= 17
    for rot, clave, anc, dx in [('FECHA', 'fecha', 80, 0), ('CÓDIGO', 'codigo', 74, 160)]:
        c.setFont('PS-b', 7.0); c.setFillColor(INK_MUTE)
        c.drawString(MARGEN + dx, y + 3, rot)
        form.textfield(name=clave, tooltip=rot.title(), x=MARGEN + dx + 42, y=y - 3,
                       width=anc, height=14, borderWidth=0, borderColor=None,
                       fillColor=HexColor('#F6EFEC'), textColor=INK,
                       fontName='Helvetica', fontSize=9, forceBorder=False)
    y -= 22
    c.setFont('PS', 8.2); c.setFillColor(INK)
    for linea in cortar(INSTRUCCIONES, 'PS', 8.2, ANCHO):
        c.drawString(MARGEN, y, linea); y -= 10.4
    return y - 10


def pie_continua(pagina):
    c.setFont('PS', 6.6); c.setFillColor(INK_MUTE)
    c.drawRightString(W - MARGEN, MARGEN - 14, f'DES-II · página {pagina}')


fondo(c, W, H)
y = cabecera_escala(portada())
SUELO = MARGEN + 6
pagina = 1
for n, texto in enumerate(ITEMS, 1):
    if y - alto_fila(texto) < SUELO:
        pie_continua(pagina); pagina += 1
        c.showPage(); fondo(c, W, H)
        y = membrete(c, W, H, MARGEN, ancho_logo=44, cuerpo_marca=10.5, ficha=False) - 16
        c.setFont('PS', 7.2); c.setFillColor(INK_MUTE)
        c.drawRightString(W - MARGEN, y + 18, 'Escala de Experiencias Disociativas · DES-II')
        y = cabecera_escala(y)
    y = fila(n, texto, y)

# la corrección necesita su propio hueco; si no cabe, pasa de página
if y - 132 < SUELO:
    pie_continua(pagina); pagina += 1
    c.showPage(); fondo(c, W, H)
    y = membrete(c, W, H, MARGEN, ancho_logo=44, cuerpo_marca=10.5, ficha=False) - 24

# --- correccion -------------------------------------------------------------
y -= 14
ALTO = 98
c.setFillColor(HexColor('#F7F3F0')); c.roundRect(MARGEN, y - ALTO, ANCHO, ALTO, 7, stroke=0, fill=1)
c.setFont('PS-b', 7.2); c.setFillColor(INK_MUTE)
c.drawString(MARGEN + 12, y - 14, 'CORRECCIÓN')

def casilla(rot, clave, nota, x, yy, ancho_nota):
    c.setFont('PS-b', 8.2); c.setFillColor(CLAY_700)
    c.drawString(x, yy, rot)
    form.textfield(name=clave, tooltip=rot, x=x + 74, y=yy - 4, width=38, height=15,
                   borderWidth=0.7, borderColor=CLAY_200, fillColor=HexColor('#FDF8F6'),
                   textColor=INK, fontName='Helvetica', fontSize=10, forceBorder=True)
    c.setFont('PS', 6.5); c.setFillColor(INK_MUTE)
    for i, linea in enumerate(cortar(nota, 'PS', 6.5, ancho_nota)):
        c.drawString(x, yy - 15 - i * 7.6, linea)

casilla('DES total', 'total', 'Suma de los 28 porcentajes ÷ 28. Referencia orientativa: '
        'a partir de 30 conviene explorar en profundidad.', MARGEN + 12, y - 34, 236)
casilla('DES-T', 'taxon', 'Media de los 8 ítems marcados (3, 5, 7, 8, 12, 13, 22 y 27), '
        'más específicos de disociación patológica.', MARGEN + 270, y - 34, 236)

c.setFillColor(HexColor('#F6E3DF'))
c.roundRect(MARGEN + 12, y - ALTO + 8, ANCHO - 24, 19, 5, stroke=0, fill=1)
c.setFillColor(CLAY_500); c.circle(MARGEN + 24, y - ALTO + 17.5, 2.8, stroke=0, fill=1)
c.setFont('PS-b', 7.4); c.setFillColor(CLAY_700)
c.drawString(MARGEN + 32, y - ALTO + 15,
             'Puntuación alta: estabilizar y valorar antes de procesar trauma. No es un diagnóstico.')
y -= ALTO + 12
c.setFont('PS', 6.4); c.setFillColor(INK_MUTE)
for linea in cortar(FUENTE, 'PS', 6.4, ANCHO):
    c.drawString(MARGEN, y, linea); y -= 7.6
pie_continua(pagina)

c.save()
rematar(SALIDA)
print(f'PDF generado · última línea en y={y:.0f} (margen {MARGEN})')
