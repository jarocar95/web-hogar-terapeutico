# -*- coding: utf-8 -*-
"""Hoja de sesion EMDR: diana, CN/CP, VOC, SUD, sensacion y reprocesamiento.

No es una escala validada: es el formulario de trabajo del protocolo, asi que
aqui no hay redaccion que cotejar. SUD y VOC son las dos medidas del propio
protocolo (Shapiro), no instrumentos con licencia.
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SALIDA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'salida')
os.makedirs(SALIDA_DIR, exist_ok=True)

from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from marca import *

SALIDA = os.path.join(SALIDA_DIR, 'Hoja de sesion EMDR - Hogar Terapeutico.pdf')
cargar_fuentes()

W, H = A4
MARGEN = 36
ANCHO = W - 2 * MARGEN

c = canvas.Canvas(SALIDA, pagesize=(W, H))
c.setTitle('Hoja de sesión EMDR')
c.setAuthor('Angie Sánchez Gallego · Hogar Terapéutico')
c.setSubject('Registro de diana y reprocesamiento EMDR')
c.setCreator('hogarterapeutico.com')
form = c.acroForm


def campo(nombre, x, y, ancho, alto, multi=False, cuerpo=9):
    form.textfield(name=nombre, tooltip=nombre.replace('_', ' '),
                   x=x, y=y, width=ancho, height=alto,
                   borderWidth=0.6, borderColor=CLAY_200, fillColor=HexColor('#FDF8F6'),
                   textColor=INK, fontName='Helvetica', fontSize=cuerpo,
                   fieldFlags='multiline' if multi else '', forceBorder=True)


def rotulo(txt, x, y, tinta=INK_MUTE, cuerpo=7.4):
    c.setFont('PS-b', cuerpo); c.setFillColor(tinta)
    c.drawString(x, y, txt.upper())


def bloque(titulo, x, y, ancho, alto, tinta, fdo):
    c.setFillColor(fdo); c.roundRect(x, y - alto, ancho, alto, 6, stroke=0, fill=1)
    c.setFillColor(tinta); c.rect(x, y - alto, 2.6, alto, stroke=0, fill=1)
    c.setFont('PS-b', 8.6); c.setFillColor(tinta)
    c.drawString(x + 11, y - 14, titulo)


def escala(nombre, x, y, desde, hasta, tinta, etiqueta_baja, etiqueta_alta):
    """Fila de casillas numeradas, excluyentes entre sí."""
    n = hasta - desde + 1
    paso = 15.5
    for i, v in enumerate(range(desde, hasta + 1)):
        cx = x + i * paso
        form.radio(name=nombre, value=str(v), selected=False, tooltip=f'{nombre} = {v}',
                   x=cx, y=y, size=11, buttonStyle='check', shape='square',
                   borderWidth=0.7, borderColor=tinta, fillColor=None,
                   textColor=tinta, forceBorder=True)
        c.setFont('PS', 6.2); c.setFillColor(INK_MUTE)
        c.drawCentredString(cx + 5.5, y - 8, str(v))
    c.setFont('PS', 6.2); c.setFillColor(INK_MUTE)
    c.drawString(x, y + 14, etiqueta_baja)
    c.drawRightString(x + (n - 1) * paso + 11, y + 14, etiqueta_alta)
    return x + (n - 1) * paso + 11


# --- cabecera ---------------------------------------------------------------
fondo(c, W, H)
y = membrete(c, W, H, MARGEN) - 22
c.setFont('FR-b', 19); c.setFillColor(CLAY_600)
c.drawString(MARGEN, y, 'Hoja de sesión EMDR')
y -= 18
for rot, clave, anc, dx in [('FECHA', 'fecha', 74, 0), ('CÓDIGO', 'codigo', 66, 150),
                            ('SESIÓN Nº', 'sesion', 40, 290)]:
    rotulo(rot, MARGEN + dx, y + 4)
    campo(clave, MARGEN + dx + (46 if rot != 'SESIÓN Nº' and rot != 'CÓDIGO' else 52), y - 2, anc, 14)
y -= 24

# --- diana ------------------------------------------------------------------
ALTO_DIANA = 58
bloque('Diana', MARGEN, y, ANCHO, ALTO_DIANA, CLAY_600, HexColor('#FAF2EF'))
rotulo('RECUERDO O SITUACIÓN', MARGEN + 11, y - 26, CLAY_600, 6.6)
campo('diana', MARGEN + 11, y - 52, ANCHO - 140, 22, multi=True)
rotulo('IMAGEN: LA PEOR PARTE', MARGEN + ANCHO - 120, y - 26, CLAY_600, 6.6)
campo('imagen', MARGEN + ANCHO - 120, y - 52, 109, 22, multi=True)
y -= ALTO_DIANA + 12

# --- cognicion negativa / positiva ------------------------------------------
# Clay a la izquierda, sage a la derecha: es literalmente el recorrido del
# protocolo, de la creencia que atrapa a la que se quiere instalar.
col = (ANCHO - 12) / 2
ALTO_COG = 98
bloque('Cognición negativa', MARGEN, y, col, ALTO_COG, CLAY_600, HexColor('#FAF2EF'))
campo('cn', MARGEN + 11, y - 52, col - 22, 26, multi=True)
rotulo('EMOCIÓN', MARGEN + 11, y - 72, CLAY_600, 6.6)
campo('emocion', MARGEN + 56, y - 78, col - 67, 15)

x2 = MARGEN + col + 12
bloque('Cognición positiva', x2, y, col, ALTO_COG, SAGE_700, HexColor('#EDF4EF'))
campo('cp', x2 + 11, y - 52, col - 22, 26, multi=True)
rotulo('VOC', x2 + 11, y - 78, SAGE_700, 6.6)
escala('voc', x2 + 34, y - 82, 1, 7, SAGE_700, 'falsa', 'del todo cierta')
y -= ALTO_COG + 14

# --- SUD y sensacion --------------------------------------------------------
ALTO_SUD = 62
bloque('Perturbación (SUD) y cuerpo', MARGEN, y, ANCHO, ALTO_SUD, CLAY_600, HexColor('#FAF2EF'))
fin = escala('sud', MARGEN + 11, y - 40, 0, 10, CLAY_600, 'ninguna', 'la máxima')
rotulo('SENSACIÓN CORPORAL Y DÓNDE', fin + 24, y - 26, CLAY_600, 6.6)
campo('sensacion', fin + 24, y - 44, ANCHO - (fin - MARGEN) - 36, 16)
y -= ALTO_SUD + 14

# --- reprocesamiento --------------------------------------------------------
FILAS = 12
COLS = [('Serie', 34, None), ('SUD', 34, 'sud_s'), ('Lo que aparece', 0, 'nota_s')]
fijo = sum(a for _, a, _ in COLS)
COLS = [(t, (ANCHO - fijo if a == 0 else a), k) for t, a, k in COLS]
xs = [MARGEN]
for _, a, _ in COLS:
    xs.append(xs[-1] + a)
c.setFont('PS-b', 8.6); c.setFillColor(CLAY_700)
c.drawString(MARGEN, y, 'Reprocesamiento')
y -= 14
ALTO_CAB, ALTO_FILA = 15, 17
c.setFillColor(CLAY_100); c.rect(MARGEN, y - ALTO_CAB, ANCHO, ALTO_CAB, stroke=0, fill=1)
for i, (t, a, _) in enumerate(COLS):
    c.setFont('PS-b', 7.2); c.setFillColor(CLAY_700)
    c.drawCentredString(xs[i] + a / 2, y - 10.5, t)
y -= ALTO_CAB
for f in range(FILAS):
    fy = y - (f + 1) * ALTO_FILA
    if f % 2 == 0:
        c.setFillColor(HexColor('#FDF8F6')); c.rect(MARGEN, fy, ANCHO, ALTO_FILA, stroke=0, fill=1)
    c.setFont('PS-b', 7.2); c.setFillColor(CLAY_300)
    c.drawCentredString(xs[0] + COLS[0][1] / 2, fy + 5.5, str(f + 1))
    for i, (_, a, k) in enumerate(COLS):
        if k:
            form.textfield(name=f'{k}{f+1}', tooltip=f'{COLS[i][0]} · serie {f+1}',
                           x=xs[i] + 2, y=fy + 2, width=a - 4, height=ALTO_FILA - 4,
                           borderWidth=0, borderColor=None, fillColor=None, textColor=INK,
                           fontName='Helvetica', fontSize=8, forceBorder=False)
base = y - FILAS * ALTO_FILA
c.setStrokeColor(CLAY_200); c.setLineWidth(0.5)
for i in range(len(xs)):
    c.line(xs[i], base, xs[i], y + ALTO_CAB)
for f in range(FILAS + 1):
    c.line(MARGEN, y - f * ALTO_FILA, W - MARGEN, y - f * ALTO_FILA)
c.setLineWidth(0.9); c.setStrokeColor(CLAY_400)
c.line(MARGEN, y + ALTO_CAB, W - MARGEN, y + ALTO_CAB)
y = base - 16

# --- cierre -----------------------------------------------------------------
ALTO_C = 74
bloque('Cierre', MARGEN, y, ANCHO, ALTO_C, SAGE_700, HexColor('#EDF4EF'))
rotulo('SUD FINAL', MARGEN + 11, y - 28, SAGE_700, 6.6)
campo('sud_final', MARGEN + 58, y - 34, 30, 15)
rotulo('VOC FINAL', MARGEN + 104, y - 28, SAGE_700, 6.6)
campo('voc_final', MARGEN + 151, y - 34, 30, 15)
for i, (rot, clave) in enumerate([('Instalación completa', 'instalacion'),
                                  ('Examen corporal limpio', 'examen'),
                                  ('Sesión incompleta', 'incompleta')]):
    cx = MARGEN + 200 + i * 108
    form.checkbox(name=clave, tooltip=rot, x=cx, y=y - 33, size=11,
                  buttonStyle='check', shape='square', borderWidth=0.7,
                  borderColor=SAGE_700, fillColor=None, textColor=SAGE_700,
                  checked=False, forceBorder=True)
    c.setFont('PS', 6.6); c.setFillColor(INK)
    for j, linea in enumerate(cortar(rot, 'PS', 6.6, 92)):
        c.drawString(cx + 15, y - 26 - j * 7.6, linea)
rotulo('TAREA / OBSERVACIONES HASTA LA PRÓXIMA', MARGEN + 11, y - 50, SAGE_700, 6.6)
campo('tarea', MARGEN + 11, y - 70, ANCHO - 22, 17, multi=True)
y -= ALTO_C + 12

# --- reevaluacion -----------------------------------------------------------
c.setFillColor(HexColor('#F7F3F0')); c.roundRect(MARGEN, y - 30, ANCHO, 30, 6, stroke=0, fill=1)
rotulo('EN LA PRÓXIMA SESIÓN, AL REEVALUAR ESTA DIANA', MARGEN + 11, y - 12, INK_MUTE, 6.6)
for i, (rot, clave) in enumerate([('SUD', 'sud_reeval'), ('VOC', 'voc_reeval')]):
    cx = MARGEN + 11 + i * 92
    rotulo(rot, cx, y - 25, CLAY_600, 6.6)
    campo(clave, cx + 26, y - 29, 30, 14)
c.setFont('PS', 6.8); c.setFillColor(INK_MUTE)
c.drawString(MARGEN + 210, y - 24, 'Si el SUD no ha bajado o ha subido, revisar bloqueos antes de seguir.')

c.save()
rematar(SALIDA)
print(f'PDF generado · pie en y={y - 30:.0f} (margen {MARGEN})')
