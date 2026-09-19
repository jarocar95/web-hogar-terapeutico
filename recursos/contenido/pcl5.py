# -*- coding: utf-8 -*-
"""PCL-5: lista de comprobacion de sintomas de estres postraumatico (DSM-5).

Elaborada por el National Center for PTSD del Departamento de Asuntos de
Veteranos de EE. UU. Es un documento publico y se distribuye libremente, con la
indicacion de que lo usen profesionales cualificados.

Como en el PHQ-9 y el GAD-7, la redaccion no se retoca. Angie debe cotejar los
enunciados con una version espaniola oficial antes del primer uso.
"""

ESCALA = ['Nada', 'Un poco', 'Moderadamente', 'Bastante', 'Extremadamente']

ENCABEZADO = ('A continuación hay una lista de problemas que a veces tienen las personas después '
              'de una experiencia muy estresante. Indique en qué medida le ha molestado cada '
              'problema durante el último mes.')

# Los cuatro grupos son los criterios B, C, D y E del DSM-5. No es decoracion:
# saber cual pesa mas orienta el trabajo, y en EMDR eso importa.
GRUPOS = [
    ('B · Reexperimentación', 1, 5),
    ('C · Evitación', 6, 7),
    ('D · Alteraciones del pensamiento y del ánimo', 8, 14),
    ('E · Activación y reactividad', 15, 20),
]

ITEMS = [
    'Recuerdos repetidos, molestos y no deseados de la experiencia estresante',
    'Sueños repetidos y molestos sobre la experiencia estresante',
    'Sentir o actuar de repente como si la experiencia estresante estuviera ocurriendo otra vez',
    'Sentirse muy alterado/a cuando algo le recordaba la experiencia estresante',
    'Tener reacciones físicas intensas cuando algo le recordaba la experiencia estresante '
    '(taquicardia, dificultad para respirar, sudoración)',
    'Evitar recuerdos, pensamientos o sentimientos relacionados con la experiencia estresante',
    'Evitar cosas externas que le recuerden la experiencia estresante (personas, lugares, '
    'conversaciones, actividades, objetos o situaciones)',
    'Dificultad para recordar partes importantes de la experiencia estresante',
    'Tener creencias negativas intensas sobre usted mismo/a, sobre otras personas o sobre el mundo',
    'Culparse a usted mismo/a o culpar a otra persona por la experiencia estresante o por lo que '
    'ocurrió después',
    'Tener sentimientos negativos intensos como miedo, horror, enfado, culpa o vergüenza',
    'Pérdida de interés en actividades que antes le gustaban',
    'Sentirse distante o desconectado/a de otras personas',
    'Dificultad para experimentar sentimientos positivos',
    'Comportamiento irritable, estallidos de ira o actuar de forma agresiva',
    'Asumir demasiados riesgos o hacer cosas que podrían causarle daño',
    'Estar «superalerta», vigilante o en guardia',
    'Sentirse nervioso/a o sobresaltarse con facilidad',
    'Dificultad para concentrarse',
    'Dificultad para conciliar el sueño o para mantenerse dormido/a',
]

# Punto de corte orientativo: el propio National Center for PTSD lo da como
# provisional y lo situa entre 31 y 33.
CORTE = 'Punto de corte provisional: 31-33. No es un diagnóstico.'
