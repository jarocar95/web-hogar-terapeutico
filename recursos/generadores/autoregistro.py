import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SALIDA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'salida')
os.makedirs(SALIDA_DIR, exist_ok=True)
# -*- coding: utf-8 -*-
"""Autorregistro de situaciones, en PDF rellenable."""
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4, landscape
from reportlab.pdfbase import pdfmetrics
from marca import *

SALIDA = os.path.join(SALIDA_DIR, 'Autorregistro de situaciones - Hogar Terapeutico.pdf')
cargar_fuentes()

W, H = landscape(A4)
MARGEN = 34

# Las dos columnas de los extremos son lo observable: lo que pasa fuera y lo que
# haces fuera. Las tres del medio son la cadena interna que las une, que es todo
# el asunto del ejercicio. Por eso van con otro tono y bajo su propio rotulo.
COLUMNAS = [
    ('Día y hora',   '',                          0.55, 'marco'),
    ('Situación',    '¿Qué ha pasado?',           1.20, 'fuera'),
    ('Sensación física', '¿Qué sentí en el cuerpo?', 1.25, 'dentro'),
    ('Pensamiento',  '¿Qué pasó por mi cabeza?',  1.40, 'dentro'),
    ('Emoción',      '¿Cómo me sentí?',           0.75, 'dentro'),
    ('Acción',       '¿Qué hice?',                1.10, 'fuera'),
]
TONOS = {'marco':  (HexColor('#F0EAE6'), INK_MUTE,  HexColor('#FAF7F5')),
         'fuera':  (CLAY_100, CLAY_600, HexColor('#FDF8F6')),
         'dentro': (CLAY_200, CLAY_700, HexColor('#F8EDEA'))}

EJEMPLO = ['Lunes 11,\n19:30',
           'Veo por la calle a un grupo riéndose.',
           'Una punzada en el pecho. Temblor y calor en los brazos.',
           '«¿Por qué yo no puedo estar así? Mi vida es un desastre.»',
           'Tristeza',
           'Volverme a casa y meterme en la cama.']
FILAS_VACIAS = 5

c = canvas.Canvas(SALIDA, pagesize=(W, H))
c.setTitle('Autorregistro de situaciones')
c.setAuthor('Angie Sánchez Gallego · Hogar Terapéutico')
c.setSubject('Autorregistro de situación, cuerpo, pensamiento, emoción y acción')
c.setCreator('hogarterapeutico.com')

fondo(c, W, H)
base_logo = membrete(c, W, H, MARGEN)

y = base_logo - 26
c.setFont('FR-b', 20); c.setFillColor(CLAY_600)
c.drawString(MARGEN, y, 'Autorregistro de situaciones')
y -= 15
c.setFont('PS', 8.6); c.setFillColor(INK_MUTE)
c.drawString(MARGEN, y, 'Apunta lo que pase el mismo día, aunque sea en dos palabras. La primera fila '
                        'es un ejemplo de cómo se rellena.')

izq, der = MARGEN, W - MARGEN
ancho = der - izq
peso = sum(col[2] for col in COLUMNAS)
anchos = [ancho * col[2] / peso for col in COLUMNAS]
xs = [izq]
for a in anchos:
    xs.append(xs[-1] + a)

ALTO_CAB, ALTO_EJ = 32, 46
ROTULO = 13
tope = y - 20 - ROTULO
suelo = MARGEN
alto_fila = (tope - suelo - ALTO_CAB - ALTO_EJ) / FILAS_VACIAS

# rotulo que abraza las tres columnas internas
x0, x1 = xs[2], xs[5]
c.setStrokeColor(CLAY_300); c.setLineWidth(0.7)
c.line(x0, tope + 5, x1, tope + 5)
c.line(x0, tope + 5, x0, tope + 1); c.line(x1, tope + 5, x1, tope + 1)
etiqueta = 'lo que pasa por dentro'
c.setFont('PS-b', 7); anc = pdfmetrics.stringWidth(etiqueta, 'PS-b', 7) + 10
c.setFillColor(CANVAS); c.rect((x0 + x1) / 2 - anc / 2, tope + 1.5, anc, 7, stroke=0, fill=1)
c.setFillColor(CLAY_400)
c.drawCentredString((x0 + x1) / 2, tope + 3, etiqueta)

# fondos
for i, (_, _, _, fam) in enumerate(COLUMNAS):
    c.setFillColor(TONOS[fam][2])
    c.rect(xs[i], suelo, anchos[i], tope - suelo - ALTO_CAB, stroke=0, fill=1)

# cabecera
for i, (titulo, pista, _, fam) in enumerate(COLUMNAS):
    fondo_col, tinta, _ = TONOS[fam]
    c.setFillColor(fondo_col)
    c.rect(xs[i], tope - ALTO_CAB, anchos[i], ALTO_CAB, stroke=0, fill=1)
    medio = xs[i] + anchos[i] / 2
    c.setFillColor(tinta); c.setFont('PS-b', 8.2)
    c.drawCentredString(medio, tope - (13 if pista else 19), titulo)
    if pista:
        c.setFont('PS', 6.5); c.setFillColor(INK_MUTE)
        c.drawCentredString(medio, tope - 24, pista)

# fila de ejemplo, impresa y en cursiva de color: no es un campo
ey = tope - ALTO_CAB - ALTO_EJ
c.setFillColor(HexColor('#F7EDEA'))
c.rect(izq, ey, ancho, ALTO_EJ, stroke=0, fill=1)
c.setFont('PS-b', 6.4); c.setFillColor(CLAY_400)
c.drawString(izq + 4, ey + ALTO_EJ - 9, 'EJEMPLO')
for i, texto in enumerate(EJEMPLO):
    yy = ey + ALTO_EJ - (18 if i == 0 else 18)
    for parrafo in texto.split('\n'):
        for linea in cortar(parrafo, 'PS', 7.4, anchos[i] - 8):
            c.setFont('PS', 7.4); c.setFillColor(CLAY_600)
            c.drawString(xs[i] + 4, yy, linea); yy -= 9.2

# rejilla
c.setStrokeColor(CLAY_200); c.setLineWidth(0.6)
for i in range(len(xs)):
    c.line(xs[i], suelo, xs[i], tope)
for f in range(FILAS_VACIAS + 1):
    yy = suelo + f * alto_fila
    c.line(izq, yy, der, yy)
c.setLineWidth(0.9); c.setStrokeColor(CLAY_400)
c.line(izq, tope, der, tope)
c.line(izq, tope - ALTO_CAB, der, tope - ALTO_CAB)
c.setLineWidth(0.7); c.setStrokeColor(CLAY_300)
c.line(izq, ey, der, ey)

# campos
CLAVES = ['dia', 'situacion', 'sensacion', 'pensamiento', 'emocion', 'accion']
form = c.acroForm
for f in range(FILAS_VACIAS):
    for i, clave in enumerate(CLAVES):
        form.textfield(
            name=f'{clave}_{f + 1}', tooltip=f'{COLUMNAS[i][0]} — fila {f + 1}',
            x=xs[i] + 3, y=suelo + (FILAS_VACIAS - 1 - f) * alto_fila + 3,
            width=anchos[i] - 6, height=alto_fila - 6,
            borderWidth=0, borderColor=None, fillColor=None, textColor=INK,
            fontName='Helvetica', fontSize=8.5,
            fieldFlags='multiline', forceBorder=False,
        )

c.save()
rematar(SALIDA)
print('PDF generado')
