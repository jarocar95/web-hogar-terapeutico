import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SALIDA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'salida')
os.makedirs(SALIDA_DIR, exist_ok=True)
# -*- coding: utf-8 -*-
"""Registro de pensamientos de Hogar Terapeutico, en PDF rellenable.

Adaptacion a la marca de la tabla que usa la clinica: mismas seis columnas y
mismas cuatro filas, con la paleta, las fuentes y el logotipo de la web.
"""
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.graphics import renderPDF
from marca import *
from svglib.svglib import svg2rlg



# --- pagina -----------------------------------------------------------------
W, H = landscape(A4)
MARGEN = 34

cargar_fuentes()
c = canvas.Canvas(os.path.join(SALIDA_DIR, 'Registro de pensamientos - Hogar Terapeutico.pdf'), pagesize=(W, H))
c.setTitle('Registro de pensamientos')
c.setAuthor('Angie Sánchez Gallego · Hogar Terapéutico')
c.setSubject('Registro de pensamientos para terapia cognitiva')
c.setCreator('hogarterapeutico.com')

c.setFillColor(CANVAS)
c.rect(0, 0, W, H, stroke=0, fill=1)

# --- cabecera ---------------------------------------------------------------
cima = H - MARGEN
# El logotipo simplificado va sin texto (en la web lleva alt="" y el nombre se
# pone al lado como <span>), asi que aqui se recompone el mismo bloque: marca
# discreta de membrete arriba, que el titulo del documento es lo que manda.
logo = svg2rlg(WEB + 'src/images/logo-hogarterapeutico-simplificado.svg')
esc = 66.0 / logo.width
logo.width *= esc; logo.height *= esc; logo.scale(esc, esc)
renderPDF.draw(logo, c, MARGEN, cima - logo.height)

c.setFont('FR-b', 15.5)
c.setFillColor(CLAY_500)
c.drawString(MARGEN + logo.width + 9, cima - logo.height / 2 - 5.4, 'Hogar Terapéutico')

c.setFont('PS', 7.4)
c.setFillColor(INK_MUTE)
for i, linea in enumerate(['Angie Sánchez Gallego',
                           'Psicóloga General Sanitaria · Col. M-42569',
                           'hogarterapeutico.com']):
    c.drawRightString(W - MARGEN, cima - 7 - i * 10.5, linea)

y = cima - logo.height - 40
c.setFont('FR-b', 20)
c.setFillColor(CLAY_600)
c.drawString(MARGEN, y, 'Registro de pensamientos')

y -= 15
c.setFont('PS', 8.6)
c.setFillColor(INK_MUTE)
c.drawString(MARGEN, y, 'Anota una situación concreta y recorre la fila de izquierda a derecha. '
                        'No hay respuestas correctas: lo que sirve es verlo escrito.')

# --- tabla ------------------------------------------------------------------
COLUMNAS = [
    ('Situación',               '¿Qué pasó? Dónde y con quién',       1.05, 'clay'),
    ('Pensamiento distorsionado','Lo que te dijiste en ese momento',   1.35, 'clay'),
    ('Emoción negativa',        'Cómo te sentiste, y cuánto (0-10)',   0.95, 'clay'),
    ('¿Distorsión cognitiva?',  'Qué tipo de trampa reconoces',        0.95, 'pivote'),
    ('Pensamiento alternativo', 'Otra forma de mirarlo, más justa',    1.40, 'sage'),
    ('Emoción positiva',        'Cómo te sientes ahora, y cuánto',     0.95, 'sage'),
]
TONOS = {
    'clay':   (CLAY_100, CLAY_600, CLAY_50),
    'pivote': (HexColor('#EFEAE4'), HexColor('#5C4A42'), HexColor('#FAF7F4')),
    'sage':   (SAGE_100, SAGE_700, SAGE_50),
}

izq, der = MARGEN, W - MARGEN
ancho = der - izq
peso = sum(col[2] for col in COLUMNAS)
anchos = [ancho * col[2] / peso for col in COLUMNAS]
xs = [izq]
for a in anchos:
    xs.append(xs[-1] + a)

FILAS = 4
ALTO_CAB = 34
tope = y - 20
base = MARGEN
alto_fila = (tope - base - ALTO_CAB) / FILAS

# fondo de cada columna, en su tono
for i, (_, _, _, fam) in enumerate(COLUMNAS):
    c.setFillColor(TONOS[fam][2])
    c.rect(xs[i], base, anchos[i], tope - base - ALTO_CAB, stroke=0, fill=1)

# cabecera de columnas
for i, (titulo, pista, _, fam) in enumerate(COLUMNAS):
    fondo, tinta, _ = TONOS[fam]
    c.setFillColor(fondo)
    c.rect(xs[i], tope - ALTO_CAB, anchos[i], ALTO_CAB, stroke=0, fill=1)
    c.setFillColor(tinta)
    c.setFont('PS-b', 8.2)
    c.drawCentredString(xs[i] + anchos[i] / 2, tope - 14, titulo)
    c.setFont('PS', 6.5)
    c.setFillColor(INK_MUTE)
    c.drawCentredString(xs[i] + anchos[i] / 2, tope - 25, pista)

# rejilla
c.setStrokeColor(CLAY_200)
c.setLineWidth(0.6)
for i in range(len(xs)):
    c.line(xs[i], base, xs[i], tope)
for f in range(FILAS + 1):
    yy = base + f * alto_fila
    c.line(izq, yy, der, yy)
# Las dos reglas de la cabecera van por columna, en el tono de cada familia:
# una linea clay cruzando por debajo de las cabeceras sage cantaba.
c.setLineWidth(0.9)
for i, (_, _, _, fam) in enumerate(COLUMNAS):
    c.setStrokeColor({'clay': CLAY_500, 'sage': HexColor('#7D9C8A'),
                      'pivote': HexColor('#B3A79E')}[fam])
    c.line(xs[i], tope, xs[i + 1], tope)
    c.line(xs[i], tope - ALTO_CAB, xs[i + 1], tope - ALTO_CAB)

# --- campos rellenables -----------------------------------------------------
CLAVES = ['situacion', 'pensamiento', 'emocion_neg', 'distorsion',
          'alternativo', 'emocion_pos']
form = c.acroForm
for f in range(FILAS):
    for i, clave in enumerate(CLAVES):
        form.textfield(
            name=f'{clave}_{f + 1}',
            tooltip=f'{COLUMNAS[i][0]} — fila {f + 1}',
            x=xs[i] + 3, y=base + (FILAS - 1 - f) * alto_fila + 3,
            width=anchos[i] - 6, height=alto_fila - 6,
            borderWidth=0, borderColor=None,
            fillColor=None, textColor=INK,
            # El AcroForm de reportlab solo admite las 14 fuentes estandar: su
            # makeFont emite /Subtype /Type1 con /BaseFont /<nombre>, asi que
            # colar ahi una TTF genera un diccionario de fuente que miente y el
            # visor acaba sustituyendo por su cuenta. Helvetica solo afecta a lo
            # que teclea quien rellena; todo lo impreso va en Public Sans y
            # Frank Ruhl, que si van incrustadas.
            fontName='Helvetica', fontSize=8.5,
            fieldFlags='multiline', forceBorder=False,
        )

SALIDA = os.path.join(SALIDA_DIR, 'Registro de pensamientos - Hogar Terapeutico.pdf')
c.save()

# reportlab no escribe /NeedAppearances. Sin esa marca, cada visor decide por su
# cuenta como pinta lo que se teclea y el resultado baila entre Vista Previa,
# Acrobat y el movil. Con ella, todos construyen la apariencia desde el /DA del
# campo, que es el que lleva el cuerpo y el color de tinta de la marca.
from pypdf import PdfReader, PdfWriter
from pypdf.generic import NameObject, BooleanObject

lector = PdfReader(SALIDA)
escritor = PdfWriter(clone_from=lector)
escritor._root_object['/AcroForm'][NameObject('/NeedAppearances')] = BooleanObject(True)
with open(SALIDA, 'wb') as f:
    escritor.write(f)

print('PDF generado')
