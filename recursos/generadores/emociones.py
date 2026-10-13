# -*- coding: utf-8 -*-
"""Guia «Aprender a conectar con tus emociones».

Mismo esqueleto que vago-1col.py: los rotulos (numero de ejercicio, cuándo,
cómo, qué entrena) van a un carril izquierdo y el texto se queda en una medida
de unos 65 caracteres, que es lo que se lee bien.

Idioma de color de la serie: clay = el problema, sage = la salida. Aqui las
señales de desconexion y la advertencia van en clay; los ejercicios, el
vocabulario y el plan, en sage.

Se pinta dos veces: la primera solo cuenta paginas, para poder poner «3 / 9»
en el pie. reportlab no sabe el total hasta que termina.
"""
import io, os, sys
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, RAIZ)
SALIDA_DIR = os.path.join(RAIZ, 'salida')
os.makedirs(SALIDA_DIR, exist_ok=True)

from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from marca import *
from contenido import emociones as E

SALIDA = os.path.join(SALIDA_DIR, 'Conectar con tus emociones - Hogar Terapeutico.pdf')
cargar_fuentes()

W, H = A4
# La columna de texto va centrada en la pagina y el carril de rotulos cuelga
# en el margen izquierdo. Antes el texto empezaba a 144 pt del borde y acababa
# a 62 del otro: se leia desplazado a la derecha. Ahora le sobra lo mismo a
# cada lado, y titulos, bandas y cajas se alinean con el texto, no con el
# carril.
IZQ, DER, ABAJO = 50, 50, 52
CARRIL = 72
XT = IZQ + CARRIL                 # donde empieza el texto
TEXTO = W - 2 * XT                # medida del texto, centrada: ~70 caracteres
ANCHO = W - IZQ - DER             # fondo de cajas y bandas, de margen a margen
CUERPO, SALTO = 9.6, 13.3
SUELO = ABAJO + 10


# --- Texto con negritas en linea -------------------------------------------

def cortar_rico(segs, cuerpo, ancho):
    """segs = [(texto, fuente), ...] -> lineas = [[(palabra, fuente), ...]]"""
    esp = pdfmetrics.stringWidth(' ', 'PS', cuerpo)
    lineas, actual, medida = [], [], 0
    for txt, f in segs:
        for pal in txt.split():
            w = pdfmetrics.stringWidth(pal, f, cuerpo)
            if actual and medida + esp + w > ancho:
                lineas.append(actual); actual, medida = [], 0
            medida += (esp if actual else 0) + w
            actual.append((pal, f))
    if actual:
        lineas.append(actual)
    return lineas


class Lienzo:
    def __init__(self, destino, total):
        self.c = canvas.Canvas(destino, pagesize=A4)
        self.total = total
        self.pagina = 1
        c = self.c
        c.setTitle(E.TITULO)
        c.setAuthor('Angie Sánchez Gallego · Hogar Terapéutico')
        c.setSubject('Recurso terapéutico: guía con ejercicios para conectar con las emociones')
        c.setCreator('hogarterapeutico.com')

    # -- primitivas
    def linea_rica(self, x, y, linea, cuerpo, tinta):
        esp = pdfmetrics.stringWidth(' ', 'PS', cuerpo)
        for pal, f in linea:
            self.c.setFont(f, cuerpo); self.c.setFillColor(tinta)
            self.c.drawString(x, y, pal)
            x += pdfmetrics.stringWidth(pal, f, cuerpo) + esp

    def parrafo(self, segs, x, y, ancho, cuerpo=CUERPO, tinta=INK, salto=SALTO):
        if isinstance(segs, str):
            segs = [(segs, 'PS')]
        for linea in cortar_rico(segs, cuerpo, ancho):
            self.linea_rica(x, y, linea, cuerpo, tinta); y -= salto
        return y

    def rotulo(self, txt, y, tinta):
        c = self.c
        c.setFont('PS-b', 7.2); c.setFillColor(tinta)
        # Lo que no cabe parte en dos lineas: «ASCO / RECHAZO» llegaba hasta el
        # borde de la caja del vocabulario.
        lineas = cortar(txt.upper(), 'PS-b', 7.2, CARRIL - 18)
        for i, l in enumerate(lineas):
            c.drawRightString(XT - 14, y - i * 9, l)

    def pie(self):
        c = self.c
        c.setStrokeColor(CLAY_100); c.setLineWidth(0.6)
        c.line(IZQ, ABAJO - 14, W - DER, ABAJO - 14)
        c.setFont('PS', 7.2); c.setFillColor(INK_MUTE)
        c.drawString(IZQ, ABAJO - 27, 'Angie Sánchez Gallego · Psicóloga General Sanitaria · Col. M-42569 · hogarterapeutico.com')
        if self.total:
            c.drawRightString(W - DER, ABAJO - 27, f'{self.pagina} / {self.total}')

    def nueva_pagina(self):
        self.pie()
        self.c.showPage(); self.pagina += 1
        fondo(self.c, W, H)
        y = membrete(self.c, W, H, IZQ, ancho_logo=46, cuerpo_marca=11, ficha=False) - 14
        self.c.setFont('PS', 7.2); self.c.setFillColor(INK_MUTE)
        self.c.drawRightString(W - DER, y + 16, E.TITULO)
        return y - 8

    def portada(self):
        c = self.c
        fondo(c, W, H)
        y = membrete(c, W, H, IZQ) - 40
        c.setFont('FR-b', 25); c.setFillColor(CLAY_600)
        for l in cortar(E.TITULO, 'FR-b', 25, TEXTO):
            c.drawString(XT, y, l); y -= 29
        y -= 2
        y = self.parrafo(E.SUBTITULO, XT, y, TEXTO, cuerpo=11, tinta=INK_MUTE, salto=15)
        y -= 8
        c.setStrokeColor(CLAY_200); c.setLineWidth(1.2)
        c.line(XT, y, XT + 46, y)
        return y - 30


# --- Piezas: cada una sabe cuanto mide y como pintarse ----------------------
# alto() se calcula con las mismas funciones de corte que dibujar(), asi que
# no puede desfasarse: si una pieza no cabe, pasa entera a la pagina siguiente.

class Pieza:
    junto_a_siguiente = False
    def alto(self): raise NotImplementedError
    def dibujar(self, L, y): raise NotImplementedError


def alto_parrafo(segs, ancho, cuerpo=CUERPO, salto=SALTO):
    if isinstance(segs, str):
        segs = [(segs, 'PS')]
    return len(cortar_rico(segs, cuerpo, ancho)) * salto


class Titulo(Pieza):
    junto_a_siguiente = True
    def __init__(self, txt, tinta=CLAY_600, cuerpo=15.5):
        self.txt, self.tinta, self.cuerpo = txt, tinta, cuerpo
    def alto(self):
        return len(cortar(self.txt, 'FR-b', self.cuerpo, TEXTO)) * (self.cuerpo + 4) + 26
    def dibujar(self, L, y):
        if y < H - 150:
            y -= 14          # aire antes, salvo si abre pagina
        L.c.setFont('FR-b', self.cuerpo); L.c.setFillColor(self.tinta)
        for l in cortar(self.txt, 'FR-b', self.cuerpo, TEXTO):
            L.c.drawString(XT, y, l); y -= self.cuerpo + 4
        return y - 8


class Parrafo(Pieza):
    def __init__(self, segs, tinta=INK, despues=7, rotulo=None, tinta_rotulo=SAGE_500, junto=False):
        self.segs, self.tinta, self.despues = segs, tinta, despues
        # Igual que en los ejercicios: lo que acaba en dos puntos presenta lo
        # que viene y no se queda solo al pie («una propuesta para arrancar:»).
        texto = segs if isinstance(segs, str) else segs[-1][0]
        self.junto_a_siguiente = junto or texto.rstrip().endswith(':')
        self.rot, self.tr = rotulo, tinta_rotulo
    def alto(self):
        return alto_parrafo(self.segs, TEXTO) + self.despues
    def dibujar(self, L, y):
        if self.rot:
            L.rotulo(self.rot, y, self.tr)
        return L.parrafo(self.segs, XT, y, TEXTO, tinta=self.tinta) - self.despues


class Lista(Pieza):
    """Vinetas en el carril de texto. tinta_punto marca el idioma de color."""
    def __init__(self, items, tinta_punto=SAGE_300, despues=8):
        self.items, self.tp, self.despues = items, tinta_punto, despues
    def alto(self):
        return sum(alto_parrafo(i, TEXTO - 14) + 3 for i in self.items) + self.despues
    def dibujar(self, L, y):
        for it in self.items:
            L.c.setFillColor(self.tp); L.c.circle(XT + 3, y + 3.3, 1.8, stroke=0, fill=1)
            y = L.parrafo(it, XT + 14, y, TEXTO - 14) - 3
        return y - self.despues


class Caja(Pieza):
    def __init__(self, titulo, texto, fondo_, tinta_titulo, barra=None):
        self.t, self.x, self.f, self.tt, self.b = titulo, texto, fondo_, tinta_titulo, barra
    def alto(self):
        return 30 + alto_parrafo(self.x, TEXTO) + 16
    def dibujar(self, L, y):
        c = L.c
        alto = self.alto() - 8
        c.setFillColor(self.f); c.roundRect(IZQ, y - alto + 14, ANCHO, alto, 8, stroke=0, fill=1)
        if self.b:
            c.setStrokeColor(self.b); c.setLineWidth(2.6)
            c.line(IZQ + 1.3, y - alto + 20, IZQ + 1.3, y + 8)
        c.setFont('PS-b', 10); c.setFillColor(self.tt)
        c.drawString(XT, y - 4, self.t)
        L.parrafo(self.x, XT, y - 22, TEXTO)
        return y - alto - 6


class Banda(Pieza):
    """Cabecera de bloque: «Primer bloque · Volver al cuerpo»."""
    junto_a_siguiente = True
    def __init__(self, n, titulo):
        self.n, self.titulo = n, titulo
    def alto(self):
        return 64
    def dibujar(self, L, y):
        c = L.c
        y -= 8
        c.setFillColor(SAGE_100); c.roundRect(IZQ, y - 14, ANCHO, 36, 8, stroke=0, fill=1)
        c.setFont('PS-b', 7.4); c.setFillColor(SAGE_500)
        c.drawString(XT, y + 9, self.n.upper())
        c.setFont('FR-b', 14); c.setFillColor(SAGE_700)
        c.drawString(XT, y - 6, self.titulo)
        return y - 40


class Capas(Pieza):
    """Los tres componentes de una emocion, en su orden de aparicion."""
    def __init__(self, capas):
        self.capas = capas
    # El nombre va en negrita delante del texto y no en el carril: «Sensación
    # corporal» en versalitas no cabe en 82 pt. El carril se queda el numero,
    # que aqui si dice algo: es el orden en que aparece cada capa.
    def _segs(self, nombre, texto):
        return [(nombre + '.', 'PS-b'), (texto, 'PS')]
    def alto(self):
        return sum(alto_parrafo(self._segs(n, t), TEXTO) + 10 for n, t in self.capas) + 4
    def dibujar(self, L, y):
        for i, (nombre, texto) in enumerate(self.capas, 1):
            L.c.setFont('PS-b', 15); L.c.setFillColor(CLAY_200)
            L.c.drawRightString(XT - 14, y - 1, str(i))
            y = L.parrafo(self._segs(nombre, texto), XT, y, TEXTO) - 10
        return y - 4


class Familia(Pieza):
    """Una familia del vocabulario, en su propia tarjeta. Con las seis en una
    sola caja la tabla medía 345 pt y no se podia partir: saltaba entera a la
    pagina siguiente y dejaba media pagina vacia detras."""
    def __init__(self, familia, palabras):
        self.f, self.p = familia, palabras
    def alto(self):
        return max(alto_parrafo(self.p, TEXTO - 16), 2 * 9) + 20
    def dibujar(self, L, y):
        c = L.c
        alto = self.alto() - 5
        c.setFillColor(SAGE_50)
        c.roundRect(IZQ, y - alto + 10, ANCHO, alto, 6, stroke=0, fill=1)
        y -= 1
        L.rotulo(self.f, y, SAGE_700)
        L.parrafo(self.p, XT, y, TEXTO - 16)
        return y - alto + 1


# Un ejercicio no es una pieza sino varias: cabecera, cada parrafo o lista
# del «cómo», y el «qué entrena». Entero no cabia casi nunca en lo que quedaba
# de pagina y saltaba a la siguiente, dejando medio folio en blanco. Partido
# asi, el corte cae siempre entre dos parrafos, y la cabecera viaja pegada al
# primero: nunca se queda un titulo solo al pie.

def alto_item(p):
    tipo = p[0]
    if tipo == 'p':
        return alto_parrafo(p[1], TEXTO) + 6
    if tipo == 'cita':
        return alto_parrafo([(p[1], 'FR-b')], TEXTO - 18, cuerpo=10.2, salto=14) + 8
    if tipo in ('pasos', 'puntos'):
        return sum(alto_parrafo(i, TEXTO - 16) + 3 for i in p[1]) + 5
    if tipo == 'plantilla':
        return sum(alto_parrafo([(r + ' ', 'PS-b'), (t, 'PS')], TEXTO - 16) + 4 for r, t in p[1]) + 5


class CabeceraEj(Pieza):
    junto_a_siguiente = True
    def __init__(self, e):
        self.e = e
    def alto(self):
        return 22 + alto_parrafo(self.e['cuando'], TEXTO) + 10
    def dibujar(self, L, y):
        c, e = L.c, self.e
        c.setFont('PS-b', 15); c.setFillColor(SAGE_200)
        c.drawRightString(XT - 14, y - 1, f"{e['n']:02d}")
        c.setFont('FR-b', 13.5); c.setFillColor(SAGE_700)
        c.drawString(XT, y, e['titulo'])
        y -= 22
        L.rotulo('Cuándo', y, SAGE_500)
        return L.parrafo(e['cuando'], XT, y, TEXTO, tinta=INK_MUTE) - 10


class ItemEj(Pieza):
    def __init__(self, p, rotulo=None):
        self.p, self.rot = p, rotulo
        # Lo que acaba en dos puntos presenta lo siguiente («hazte una
        # promesa:», «Di internamente:»): si el corte de pagina cae justo ahi,
        # la frase se queda colgando y la cita aparece sola arriba.
        ultimo = p[1] if isinstance(p[1], str) else p[1][-1]
        if isinstance(ultimo, tuple):
            ultimo = ultimo[-1]
        self.junto_a_siguiente = ultimo.rstrip().endswith(':')
    def alto(self):
        return alto_item(self.p)
    def dibujar(self, L, y):
        c, p = L.c, self.p
        if self.rot:
            L.rotulo(self.rot, y, SAGE_500)
        tipo = p[0]
        if tipo == 'p':
            return L.parrafo(p[1], XT, y, TEXTO) - 6
        if tipo == 'cita':
            alto = alto_parrafo([(p[1], 'FR-b')], TEXTO - 18, cuerpo=10.2, salto=14)
            c.setStrokeColor(SAGE_300); c.setLineWidth(2)
            c.line(XT + 2, y + 9, XT + 2, y - alto + 11)
            return L.parrafo([(p[1], 'FR-b')], XT + 14, y, TEXTO - 18,
                             cuerpo=10.2, tinta=SAGE_700, salto=14) - 8
        if tipo == 'pasos':
            desde = p[2] if len(p) > 2 else 1
            for i, it in enumerate(p[1], desde):
                c.setFont('PS-b', CUERPO); c.setFillColor(SAGE_500)
                c.drawString(XT, y, f'{i}.')
                y = L.parrafo(it, XT + 16, y, TEXTO - 16) - 3
            return y - 5
        if tipo == 'puntos':
            for it in p[1]:
                c.setFillColor(SAGE_300); c.circle(XT + 3, y + 3.3, 1.8, stroke=0, fill=1)
                y = L.parrafo(it, XT + 16, y, TEXTO - 16) - 3
            return y - 5
        if tipo == 'plantilla':
            for rot, pista in p[1]:
                y = L.parrafo([(rot + ' ', 'PS-b'), (pista, 'PS')], XT + 16, y, TEXTO - 16) - 4
            return y - 5


class CierreEj(Pieza):
    """El «qué entrena», si lo hay, y el filete que separa del siguiente."""
    def __init__(self, entrena):
        self.entrena = entrena
    def alto(self):
        return (6 + alto_parrafo(self.entrena, TEXTO) if self.entrena else 0) + 28
    def dibujar(self, L, y):
        if self.entrena:
            y -= 6
            L.rotulo('Qué entrena', y, SAGE_500)
            y = L.parrafo(self.entrena, XT, y, TEXTO, tinta=INK_MUTE)
        y -= 10
        L.c.setStrokeColor(CLAY_100); L.c.setLineWidth(0.7)
        L.c.line(IZQ, y + 4, W - DER, y + 4)
        return y - 18


class ElementoLista(Pieza):
    """Un paso, un punto o una linea de plantilla. Las listas se trocean asi
    para que el corte de pagina pueda caer entre dos elementos: enteras, una
    lista de cinco pasos se llevaba consigo a la pagina siguiente la cabecera
    del ejercicio y dejaba un hueco de 170 pt."""
    def __init__(self, tipo, item, num, ultimo):
        self.tipo, self.item, self.num, self.ultimo = tipo, item, num, ultimo
        texto = item[1] if isinstance(item, tuple) else item
        self.junto_a_siguiente = texto.rstrip().endswith(':')
    def _segs(self):
        if self.tipo == 'plantilla':
            return [(self.item[0] + ' ', 'PS-b'), (self.item[1], 'PS')]
        return self.item
    def alto(self):
        return alto_parrafo(self._segs(), TEXTO - 16) + (4 if self.tipo == 'plantilla' else 3) \
            + (5 if self.ultimo else 0)
    def dibujar(self, L, y):
        c = L.c
        if self.tipo == 'pasos':
            c.setFont('PS-b', CUERPO); c.setFillColor(SAGE_500)
            c.drawString(XT, y, f'{self.num}.')
        elif self.tipo == 'puntos':
            c.setFillColor(SAGE_300); c.circle(XT + 3, y + 3.3, 1.8, stroke=0, fill=1)
        y = L.parrafo(self._segs(), XT + 16, y, TEXTO - 16)
        y -= 4 if self.tipo == 'plantilla' else 3
        return y - (5 if self.ultimo else 0)


def ejercicio(e):
    P = [CabeceraEj(e)]
    for i, p in enumerate(e['cuerpo']):
        if p[0] in ('pasos', 'puntos', 'plantilla'):
            desde = p[2] if len(p) > 2 else 1
            for k, item in enumerate(p[1]):
                P.append(ElementoLista(p[0], item, desde + k, k == len(p[1]) - 1))
        else:
            P.append(ItemEj(p, 'Cómo' if i == 0 else None))
    P.append(CierreEj(e['entrena']))
    return P


class CabeceraFase(Pieza):
    """Rotulo de semanas + titulo de la fase. Viaja con su primera linea; el
    resto de la fase se parte por elementos como las listas de los
    ejercicios, para que el plan no salte entero de pagina."""
    junto_a_siguiente = True
    def __init__(self, cuando, titulo):
        self.cuando, self.titulo = cuando, titulo
    def alto(self):
        return 17
    def dibujar(self, L, y):
        L.rotulo(self.cuando, y + 1, SAGE_500)
        L.c.setFont('FR-b', 12); L.c.setFillColor(SAGE_700)
        L.c.drawString(XT, y, self.titulo)
        return y - 17


def fase(cuando, titulo, items, nota):
    P = [CabeceraFase(cuando, titulo)]
    P += [ElementoLista('puntos', it, 0, k == len(items) - 1) for k, it in enumerate(items)]
    if nota:
        P.append(Parrafo(nota, tinta=INK_MUTE, despues=4))
    P.append(Separacion(10))
    return P


# --- El documento, en orden --------------------------------------------------

def piezas():
    P = []
    P.append(Titulo('Por qué cuesta sentir'))
    P += [Parrafo(t) for t in E.POR_QUE]
    P.append(Titulo('Qué es realmente «conectar» con una emoción'))
    P.append(Parrafo(E.QUE_ES, despues=12))
    P.append(Capas(E.CAPAS))
    P.append(Parrafo(E.QUE_ES_CIERRE[0]))
    P.append(Parrafo([(E.QUE_ES_CIERRE[1], 'PS-b')], despues=10))
    P.append(Titulo('Señales de que puedes estar desconectado de lo que sientes'))
    P.append(Parrafo(E.SENALES_INTRO, despues=9))
    P.append(Lista(E.SENALES, tinta_punto=CLAY_300))
    P.append(Caja('Importante', E.IMPORTANTE, SAGE_50, SAGE_700))
    for b in E.BLOQUES:
        P.append(Banda(b['n'], b['titulo']))
        P += [Parrafo(t) for t in b['intro']]
        if b.get('vocabulario'):
            P.append(Titulo('Vocabulario emocional ampliado', tinta=SAGE_700, cuerpo=12.5))
            P.append(Parrafo(E.VOCABULARIO_INTRO, despues=12, junto=True))
            P += [Familia(f, pal) for f, pal in E.VOCABULARIO]
            P.append(Separacion(8))
        P.append(Separacion(10))
        for e in b['ejercicios']:
            P += ejercicio(e)
    P.append(Titulo('Cómo organizar la práctica'))
    P.append(Parrafo(E.PLAN_INTRO, despues=14))
    for f in E.PLAN:
        P += fase(*f)
    P.append(Caja('Una advertencia importante', E.ADVERTENCIA, CLAY_50, CLAY_600, barra=CLAY_300))
    P.append(Separacion(10))
    P.append(Titulo('Una última idea'))
    P += [Parrafo(t) for t in E.ULTIMA_IDEA]
    return P


class Separacion(Pieza):
    junto_a_siguiente = False
    def __init__(self, h): self.h = h
    def alto(self): return self.h
    def dibujar(self, L, y): return y - self.h


def pintar(destino, total):
    L = Lienzo(destino, total)
    y = L.portada()
    lista = piezas()
    i = 0
    while i < len(lista):
        # Un titulo o una banda nunca se quedan solos al pie: viajan con lo
        # que viene detras, encadenando si hay varios seguidos.
        grupo = [lista[i]]
        while grupo[-1].junto_a_siguiente and i + len(grupo) < len(lista):
            grupo.append(lista[i + len(grupo)])
        alto = sum(p.alto() for p in grupo)
        if y - alto < SUELO and not isinstance(grupo[0], Separacion):
            y = L.nueva_pagina()
        for p in grupo:
            if isinstance(p, Separacion) and y > H - 140:
                continue          # no abrir pagina con un hueco
            y = p.dibujar(L, y)
        i += len(grupo)
    L.pie()
    L.c.save()
    return L.pagina


if __name__ == '__main__':
    total = pintar(io.BytesIO(), None)
    pintar(SALIDA, total)
    print(f'PDF generado: {total} paginas')
