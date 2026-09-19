# -*- coding: utf-8 -*-
"""Hoja de evolucion: registro de pases y grafico de puntuaciones."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SALIDA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'salida')
os.makedirs(SALIDA_DIR, exist_ok=True)

from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from marca import *
from contenido.seguimiento import CORTES_PHQ, CORTES_GAD

SALIDA = os.path.join(SALIDA_DIR, 'Hoja de evolucion - Hogar Terapeutico.pdf')
cargar_fuentes()

W, H = A4
MARGEN = 40
ANCHO = W - 2 * MARGEN
PASES = 10

# La franja minima en sage y el resto subiendo en clay: el mismo idioma de color
# que la ventana de tolerancia, donde sage es el sitio al que se quiere volver.
TONOS = [HexColor('#EAF2EC'), HexColor('#FBF2F0'), HexColor('#F4E3DF'),
         HexColor('#E7C7C1'), HexColor('#D5A49C')]

c = canvas.Canvas(SALIDA, pagesize=(W, H))
c.setTitle('Hoja de evolución')
c.setAuthor('Angie Sánchez Gallego · Hogar Terapéutico')
c.setSubject('Seguimiento de puntuaciones PHQ-9 y GAD-7')
c.setCreator('hogarterapeutico.com')
form = c.acroForm

fondo(c, W, H)
y = membrete(c, W, H, MARGEN) - 24
c.setFont('FR-b', 19); c.setFillColor(CLAY_600)
c.drawString(MARGEN, y, 'Hoja de evolución')
y -= 18
c.setFont('PS-b', 7.2); c.setFillColor(INK_MUTE)
c.drawString(MARGEN, y + 3, 'CÓDIGO')
form.textfield(name='codigo', tooltip='Código del paciente', x=MARGEN + 42, y=y - 3,
               width=90, height=14, borderWidth=0, borderColor=None,
               fillColor=HexColor('#F6EFEC'), textColor=INK,
               fontName='Helvetica', fontSize=9, forceBorder=False)
c.setFont('PS', 7.4); c.setFillColor(INK_MUTE)
c.drawRightString(W - MARGEN, y + 3,
                  'Una fila por cada pase del cuestionario. Los números de abajo son los de la tabla.')
y -= 22

# --- tabla ------------------------------------------------------------------
COLS = [('Nº', 24, None), ('Fecha', 68, 'fecha'), ('PHQ-9', 44, 'phq'),
        ('GAD-7', 44, 'gad'), ('Func.', 36, 'func'), ('Ítem 9', 36, 'item9'),
        ('Notas', 0, 'notas')]
fijo = sum(a for _, a, _ in COLS)
COLS = [(t, (ANCHO - fijo if a == 0 else a), k) for t, a, k in COLS]
xs = [MARGEN]
for _, a, _ in COLS:
    xs.append(xs[-1] + a)

ALTO_CAB, ALTO_FILA = 17, 16.4
c.setFillColor(CLAY_100)
c.rect(MARGEN, y - ALTO_CAB, ANCHO, ALTO_CAB, stroke=0, fill=1)
for i, (titulo, ancho, _) in enumerate(COLS):
    c.setFont('PS-b', 7.6); c.setFillColor(CLAY_700)
    c.drawCentredString(xs[i] + ancho / 2, y - 11.5, titulo)
y -= ALTO_CAB

for f in range(PASES):
    fy = y - (f + 1) * ALTO_FILA
    if f % 2 == 0:
        c.setFillColor(HexColor('#FDF8F6'))
        c.rect(MARGEN, fy, ANCHO, ALTO_FILA, stroke=0, fill=1)
    c.setFont('PS-b', 7.4); c.setFillColor(CLAY_300)
    c.drawCentredString(xs[0] + COLS[0][1] / 2, fy + 5, str(f + 1))
    for i, (_, ancho, clave) in enumerate(COLS):
        if clave is None:
            continue
        form.textfield(name=f'{clave}_{f + 1}', tooltip=f'{COLS[i][0]} · pase {f + 1}',
                       x=xs[i] + 2, y=fy + 2, width=ancho - 4, height=ALTO_FILA - 4,
                       borderWidth=0, borderColor=None, fillColor=None, textColor=INK,
                       fontName='Helvetica', fontSize=8, forceBorder=False)
tabla_base = y - PASES * ALTO_FILA
c.setStrokeColor(CLAY_200); c.setLineWidth(0.5)
for i in range(len(xs)):
    c.line(xs[i], tabla_base, xs[i], y + ALTO_CAB)
for f in range(PASES + 1):
    c.line(MARGEN, y - f * ALTO_FILA, W - MARGEN, y - f * ALTO_FILA)
c.setLineWidth(0.9); c.setStrokeColor(CLAY_400)
c.line(MARGEN, y + ALTO_CAB, W - MARGEN, y + ALTO_CAB)
c.line(MARGEN, y, W - MARGEN, y)


def grafico(rotulo, maximo, cortes, cima, alto):
    """Rejilla con las franjas de gravedad al fondo, para ir marcando a mano."""
    x0, x1 = MARGEN + 30, W - MARGEN - 76
    base = cima - alto
    c.setFont('PS-b', 8.4); c.setFillColor(CLAY_700)
    c.drawString(MARGEN, cima + 8, rotulo)

    for i, (a, b, nombre) in enumerate(cortes):
        ya = base + alto * a / maximo
        yb = base + alto * (b + 1) / maximo
        c.setFillColor(TONOS[i])
        c.rect(x0, ya, x1 - x0, min(yb, cima) - ya, stroke=0, fill=1)
        c.setFont('PS', 6.4); c.setFillColor(INK_MUTE)
        c.drawString(x1 + 6, (ya + min(yb, cima)) / 2 - 2, f'{nombre} ({a}-{b})')

    c.setStrokeColor(HexColor('#D8CCC7')); c.setLineWidth(0.4)
    paso = 5
    v = 0
    while v <= maximo:
        yy = base + alto * v / maximo
        c.line(x0, yy, x1, yy)
        c.setFont('PS', 6.2); c.setFillColor(INK_MUTE)
        c.drawRightString(x0 - 4, yy - 2, str(v))
        v += paso
    for p in range(PASES):
        xx = x0 + (x1 - x0) * (p + 0.5) / PASES
        c.setStrokeColor(HexColor('#E4DAD6')); c.setLineWidth(0.4)
        c.line(xx, base, xx, cima)
        c.setFont('PS-b', 6.4); c.setFillColor(CLAY_300)
        c.drawCentredString(xx, base - 9, str(p + 1))
    c.setStrokeColor(CLAY_400); c.setLineWidth(0.8)
    c.line(x0, base, x1, base)
    c.line(x0, base, x0, cima)
    return base - 20


y = tabla_base - 34
y = grafico('PHQ-9 · estado de ánimo', 27, CORTES_PHQ, y, 180)
y = grafico('GAD-7 · ansiedad', 21, CORTES_GAD, y - 16, 152)

# --- pie --------------------------------------------------------------------
c.setFillColor(HexColor('#F6E3DF'))
c.roundRect(MARGEN, y - 30, ANCHO, 26, 6, stroke=0, fill=1)
c.setFillColor(CLAY_500); c.circle(MARGEN + 14, y - 17, 3, stroke=0, fill=1)
c.setFont('PS-b', 7.6); c.setFillColor(CLAY_700)
c.drawString(MARGEN + 22, y - 19.5,
             'La columna «Ítem 9» no es una puntuación: anota si apareció ideación, aunque el total '
             'haya bajado.')

c.save()
rematar(SALIDA)
print(f'PDF generado · pie en y={y - 30:.0f} (margen {MARGEN})')
