# -*- coding: utf-8 -*-
"""Genera la banda de membrete en PNG, para incrustarla en los libros de Excel."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from reportlab.pdfgen import canvas
from reportlab.graphics import renderPDF
from reportlab.pdfbase import pdfmetrics
from svglib.svglib import svg2rlg
from reportlab.lib.colors import white
from marca import *

AQUI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DESTINO = os.path.join(AQUI, 'marca-img', 'banda.png')


def banda(px_w=680, px_h=120, esc=3):
    cargar_fuentes()
    W, H = px_w * esc, px_h * esc
    tmp = DESTINO.replace('.png', '.pdf')
    os.makedirs(os.path.dirname(DESTINO), exist_ok=True)
    c = canvas.Canvas(tmp, pagesize=(W, H))
    c.setFillColor(white); c.rect(0, 0, W, H, stroke=0, fill=1)
    logo = svg2rlg(WEB + 'src/images/logo-hogarterapeutico-simplificado.svg')
    e = (H * 0.44) / logo.height
    logo.width *= e; logo.height *= e; logo.scale(e, e)
    renderPDF.draw(logo, c, H * 0.14, H * 0.38)
    x = H * 0.14 + logo.width + H * 0.10
    nombre, cn = 'Angie Sánchez Gallego', H * 0.095
    lineas = ['Psicóloga General Sanitaria · Col. M-42569', 'hogarterapeutico.com']
    cw = H * 0.095
    inicio = W - H * 0.14 - max(pdfmetrics.stringWidth(t, 'PS', cw) for t in lineas)
    cuerpo = H * 0.22
    while cuerpo > H * 0.10:                      # se encoge hasta que quepa
        fin = max(x + pdfmetrics.stringWidth('Hogar Terapéutico', 'FR-b', cuerpo),
                  x + pdfmetrics.stringWidth(nombre, 'PS', cn))
        if inicio > fin + H * 0.14:
            break
        cuerpo -= H * 0.005
    c.setFont('FR-b', cuerpo); c.setFillColor(CLAY_500)
    c.drawString(x, H * 0.50, 'Hogar Terapéutico')
    c.setFont('PS', cn); c.setFillColor(INK_MUTE)
    c.drawString(x, H * 0.29, nombre)
    c.setFont('PS', cw); c.setFillColor(INK_MUTE)
    for i, t in enumerate(lineas):
        c.drawRightString(W - H * 0.14, H * 0.50 - i * H * 0.19, t)
    c.setStrokeColor(CLAY_200); c.setLineWidth(H * 0.02)
    c.line(H * 0.14, H * 0.15, W - H * 0.14, H * 0.15)
    c.save()
    os.system(f'sips -s format png "{tmp}" --out "{DESTINO}" >/dev/null 2>&1')
    os.system(f'sips -z {px_h} {px_w} "{DESTINO}" >/dev/null 2>&1')
    os.remove(tmp)
    return DESTINO


if __name__ == '__main__':
    print(' ', banda())
