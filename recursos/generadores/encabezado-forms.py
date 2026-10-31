# -*- coding: utf-8 -*-
"""Imagen de encabezado para formularios de Google Forms.

Forms la pide en 1600x400 (4:1). Va solo la marca, sin titulo: el titulo
del formulario ya lo pone Forms justo debajo, y asi la misma imagen sirve
para todos. El fondo es el rosa claro de la web, que es tambien el tono mas
claro que Forms propone cuando el color del tema es #9C6666.

Todo el contenido queda dentro de un margen amplio: en el movil Forms
escala la imagen y lo que va pegado a los bordes acaba ilegible.
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from reportlab.pdfgen import canvas
from reportlab.graphics import renderPDF
from reportlab.pdfbase import pdfmetrics
from svglib.svglib import svg2rlg
from marca import *

AQUI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DESTINO = os.path.join(AQUI, 'salida', 'Encabezado Google Forms - Hogar Terapeutico.png')

W, H = 1600, 400          # puntos = pixeles: sips rasteriza el PDF a 72 ppp
MARGEN = 120


def encabezado():
    cargar_fuentes()
    os.makedirs(os.path.dirname(DESTINO), exist_ok=True)
    tmp = DESTINO.replace('.png', '.pdf')
    c = canvas.Canvas(tmp, pagesize=(W, H))
    c.setFillColor(CLAY_50); c.rect(0, 0, W, H, stroke=0, fill=1)

    # Logo y nombre, como en la cabecera de la web.
    logo = svg2rlg(WEB + 'src/images/logo-hogarterapeutico-simplificado.svg')
    e = 118 / logo.height
    logo.width *= e; logo.height *= e; logo.scale(e, e)
    centro = H / 2 + 14
    renderPDF.draw(logo, c, MARGEN, centro - logo.height / 2)
    x = MARGEN + logo.width + 34
    cuerpo = 74
    c.setFont('FR-b', cuerpo); c.setFillColor(CLAY_500)
    c.drawString(x, centro + 4, 'Hogar Terapéutico')

    # La ficha colegial debajo del nombre y no a la derecha: a la derecha no
    # cabia sin pisar el nombre, y en una sola linea se lee mejor en el movil.
    ficha = 'Angie Sánchez Gallego · Psicóloga General Sanitaria · Col. M-42569'
    c.setFont('PS', 25); c.setFillColor(INK_MUTE)
    c.drawString(x + 3, centro - 44, ficha)
    fin = max(x + pdfmetrics.stringWidth('Hogar Terapéutico', 'FR-b', cuerpo),
              x + 3 + pdfmetrics.stringWidth(ficha, 'PS', 25))
    assert fin < W - MARGEN, 'el texto se sale del margen derecho'

    # Filete inferior, el mismo de la banda de los Excel.
    c.setStrokeColor(CLAY_200); c.setLineWidth(5)
    c.line(MARGEN, 78, W - MARGEN, 78)
    c.save()

    os.system(f'sips -s format png "{tmp}" --out "{DESTINO}" >/dev/null 2>&1')
    os.remove(tmp)
    return DESTINO


if __name__ == '__main__':
    print(' ', encabezado())
