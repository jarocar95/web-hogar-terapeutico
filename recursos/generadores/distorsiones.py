import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SALIDA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'salida')
os.makedirs(SALIDA_DIR, exist_ok=True)
# -*- coding: utf-8 -*-
"""Las distorsiones cognitivas, con la marca de Hogar Terapeutico."""
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.graphics import renderPDF
from marca import *
from svglib.svglib import svg2rlg
from contenido.distorsiones import DISTORSIONES, INTRO, CIERRE

SALIDA = os.path.join(SALIDA_DIR, 'Distorsiones cognitivas - Hogar Terapeutico.pdf')

CLAY_600, CLAY_500 = HexColor('#85554F'), HexColor('#9C6666')
CLAY_300, CLAY_200, CLAY_100 = HexColor('#D5A49C'), HexColor('#E7C7C1'), HexColor('#F4E3DF')
SAGE_700, SAGE_500, SAGE_100 = HexColor('#38534A'), HexColor('#5E8570'), HexColor('#DDE9E1')
CANVAS, INK, INK_MUTE = HexColor('#FEFBF8'), HexColor('#4A3B3B'), HexColor('#6E5B58')


W, H = A4
COLUMNAS = 2
MARGEN, CANAL = 40, 24
ANCHO_COL = (W - 2 * MARGEN - CANAL * (COLUMNAS - 1)) / COLUMNAS
CUERPO, INTERLINEA = 9.2, 11.9

cargar_fuentes()
c = canvas.Canvas(SALIDA, pagesize=(W, H))
c.setTitle('Distorsiones cognitivas')
c.setAuthor('Angie Sánchez Gallego · Hogar Terapéutico')
c.setSubject('Las quince distorsiones cognitivas más frecuentes')
c.setCreator('hogarterapeutico.com')


def cortar(texto, fuente, cuerpo, ancho):
    """Parte el texto en lineas que caben en 'ancho'."""
    lineas, actual = [], ''
    for palabra in texto.split():
        prueba = f'{actual} {palabra}'.strip()
        if pdfmetrics.stringWidth(prueba, fuente, cuerpo) <= ancho:
            actual = prueba
        else:
            if actual:
                lineas.append(actual)
            actual = palabra
    if actual:
        lineas.append(actual)
    return lineas


def escribir(texto, x, y, ancho, fuente='PS', cuerpo=CUERPO, tinta=INK, salto=INTERLINEA):
    c.setFont(fuente, cuerpo)
    c.setFillColor(tinta)
    for linea in cortar(texto, fuente, cuerpo, ancho):
        c.drawString(x, y, linea)
        y -= salto
    return y


def lineas_rotulo(etiqueta, texto, ancho):
    """Reparte el texto: la primera linea esquiva la etiqueta, el resto no."""
    sangria = pdfmetrics.stringWidth(etiqueta.upper(), 'PS-b', 7.8) + 5
    palabras, lineas, actual, primera = texto.split(), [], '', True
    for p in palabras:
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
    c.setFont('PS-b', 7.8); c.setFillColor(tinta)
    c.drawString(x, y, etiqueta.upper())
    c.setFont('PS', CUERPO); c.setFillColor(INK)
    for i, linea in enumerate(lineas):
        c.drawString(x + (sangria if i == 0 else 0), y, linea)
        y -= INTERLINEA
    return y


def alto_entrada(d, ancho):
    _, definicion, ejemplo, delata, pregunta = d
    alto = 13                                            # titulo
    alto += len(cortar(definicion, 'PS', CUERPO, ancho - 15)) * INTERLINEA
    alto += 4 + len(cortar(ejemplo, 'PS', CUERPO, ancho - 21)) * INTERLINEA + 4
    for etiqueta, txt in [('Lo delata', delata), ('Pregúntate', pregunta)]:
        alto += len(lineas_rotulo(etiqueta, txt, ancho - 15)[1]) * INTERLINEA
    return alto + 28                                     # aire hasta la siguiente


def dibujar_entrada(d, n, x, y, ancho):
    nombre, definicion, ejemplo, delata, pregunta = d
    xt = x + 15

    # casilla para marcar las que uno reconoce
    c.acroForm.checkbox(
        name=f'reconozco_{n}', tooltip=f'Marcar «{nombre}»',
        x=x, y=y + 1.6, size=9.8,
        buttonStyle='check', shape='square',
        borderWidth=0.7, borderColor=CLAY_300, fillColor=None, textColor=CLAY_600,
        checked=False, forceBorder=True,
    )
    c.setFont('PS-b', 7.2); c.setFillColor(CLAY_300)
    c.drawString(xt, y + 4.2, f'{n:02d}')
    c.setFont('PS-b', 10.6); c.setFillColor(CLAY_600)
    c.drawString(xt + 13, y + 3.4, nombre)
    y -= 9.5

    y = escribir(definicion, xt, y, ancho - 15, tinta=INK)

    # el ejemplo: la trampa, en clay y tras un filete
    y -= 1
    lineas = cortar(ejemplo, 'PS', CUERPO, ancho - 21)
    alto_bloque = len(lineas) * INTERLINEA
    c.setStrokeColor(CLAY_200); c.setLineWidth(1.6)
    c.line(xt + 1, y + 7, xt + 1, y + 7 - alto_bloque)
    c.setFont('PS', CUERPO); c.setFillColor(CLAY_600)
    for linea in lineas:
        c.drawString(xt + 7, y, linea); y -= INTERLINEA
    y -= 3

    y = rotular('Lo delata', delata, xt, y, ancho - 15, INK_MUTE)
    y = rotular('Pregúntate', pregunta, xt, y, ancho - 15, SAGE_500)
    return y - 28


def fondo():
    c.setFillColor(CANVAS); c.rect(0, 0, W, H, stroke=0, fill=1)


def membrete(primera):
    """Cabecera. En la primera pagina, el bloque completo; en la segunda, discreta."""
    cima = H - MARGEN
    logo = svg2rlg(WEB + 'src/images/logo-hogarterapeutico-simplificado.svg')
    esc = (62.0 if primera else 44.0) / logo.width
    logo.width *= esc; logo.height *= esc; logo.scale(esc, esc)
    renderPDF.draw(logo, c, MARGEN, cima - logo.height)
    c.setFont('FR-b', 14.5 if primera else 10.5); c.setFillColor(CLAY_500)
    c.drawString(MARGEN + logo.width + 8, cima - logo.height / 2 - (5.1 if primera else 3.7),
                 'Hogar Terapéutico')
    c.setFont('PS', 7.2); c.setFillColor(INK_MUTE)
    if primera:
        for i, linea in enumerate(['Angie Sánchez Gallego',
                                   'Psicóloga General Sanitaria · Col. M-42569',
                                   'hogarterapeutico.com']):
            c.drawRightString(W - MARGEN, cima - 7 - i * 10.2, linea)
    else:
        c.drawRightString(W - MARGEN, cima - logo.height / 2 - 3, 'Distorsiones cognitivas')
    return cima - logo.height - (34 if primera else 22)


# --- pagina 1 ---------------------------------------------------------------
fondo()
y = membrete(True)
c.setFont('FR-b', 22); c.setFillColor(CLAY_600)
c.drawString(MARGEN, y, 'Distorsiones cognitivas')
y -= 17
y = escribir(INTRO, MARGEN, y, W - 2 * MARGEN, cuerpo=8.6, tinta=INK_MUTE, salto=11.2)
y -= 12
c.setStrokeColor(CLAY_200); c.setLineWidth(0.6)
c.line(MARGEN, y, W - MARGEN, y)
y -= 18

TOPE_COL, SUELO = y, MARGEN + 16
col, cy, primera_pag = 0, y, True

for n, d in enumerate(DISTORSIONES, 1):
    alto = alto_entrada(d, ANCHO_COL)
    if cy - alto < SUELO:
        col += 1
        if col > COLUMNAS - 1:                                  # pagina nueva
            c.showPage(); fondo()
            TOPE_COL = membrete(False) - 6
            col, primera_pag = 0, False
        cy = TOPE_COL
    x = MARGEN + col * (ANCHO_COL + CANAL)
    cy = dibujar_entrada(d, n, x, cy, ANCHO_COL)

# --- cierre -----------------------------------------------------------------
x = MARGEN + col * (ANCHO_COL + CANAL)
if cy - 62 < SUELO:
    col += 1; x = MARGEN + col * (ANCHO_COL + CANAL); cy = TOPE_COL
c.setFillColor(SAGE_100)
alto_cierre = len(cortar(CIERRE, 'PS', CUERPO, ANCHO_COL - 22)) * INTERLINEA + 30
c.roundRect(x, cy - alto_cierre + 8, ANCHO_COL, alto_cierre, 7, stroke=0, fill=1)
c.setFont('PS-b', 8.6); c.setFillColor(SAGE_700)
c.drawString(x + 11, cy - 5, 'Y ahora, ¿qué hago con esto?')
escribir(CIERRE, x + 11, cy - 19, ANCHO_COL - 22, tinta=SAGE_700)

c.save()

# /NeedAppearances, por el mismo motivo que en el registro: que las casillas se
# pinten igual en Vista Previa, en Acrobat y en el movil.
from pypdf import PdfReader, PdfWriter
from pypdf.generic import NameObject, BooleanObject
lector = PdfReader(SALIDA)
escritor = PdfWriter(clone_from=lector)
escritor._root_object['/AcroForm'][NameObject('/NeedAppearances')] = BooleanObject(True)
with open(SALIDA, 'wb') as f:
    escritor.write(f)
print('PDF generado')
