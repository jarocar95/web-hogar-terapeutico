import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SALIDA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'salida')
os.makedirs(SALIDA_DIR, exist_ok=True)
# -*- coding: utf-8 -*-
"""La ventana de tolerancia, como herramienta y no como cartel."""
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from marca import *

SALIDA = os.path.join(SALIDA_DIR, 'La ventana de tolerancia - Hogar Terapeutico.pdf')
cargar_fuentes()
W, H = A4
MARGEN = 34

# La imagen de partida usaba colores de semaforo: naranja arriba, AMARILLO en la
# ventana y VERDE en la hipoactivacion. El color de "adelante" marcaba el bloqueo
# y el de "precaucion" el estado que se busca. Aqui la ventana se lleva el sage,
# que en el resto de materiales ya es el tono de la salida; arriba clay, que es
# calor y exceso; abajo un tono apagado, que es justo lo que pasa ahi.
ZONAS = [
    dict(clave='hiper', titulo='Hiperactivación', apunte='demasiado', alto=104,
         banda=HexColor('#F2D9D4'), tinta=CLAY_700, suave=HexColor('#FAEDEA'),
         senales='Ansiedad, pánico, ira, impulsividad, hipervigilancia, pensamientos '
                 'acelerados, corazón disparado, no poder parar quieto.',
         rotulo='Para bajar',
         ayuda='Exhalar más largo que inhalar · Agua fría en la cara · Descargar el '
               'cuerpo: andar rápido, sacudir los brazos · Nombrar cinco cosas que ves'),
    dict(clave='ventana', titulo='Ventana de tolerancia', apunte='aquí puedes', alto=134,
         banda=HexColor('#D2E3D8'), tinta=SAGE_700, suave=HexColor('#EDF4EF'),
         senales='Calma y alerta a la vez. Piensas con claridad, estás presente, puedes '
                 'sentir cosas difíciles sin que te arrastren y eliges qué haces.',
         rotulo='Aquí no hay nada que corregir',
         ayuda='No es estar bien todo el rato: es poder con lo que hay. La ventana se '
               'ensancha con el tiempo, y ensancharla es buena parte del trabajo.'),
    dict(clave='hipo', titulo='Hipoactivación', apunte='demasiado poco', alto=104,
         banda=HexColor('#D8D2CE'), tinta=HexColor('#4F4642'), suave=HexColor('#F0ECE9'),
         senales='Bloqueo, desconexión, ir en automático, vacío, vergüenza, cuerpo '
                 'pesado, no sentir nada, sueño que no descansa.',
         rotulo='Para subir',
         ayuda='Mover el cuerpo, ponerte de pie · Agua fría en las manos · Olores '
               'intensos · Hablar en voz alta · Buscar a alguien'),
]

c = canvas.Canvas(SALIDA, pagesize=(W, H))
c.setTitle('La ventana de tolerancia')
c.setAuthor('Angie Sánchez Gallego · Hogar Terapéutico')
c.setSubject('Hiperactivación, ventana de tolerancia e hipoactivación')
c.setCreator('hogarterapeutico.com')

fondo(c, W, H)
y = membrete(c, W, H, MARGEN) - 26
c.setFont('FR-b', 21); c.setFillColor(CLAY_600)
c.drawString(MARGEN, y, 'La ventana de tolerancia')
y -= 15
for linea in cortar('Tu sistema nervioso tiene una franja en la que funciona bien. Por encima te '
                    'desbordas; por debajo te apagas. Salirse es normal y le pasa a todo el mundo: '
                    'lo que se entrena es volver, y que la franja sea cada vez más ancha. Esta hoja '
                    'no hay que rellenarla: es para tenerla a mano y volver a ella cuando la necesites.',
                    'PS', 8.7, W - 2 * MARGEN):
    c.setFont('PS', 8.7); c.setFillColor(INK_MUTE)
    c.drawString(MARGEN, y, linea); y -= 11.3

izq, der = MARGEN, W - MARGEN
ANCHO = der - izq

# ============ 1. el dibujo, a todo el ancho ================================
y -= 20
tops = {}
for z in ZONAS:
    c.setFillColor(z['banda'])
    c.rect(izq, y - z['alto'], ANCHO, z['alto'], stroke=0, fill=1)
    tops[z['clave']] = (y, y - z['alto'])
    y -= z['alto']
base_dibujo = y
vy0, vy1 = tops['ventana']

# nombre de cada zona, dentro de su banda
for z in ZONAS:
    y0, y1 = tops[z['clave']]
    c.setFont('PS-b', 8.8); c.setFillColor(z['tinta'])
    c.drawString(izq + 38, (y0 + y1) / 2 - 3, z['titulo'].upper())

# la ventana, enmarcada: es la unica que lleva borde
c.setStrokeColor(HexColor('#7FA68D')); c.setLineWidth(1.5)
c.rect(izq, vy1, ANCHO, vy0 - vy1, stroke=1, fill=0)

# --- recorrido de un dia ----------------------------------------------------
gx0, gx1 = izq + 164, der - 16
vent = (vy0 + vy1) / 2
ch = (tops['hiper'][0] + tops['hiper'][1]) / 2
cb = (tops['hipo'][0] + tops['hipo'][1]) / 2
nodos = [(0.00, vent + 6), (0.13, vent + 14), (0.30, ch), (0.45, vent + 10),
         (0.58, vent - 8), (0.74, cb), (0.89, vent - 6), (1.00, vent + 2)]
puntos = []
for i in range(321):
    t = i / 320
    for j in range(len(nodos) - 1):
        t0, v0 = nodos[j]; t1, v1 = nodos[j + 1]
        if t0 <= t <= t1:
            u = 0 if t1 == t0 else (t - t0) / (t1 - t0)
            puntos.append((gx0 + (gx1 - gx0) * t, v0 + (v1 - v0) * (u * u * (3 - 2 * u))))
            break
c.setStrokeColor(CLAY_600); c.setLineWidth(2.0); c.setLineCap(1); c.setLineJoin(1)
p = c.beginPath(); p.moveTo(*puntos[0])
for pt in puntos[1:]:
    p.lineTo(*pt)
c.drawPath(p)
c.setFillColor(CLAY_600); c.circle(*puntos[-1], 2.8, stroke=0, fill=1)
c.setFont('PS', 6.8); c.setFillColor(INK_MUTE)
c.drawString(gx0, base_dibujo - 12, 'el recorrido de un día cualquiera')
c.drawRightString(gx1 - 12, base_dibujo - 12, 'tiempo')
p = c.beginPath(); p.moveTo(gx1, base_dibujo - 9.6)
p.lineTo(gx1 - 7, base_dibujo - 12.4); p.lineTo(gx1 - 7, base_dibujo - 6.8); p.close()
c.setFillColor(INK_MUTE); c.drawPath(p, stroke=0, fill=1)

# --- flechas: la ventana se puede ensanchar ---------------------------------
fx = izq + 19
for arriba in (True, False):
    y0, dy = (vy0, 20) if arriba else (vy1, -20)
    c.setStrokeColor(HexColor('#7FA68D')); c.setLineWidth(1.5)
    c.line(fx, y0, fx, y0 + dy)
    c.setFillColor(HexColor('#7FA68D'))
    p = c.beginPath(); p.moveTo(fx, y0 + dy + (4.6 if arriba else -4.6))
    p.lineTo(fx - 3.7, y0 + dy); p.lineTo(fx + 3.7, y0 + dy); p.close()
    c.drawPath(p, stroke=0, fill=1)

# ============ 2. la explicacion, en tres columnas ==========================
y = base_dibujo - 38
CANAL = 15
col = (ANCHO - 2 * CANAL) / 3
cimas = []
for i, z in enumerate(ZONAS):
    x = izq + i * (col + CANAL)
    ty = y
    c.setFillColor(z['tinta']); c.rect(x, ty - 8, 3, 13, stroke=0, fill=1)
    c.setFont('PS-b', 9.8); c.setFillColor(z['tinta'])
    c.drawString(x + 10, ty - 7, z['titulo'])
    ty -= 19
    c.setFont('PS', 6.9); c.setFillColor(INK_MUTE)
    c.drawString(x + 10, ty, z['apunte']); ty -= 12
    for linea in cortar(z['senales'], 'PS', 8.1, col):
        c.setFont('PS', 8.1); c.setFillColor(INK)
        c.drawString(x, ty, linea); ty -= 10.4
    ty -= 5
    c.setFont('PS-b', 7.3); c.setFillColor(z['tinta'])
    c.drawString(x, ty, z['rotulo'].upper()); ty -= 10.4
    for linea in cortar(z['ayuda'], 'PS', 8.0, col):
        c.setFont('PS', 8.0); c.setFillColor(INK_MUTE)
        c.drawString(x, ty, linea); ty -= 10.2
    cimas.append(ty)
c.setFont('PS-b', 7.2); c.setFillColor(INK_MUTE)
c.drawString(izq, y + 11, 'CÓMO SE RECONOCE CADA ZONA, Y QUÉ AYUDA A VOLVER')

# ============ 3. que la estrecha y que la ensancha =========================
y = min(cimas) - 22
mitad = (ANCHO - 16) / 2
bloques = []
for rot, tinta, fdo, items in [
        ('Qué la estrecha', CLAY_600, CLAY_50,
         'Dormir poco · Saltarte comidas · Alcohol · Estrés sostenido sin pausas · '
         'Aislarte · Remover algo no resuelto sin apoyo'),
        ('Qué la ensancha', SAGE_700, SAGE_50,
         'Sueño regular · Movimiento casi diario · Gente con la que estás a salvo · '
         'Practicar la regulación cuando NO la necesitas · Terapia')]:
    bloques.append((rot, tinta, fdo, cortar(items, 'PS', 8.0, mitad - 20)))
alto = 18 + max(len(b[3]) for b in bloques) * 10.4 + 10
for i, (rot, tinta, fdo, lineas) in enumerate(bloques):
    x = izq + i * (mitad + 16)
    c.setFillColor(fdo); c.roundRect(x, y - alto, mitad, alto, 7, stroke=0, fill=1)
    c.setFont('PS-b', 8.6); c.setFillColor(tinta)
    c.drawString(x + 10, y - 15, rot)
    yy = y - 29
    for linea in lineas:
        c.setFont('PS', 8.0); c.setFillColor(INK)
        c.drawString(x + 10, yy, linea); yy -= 10.4

c.setFont('PS', 7.6); c.setFillColor(INK_MUTE)
c.drawCentredString(W / 2, MARGEN + 2,
                    'Si te pasas la mayor parte del tiempo fuera de la ventana, o volver te cuesta '
                    'cada vez más, eso es justo lo que se trabaja en terapia.')

c.save()
print(f'PDF generado · fondo del bloque inferior en y={y - alto:.0f} (margen {MARGEN})')
