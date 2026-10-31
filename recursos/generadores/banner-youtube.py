# -*- coding: utf-8 -*-
"""Banner del canal de YouTube.

YouTube pide 2560x1440 y ensena trozos distintos segun el aparato: la tele,
la imagen entera; el ordenador, una franja de 2560x423; el movil, solo el
centro de 1546x423. Esa zona central es la unica que se ve siempre, asi que
todo va dentro de ella y el resto es fondo liso.

Logo a la izquierda y texto a la derecha, no apilados como en la portada de
Facebook: 423 de alto no dan para logo, nombre y dos lineas una debajo de
otra a un tamano legible en el movil.

El logo, entero: nunca se recorta.
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from reportlab.pdfgen import canvas
from reportlab.graphics import renderPDF
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from svglib.svglib import svg2rlg
from marca import *

AQUI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DESTINO = os.path.join(AQUI, 'salida', 'Banner YouTube - Hogar Terapeutico.png')

W, H = 2560, 1440         # puntos = pixeles: sips rasteriza el PDF a 72 ppp
SEGURA_W, SEGURA_H = 1546, 423
MARGEN = 50               # dentro de la zona segura
FONDO = HexColor('#F6EEEE')   # el del favicon y la portada de Facebook


def banner():
    cargar_fuentes()
    os.makedirs(os.path.dirname(DESTINO), exist_ok=True)
    tmp = DESTINO.replace('.png', '.pdf')
    c = canvas.Canvas(tmp, pagesize=(W, H))
    c.setFillColor(FONDO); c.rect(0, 0, W, H, stroke=0, fill=1)

    logo = svg2rlg(WEB + 'src/images/logo-hogarterapeutico-simplificado.svg')
    e = 470 / logo.width
    logo.width *= e; logo.height *= e; logo.scale(e, e)

    nombre, lema = 'Hogar Terapéutico', 'Terapia psicológica online para adultos'
    ficha = 'Angie Sánchez Gallego · Psicóloga General Sanitaria · Col. M-42569'
    anchos = [pdfmetrics.stringWidth(nombre, 'FR-b', 96),
              pdfmetrics.stringWidth(lema, 'PS', 38),
              pdfmetrics.stringWidth(ficha, 'PS', 27)]
    hueco = 60
    total = logo.width + hueco + max(anchos)
    assert total < SEGURA_W - 2 * MARGEN, f'no cabe en la zona segura: {total:.0f}'

    x = (W - total) / 2
    centro = H / 2
    renderPDF.draw(logo, c, x, centro - logo.height / 2 + 6)

    x += logo.width + hueco
    c.setFont('FR-b', 96); c.setFillColor(CLAY_500)
    c.drawString(x, centro + 40, nombre)
    c.setFont('PS', 38); c.setFillColor(INK)
    c.drawString(x + 4, centro - 32, lema)
    c.setStrokeColor(CLAY_200); c.setLineWidth(3)
    c.line(x + 4, centro - 68, x + 124, centro - 68)
    c.setFont('PS', 27); c.setFillColor(INK_MUTE)
    c.drawString(x + 4, centro - 112, ficha)
    c.save()

    os.system(f'sips -s format png "{tmp}" --out "{DESTINO}" >/dev/null 2>&1')
    os.remove(tmp)
    return DESTINO


if __name__ == '__main__':
    print(' ', banner())
