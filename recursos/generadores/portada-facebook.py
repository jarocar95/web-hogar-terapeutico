# -*- coding: utf-8 -*-
"""Foto de portada de la pagina de Facebook.

Facebook ensena la portada a 820x312 en el ordenador y a 640x360 en el movil:
dos proporciones distintas sobre la misma imagen. Se sube a 1640x924 (16:9,
lo que ve el movil, al doble para pantallas retina) y el ordenador recorta
una franja central de 1640x624. Todo lo que importa va dentro de esa franja.

En el ordenador Facebook oscurece con un degradado la parte baja de la
portada (ahi pone el boton de editarla), unos 150 px de la franja. Nada de
texto ahi: la primera version tenia la ficha colegial justo encima y se leia
gris sobre gris.

Composicion centrada y no logo a la izquierda como en la imagen de compartir:
la foto de perfil tapa la esquina inferior izquierda de la portada, y lo
centrado queda lejos de ella en los dos formatos.

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
DESTINO = os.path.join(AQUI, 'salida', 'Portada Facebook - Hogar Terapeutico.png')

W, H = 1640, 924          # puntos = pixeles: sips rasteriza el PDF a 72 ppp
FRANJA = 624              # lo que se ve en el ordenador, centrado en vertical
MARGEN = 140
DEGRADADO = 150           # lo que oscurece Facebook abajo, en el ordenador
FONDO = HexColor('#F6EEEE')   # el del favicon y la imagen de compartir


def centrado(c, texto, fuente, cuerpo, y, color):
    c.setFont(fuente, cuerpo); c.setFillColor(color)
    ancho = pdfmetrics.stringWidth(texto, fuente, cuerpo)
    assert ancho < W - 2 * MARGEN, f'no cabe: {texto}'
    c.drawString((W - ancho) / 2, y, texto)


def portada():
    cargar_fuentes()
    os.makedirs(os.path.dirname(DESTINO), exist_ok=True)
    tmp = DESTINO.replace('.png', '.pdf')
    c = canvas.Canvas(tmp, pagesize=(W, H))
    c.setFillColor(FONDO); c.rect(0, 0, W, H, stroke=0, fill=1)

    # De arriba abajo, dentro de la franja visible en el ordenador.
    techo = (H + FRANJA) / 2 - 58
    logo = svg2rlg(WEB + 'src/images/logo-hogarterapeutico-simplificado.svg')
    e = 470 / logo.width
    logo.width *= e; logo.height *= e; logo.scale(e, e)
    renderPDF.draw(logo, c, (W - logo.width) / 2, techo - logo.height)

    y = techo - logo.height - 98
    centrado(c, 'Hogar Terapéutico', 'FR-b', 82, y, CLAY_500)
    y -= 64
    centrado(c, 'Terapia psicológica online para adultos', 'PS', 36, y, INK)

    y -= 36
    c.setStrokeColor(CLAY_200); c.setLineWidth(3)
    c.line(W / 2 - 60, y, W / 2 + 60, y)

    y -= 42
    centrado(c, 'Angie Sánchez Gallego · Psicóloga General Sanitaria · Col. M-42569',
             'PS', 26, y, INK_MUTE)
    suelo = (H - FRANJA) / 2
    assert y - 10 > suelo + DEGRADADO, 'el texto cae en el degradado de Facebook'
    c.save()

    os.system(f'sips -s format png "{tmp}" --out "{DESTINO}" >/dev/null 2>&1')
    os.remove(tmp)
    return DESTINO


if __name__ == '__main__':
    print(' ', portada())
