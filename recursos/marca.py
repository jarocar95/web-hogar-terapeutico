# -*- coding: utf-8 -*-
"""Base comun de los materiales de Hogar Terapeutico.

Paleta, tipografias, membrete y el remate de formulario, en un solo sitio para
que todos los documentos de la serie salgan identicos.
"""
import os
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.graphics import renderPDF
from svglib.svglib import svg2rlg

AQUI = os.path.dirname(os.path.abspath(__file__))
WEB = os.path.abspath(os.path.join(AQUI, '..')) + '/'
FUENTES = os.path.join(AQUI, 'fuentes')

CLAY_800, CLAY_700 = HexColor('#4C2F2D'), HexColor('#6B4340')
CLAY_600, CLAY_500 = HexColor('#85554F'), HexColor('#9C6666')
CLAY_400, CLAY_300 = HexColor('#BC8078'), HexColor('#D5A49C')
CLAY_200, CLAY_100, CLAY_50 = HexColor('#E7C7C1'), HexColor('#F4E3DF'), HexColor('#FBF2F0')
SAGE_700, SAGE_500 = HexColor('#38534A'), HexColor('#5E8570')
SAGE_300 = HexColor('#A1BFAE')
SAGE_200, SAGE_100, SAGE_50 = HexColor('#BCD3C4'), HexColor('#DDE9E1'), HexColor('#F1F6F2')
CANVAS, INK, INK_MUTE = HexColor('#FEFBF8'), HexColor('#4A3B3B'), HexColor('#6E5B58')

FICHA = ['Angie Sánchez Gallego',
         'Psicóloga General Sanitaria · Col. M-42569',
         'hogarterapeutico.com']


# Las fuentes de la web son variables y en woff2; reportlab necesita TTF
# estaticas. Se derivan de src/fonts la primera vez y se cachean en fuentes/,
# que esta en .gitignore: no tiene sentido versionar binarios derivados.
DERIVADAS = [('PS', 'PublicSans-400', 'public-sans-var.woff2', 'Public Sans', 400, 'Regular'),
             ('PS-b', 'PublicSans-700', 'public-sans-var.woff2', 'Public Sans', 700, 'Bold'),
             ('FR-b', 'FrankRuhl-700', 'frank-ruhl-libre-var.woff2', 'Frank Ruhl Libre', 700, 'Bold')]


def _derivar(origen, familia, peso, estilo, destino):
    from fontTools.ttLib import TTFont as FT
    from fontTools.varLib import instancer
    f = FT(WEB + 'src/fonts/' + origen); f.flavor = None
    est = instancer.instantiateVariableFont(f, {'wght': peso}, inplace=False)
    # Nombre PostScript unico por peso: si se repite, reportlab funde las
    # instancias en una sola y la negrita acaba saliendo redonda.
    nombres = {1: familia, 2: estilo, 4: f'{familia} {estilo}',
               6: f'{familia.replace(" ", "")}-{estilo}', 16: familia, 17: estilo}
    for idn, valor in nombres.items():
        est['name'].setName(valor, idn, 3, 1, 0x409)
        est['name'].setName(valor, idn, 1, 0, 0)
    est['OS/2'].usWeightClass = peso
    os.makedirs(os.path.dirname(destino), exist_ok=True)
    est.save(destino)


def cargar_fuentes():
    for nom, fich, origen, familia, peso, estilo in DERIVADAS:
        try:
            pdfmetrics.getFont(nom)
            continue
        except KeyError:
            pass
        ruta = os.path.join(FUENTES, fich + '.ttf')
        if not os.path.exists(ruta):
            _derivar(origen, familia, peso, estilo, ruta)
        pdfmetrics.registerFont(TTFont(nom, ruta))


def fondo(c, W, H):
    c.setFillColor(CANVAS)
    c.rect(0, 0, W, H, stroke=0, fill=1)


def membrete(c, W, H, margen, ancho_logo=66.0, cuerpo_marca=15.5, ficha=True):
    """Logotipo + nombre a la izquierda y los datos colegiales a la derecha.

    El logotipo simplificado no lleva texto (en la web va con alt="" y el nombre
    se pone al lado), asi que aqui se recompone el mismo bloque.
    """
    cima = H - margen
    logo = svg2rlg(WEB + 'src/images/logo-hogarterapeutico-simplificado.svg')
    esc = ancho_logo / logo.width
    logo.width *= esc; logo.height *= esc; logo.scale(esc, esc)
    renderPDF.draw(logo, c, margen, cima - logo.height)
    c.setFont('FR-b', cuerpo_marca); c.setFillColor(CLAY_500)
    c.drawString(margen + logo.width + 9, cima - logo.height / 2 - cuerpo_marca * 0.35,
                 'Hogar Terapéutico')
    if ficha:
        c.setFont('PS', 7.4); c.setFillColor(INK_MUTE)
        for i, linea in enumerate(FICHA):
            c.drawRightString(W - margen, cima - 7 - i * 10.5, linea)
    return cima - logo.height


def cortar(texto, fuente, cuerpo, ancho):
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


def rematar(ruta):
    """Marca /NeedAppearances: sin ella cada visor pinta lo tecleado a su aire."""
    from pypdf import PdfReader, PdfWriter
    from pypdf.generic import NameObject, BooleanObject
    escritor = PdfWriter(clone_from=PdfReader(ruta))
    af = escritor._root_object.get('/AcroForm')
    if af is not None:
        af = af.get_object()   # segun el documento llega directo o indirecto
        af[NameObject('/NeedAppearances')] = BooleanObject(True)
        with open(ruta, 'wb') as f:
            escritor.write(f)
