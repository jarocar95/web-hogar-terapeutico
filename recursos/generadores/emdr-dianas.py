# -*- coding: utf-8 -*-
"""Mapa de dianas EMDR: el plan de tres vertientes (pasado, presente, futuro)."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SALIDA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'salida')
os.makedirs(SALIDA_DIR, exist_ok=True)

from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from marca import *

SALIDA = os.path.join(SALIDA_DIR, 'Mapa de dianas EMDR - Hogar Terapeutico.pdf')
cargar_fuentes()

W, H = A4
MARGEN = 36
ANCHO = W - 2 * MARGEN

# Pasado y presente en clay, futuro en sage: la plantilla de futuro es hacia
# donde va el trabajo, y en el resto de materiales sage ya es ese tono.
BLOQUES = [
    ('pas', 'Pasado · recuerdos que sostienen el problema', 12,
     CLAY_700, HexColor('#F4E3DF'), HexColor('#FDF8F6')),
    ('pre', 'Presente · disparadores actuales', 8,
     CLAY_700, HexColor('#EFDAD5'), HexColor('#FDF8F6')),
    ('fut', 'Futuro · plantilla para situaciones que vienen', 5,
     SAGE_700, HexColor('#DDE9E1'), HexColor('#F6FAF7')),
]
COLS = [('Nº', 22, None), ('Diana', 0, 'd'), ('Cognición negativa', 126, 'cn'),
        ('SUD ini.', 34, 'si'), ('SUD act.', 34, 'sa'), ('Hecha', 24, 'ok')]

c = canvas.Canvas(SALIDA, pagesize=(W, H))
c.setTitle('Mapa de dianas EMDR')
c.setAuthor('Angie Sánchez Gallego · Hogar Terapéutico')
c.setSubject('Plan de dianas de tres vertientes')
c.setCreator('hogarterapeutico.com')
form = c.acroForm

fijo = sum(a for _, a, _ in COLS)
cols = [(t, (ANCHO - fijo if a == 0 else a), k) for t, a, k in COLS]
xs = [MARGEN]
for _, a, _ in cols:
    xs.append(xs[-1] + a)

fondo(c, W, H)
y = membrete(c, W, H, MARGEN) - 22
c.setFont('FR-b', 19); c.setFillColor(CLAY_600)
c.drawString(MARGEN, y, 'Mapa de dianas')
y -= 18
for rot, clave, anc, dx in [('CÓDIGO', 'codigo', 70, 0), ('FECHA', 'fecha', 70, 150)]:
    c.setFont('PS-b', 7.4); c.setFillColor(INK_MUTE)
    c.drawString(MARGEN + dx, y + 4, rot)
    form.textfield(name=clave, tooltip=rot.title(), x=MARGEN + dx + 46, y=y - 2,
                   width=anc, height=14, borderWidth=0, borderColor=None,
                   fillColor=HexColor('#F6EFEC'), textColor=INK,
                   fontName='Helvetica', fontSize=9, forceBorder=False)
y -= 24

c.setFillColor(HexColor('#F7F3F0')); c.roundRect(MARGEN, y - 34, ANCHO, 34, 6, stroke=0, fill=1)
c.setFont('PS-b', 7.4); c.setFillColor(CLAY_700)
c.drawString(MARGEN + 11, y - 13, 'TEMA O NÚCLEO')
form.textfield(name='tema', tooltip='Tema o núcleo', x=MARGEN + 11, y=y - 30,
               width=ANCHO - 22, height=14, borderWidth=0.6, borderColor=CLAY_200,
               fillColor=HexColor('#FDF8F6'), textColor=INK,
               fontName='Helvetica', fontSize=9, forceBorder=True)
y -= 46

ALTO_CAB, ALTO_FILA = 15, 17.4
for clave, titulo, filas, tinta, cabecera, cuerpo in BLOQUES:
    c.setFont('PS-b', 8.8); c.setFillColor(tinta)
    c.drawString(MARGEN, y, titulo)
    y -= 13
    c.setFillColor(cabecera); c.rect(MARGEN, y - ALTO_CAB, ANCHO, ALTO_CAB, stroke=0, fill=1)
    for i, (t, a, _) in enumerate(cols):
        c.setFont('PS-b', 6.8); c.setFillColor(tinta)
        c.drawCentredString(xs[i] + a / 2, y - 10.5, t)
    y -= ALTO_CAB
    for f in range(filas):
        fy = y - (f + 1) * ALTO_FILA
        if f % 2 == 0:
            c.setFillColor(cuerpo); c.rect(MARGEN, fy, ANCHO, ALTO_FILA, stroke=0, fill=1)
        c.setFont('PS-b', 7.0); c.setFillColor(CLAY_300)
        c.drawCentredString(xs[0] + cols[0][1] / 2, fy + 5.6, str(f + 1))
        for i, (t, a, k) in enumerate(cols):
            if not k:
                continue
            if k == 'ok':
                form.checkbox(name=f'{clave}_ok{f+1}', tooltip=f'{titulo[:12]} · diana {f+1} procesada',
                              x=xs[i] + a / 2 - 5, y=fy + 3, size=10.5,
                              buttonStyle='check', shape='square', borderWidth=0.7,
                              borderColor=tinta, fillColor=None, textColor=tinta,
                              checked=False, forceBorder=True)
            else:
                form.textfield(name=f'{clave}_{k}{f+1}', tooltip=f'{t} · diana {f+1}',
                               x=xs[i] + 2, y=fy + 2, width=a - 4, height=ALTO_FILA - 4,
                               borderWidth=0, borderColor=None, fillColor=None,
                               textColor=INK, fontName='Helvetica', fontSize=8,
                               forceBorder=False)
    base = y - filas * ALTO_FILA
    c.setStrokeColor(CLAY_200); c.setLineWidth(0.5)
    for i in range(len(xs)):
        c.line(xs[i], base, xs[i], y + ALTO_CAB)
    for f in range(filas + 1):
        c.line(MARGEN, y - f * ALTO_FILA, W - MARGEN, y - f * ALTO_FILA)
    c.setLineWidth(0.9); c.setStrokeColor(tinta)
    c.line(MARGEN, y + ALTO_CAB, W - MARGEN, y + ALTO_CAB)
    y = base - 20

c.setFillColor(SAGE_50); c.roundRect(MARGEN, y - 34, ANCHO, 34, 6, stroke=0, fill=1)
c.setFont('PS-b', 8.2); c.setFillColor(SAGE_700)
c.drawString(MARGEN + 12, y - 14, 'Antes de procesar')
c.setFont('PS', 7.6); c.setFillColor(INK)
c.drawString(MARGEN + 12, y - 26,
             'Comprobar estabilización y cribado de disociación. Si la ventana de tolerancia es '
             'estrecha, primero recursos.')

c.save()
rematar(SALIDA)
print(f'PDF generado · pie en y={y - 34:.0f} (margen {MARGEN})')
