# -*- coding: utf-8 -*-
"""PHQ-9 y GAD-7 para la hoja de seguimiento.

Los dos instrumentos son de uso libre: Spitzer, Kroenke y Williams los publicaron
sin restriccion de reproduccion, traduccion ni distribucion. Por eso estan aqui
y no, por ejemplo, el BDI-II.

IMPORTANTE: la redaccion NO se toca. Son escalas validadas sobre una formulacion
concreta y los puntos de corte solo valen para ella. Eso incluye el "usted", que
choca con el "tu" del resto de la web. Angie debe cotejar estos enunciados con
una fuente oficial de la version espaniola antes del primer uso.
"""

FRECUENCIA = ['Ningún día', 'Varios días', 'Más de la mitad de los días', 'Casi todos los días']

PHQ9 = [
    'Poco interés o placer en hacer las cosas',
    'Se ha sentido decaído/a, deprimido/a o sin esperanzas',
    'Ha tenido dificultad para quedarse o permanecer dormido/a, o ha dormido demasiado',
    'Se ha sentido cansado/a o con poca energía',
    'Sin apetito o ha comido en exceso',
    'Se ha sentido mal con usted mismo/a, o que es un fracaso o que ha quedado mal '
    'con usted mismo/a o con su familia',
    'Ha tenido dificultad para concentrarse en ciertas actividades, tales como leer '
    'el periódico o ver la televisión',
    'Se ha movido o hablado tan lento que otras personas podrían haberlo notado, o lo '
    'contrario: ha estado tan inquieto/a o agitado/a que se ha movido mucho más de lo normal',
    'Pensamientos de que estaría mejor muerto/a o de lastimarse de alguna manera',
]

GAD7 = [
    'Se ha sentido nervioso/a, ansioso/a o con los nervios de punta',
    'No ha podido dejar de preocuparse o controlar la preocupación',
    'Se ha preocupado demasiado por diferentes cosas',
    'Ha tenido dificultad para relajarse',
    'Se ha sentido tan inquieto/a que no ha podido quedarse quieto/a',
    'Se ha molestado o irritado fácilmente',
    'Ha tenido miedo de que algo terrible pudiera pasar',
]

# El ítem 10 del PHQ-9. No es un anianidido nuestro: forma parte del instrumento
# y es, literalmente, la pregunta de funcionamiento.
FUNCIONAMIENTO = ('Si marcó cualquiera de los problemas anteriores, ¿qué tanta dificultad le han '
                  'dado estos problemas para hacer su trabajo, encargarse de las tareas del hogar '
                  'o llevarse bien con otras personas?')
DIFICULTAD = ['No ha sido difícil', 'Un poco difícil', 'Muy difícil', 'Extremadamente difícil']

ENCABEZADO = ('Durante las últimas 2 semanas, ¿con qué frecuencia le han molestado '
              'los siguientes problemas?')

CORTES_PHQ = [(0, 4, 'Mínima'), (5, 9, 'Leve'), (10, 14, 'Moderada'),
              (15, 19, 'Moderadamente grave'), (20, 27, 'Grave')]
CORTES_GAD = [(0, 4, 'Mínima'), (5, 9, 'Leve'), (10, 14, 'Moderada'), (15, 21, 'Grave')]
