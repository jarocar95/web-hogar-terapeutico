# -*- coding: utf-8 -*-
"""Texto de la guia «Aprender a conectar con tus emociones».

Viene de un .docx de GB Psicologia (13 de octubre de 2026). Cambios respecto al
original, todos menores:
  - Fuera el membrete de GB Psicologia (nombre, direccion, correo, telefono).
  - «micropracticas» -> «microprácticas» (faltaba la tilde, tres veces).
  - «dispersado» -> «disperso».
  - Ejercicio 11: «Cierra los ojos» -> «Cierra los ojos si te resulta cómodo»,
    como ya decia el ejercicio 1. Con trauma, cerrar los ojos no siempre es
    seguro, y la guia lo trataba distinto en dos sitios.
  - «Investigaciones [...] muestran» -> «La investigación [...] apunta»: el
    dato es solido, pero sin cita delante no conviene sonar a ley.

Tipos de pieza dentro de un ejercicio:
  ('p', texto)                 parrafo
  ('cita', texto)              frase para decirse o preguntarse
  ('pasos', [..])              lista numerada, el orden importa
  ('puntos', [..])             lista sin orden
  ('plantilla', [(rotulo, pista), ..])   las tres lineas del diario
"""

TITULO = 'Aprender a conectar con tus emociones'
SUBTITULO = 'Guía práctica con ejercicios para reconocer, nombrar y habitar lo que sientes'

# --- Antes de los ejercicios -------------------------------------------------

POR_QUE = [
    'Muchas personas llegan a consulta diciendo lo mismo de formas distintas: «no sé lo que siento», «me quedo en blanco», «racionalmente lo entiendo, pero por dentro no noto nada», «sé que tendría que estar triste o enfadado, pero no lo estoy». No es una rareza ni un fallo: es una respuesta inteligente que tu sistema aprendió en algún momento porque sentir, en aquel contexto, no era seguro.',
    'Cuando de pequeños mostrar emociones suponía rechazo, castigo, indiferencia o ruptura del vínculo, el cuerpo aprende a desconectarse de las señales internas. Es un mecanismo de protección, no un defecto de carácter. El problema es que esa misma desconexión, que en su día te salvó, hoy te impide saber qué necesitas, qué te hace daño y qué te hace bien.',
    'La buena noticia es que la conexión emocional se reaprende. No es un interruptor que se enciende, sino un músculo que se entrena con práctica suave y sostenida. Este documento contiene una primera ruta de trabajo: información para entender qué te pasa y, sobre todo, ejercicios concretos para ir recuperando el contacto con tu mundo interno a tu ritmo.',
]

QUE_ES = 'Conectar con una emoción no es pensarla, ni analizarla, ni explicar por qué deberías sentirla. Es algo más sencillo y más incómodo: es notarla en el cuerpo. Toda emoción tiene tres componentes que conviene distinguir:'

CAPAS = [
    ('Sensación corporal', 'Lo que ocurre físicamente: tensión en el pecho, nudo en el estómago, calor en la cara, peso en los hombros, ganas de llorar, vacío. Es la capa más antigua y la más fiable.'),
    ('Impulso', 'La tendencia de acción: lo que esa emoción te empuja a hacer. Huir, esconderte, gritar, acercarte, retirarte, cuidar.'),
    ('Etiqueta', 'La palabra que le ponemos: tristeza, miedo, rabia, vergüenza. Es la capa más superficial y la última en aparecer.'),
]

QUE_ES_CIERRE = [
    'Quien tiene dificultad para conectar con sus emociones suele intentar ir directo a la tercera capa («¿qué nombre le pongo a esto?») saltándose las dos anteriores. Y como la etiqueta sin cuerpo no se sostiene, todo queda en un «no sé».',
    'Por eso el trabajo empieza por el cuerpo, no por las palabras.',
]

SENALES_INTRO = 'Reconocer la desconexión es ya un primer paso. Algunas señales habituales:'
SENALES = [
    'Te preguntan «¿cómo estás?» y respondes «bien» casi por defecto, sin haberlo comprobado.',
    'Notas más el cansancio, el dolor de cabeza o la tensión muscular que las emociones en sí.',
    'Las reacciones emocionales te llegan «con retraso»: te das cuenta de que te dolió algo días después.',
    'En situaciones cargadas afectivamente te quedas en blanco, te dispersas o te entra sueño.',
    'Sueles describir lo que te pasa pensando, no sintiendo («creo que esto significa que…»).',
    'Te identificas mucho con frases como «soy muy mental», «todo lo razono», «no soy una persona emocional».',
    'Pasas con facilidad de cero a cien: pareciera que no sientes nada hasta que estallas o te derrumbas.',
    'Te cuesta llorar aunque haya motivos, o lloras sin saber muy bien por qué.',
    'Cuando alguien expresa una emoción cerca, te incomoda, te bloqueas o intentas «arreglarla» rápido.',
]
IMPORTANTE = 'Si te reconoces en varias de estas señales, no significa que algo esté roto en ti. Significa que en algún momento sentir fue demasiado costoso y aprendiste a apagar el volumen. Este documento te ayuda a volver a subirlo despacio, sin forzar.'

# --- Los cuatro bloques ------------------------------------------------------

VOCABULARIO_INTRO = 'Estas familias agrupan emociones próximas con matices distintos. Cuando trabajes los ejercicios, intenta encontrar la palabra más exacta, no la más cómoda.'
VOCABULARIO = [
    ('Tristeza', 'Pena · melancolía · desánimo · desconsuelo · nostalgia · abatimiento · soledad · decepción · vacío · resignación · duelo'),
    ('Miedo', 'Inquietud · aprensión · inseguridad · alarma · pánico · angustia · desconfianza · vulnerabilidad · incertidumbre · indefensión'),
    ('Rabia', 'Irritación · fastidio · frustración · indignación · resentimiento · impotencia · hartazgo · enfado · ira · rencor'),
    ('Vergüenza', 'Pudor · timidez · azoramiento · culpa · humillación · ridículo · sentirse pequeño · sentirse expuesto · autodesprecio'),
    ('Alegría', 'Satisfacción · entusiasmo · ilusión · ternura · gratitud · plenitud · serenidad · orgullo sano · alivio · esperanza'),
    ('Asco / rechazo', 'Repugnancia · desprecio · hartura · saturación · aversión · «no quiero esto»'),
]

BLOQUES = [
    {
        'n': 'Primer bloque', 'titulo': 'Volver al cuerpo',
        'intro': ['Antes de identificar emociones hay que recuperar el canal por el que se manifiestan. Los ejercicios de este bloque son breves, se hacen a diario y no requieren llorar, hablar ni «sentir mucho». Solo requieren prestar atención al cuerpo durante unos minutos.'],
        'ejercicios': [
            {'n': 1, 'titulo': 'Escaneo corporal de tres minutos',
             'cuando': 'Una o dos veces al día, idealmente al levantarte y antes de acostarte.',
             'cuerpo': [
                 ('p', 'Siéntate o túmbate. Cierra los ojos si te resulta cómodo. Respira con normalidad, sin modificar nada.'),
                 ('p', 'Recorre tu cuerpo lentamente, como si pasaras un foco de luz suave por dentro, de los pies a la cabeza. En cada zona haz una sola pregunta:'),
                 ('cita', '«¿Qué noto aquí?»'),
                 ('p', 'No tienes que sentir nada especial. Vale «noto frío», «noto nada», «noto cosquilleo», «noto tensión». No interpretes, no juzgues, no cambies. Solo registra.'),
                 ('p', 'Termina con tres respiraciones más profundas y abre los ojos.'),
             ],
             'entrena': 'La capacidad de notar lo que pasa en el cuerpo sin necesidad de etiquetarlo. Es la base de todo lo demás.'},
            {'n': 2, 'titulo': 'Los tres anclajes',
             'cuando': 'Varias veces al día, en momentos neutros.',
             'cuerpo': [
                 ('p', 'Para cuando notes que llevas un rato «fuera», disperso, ausente de ti mismo. Es muy breve: treinta segundos.'),
                 ('pasos', [
                     'Mira a tu alrededor y nombra mentalmente tres cosas que ves (no es decorativo: ayuda a aterrizar).',
                     'Siente los pies en el suelo y el peso del cuerpo en la silla. Quédate ahí dos respiraciones.',
                     'Pon una mano sobre el pecho o el abdomen y nota el contacto, el calor, el movimiento de la respiración.',
                 ]),
             ],
             'entrena': 'Salir del modo «cabeza» y volver al modo «cuerpo presente». Es un microejercicio que se puede hacer en el trabajo, en el coche o en una reunión sin que nadie lo note.'},
            {'n': 3, 'titulo': 'El termómetro del día',
             'cuando': 'Tres veces al día: mañana, mediodía y noche.',
             'cuerpo': [
                 ('p', 'Pon tres alarmas en el móvil con un mensaje único: «¿Cómo estoy ahora?». Cuando suene, párate treinta segundos y responde a estas tres preguntas, en este orden:'),
                 ('pasos', [
                     '¿Qué siento en el cuerpo? Una palabra basta: tenso, cansado, ligero, vacío, agitado…',
                     'En una escala de 0 a 10, ¿cuánta activación tengo? 0 es apagado; 10, al límite.',
                     '¿Qué necesito en este momento? Agua, parar, moverme, hablar, silencio, comer…',
                 ]),
                 ('p', 'No hace falta hacer nada con la respuesta. El simple gesto de preguntártelo ya está entrenando el músculo.'),
             ],
             'entrena': 'El hábito de mirarte hacia dentro varias veces al día, en lugar de hacerlo solo cuando ya estás desbordado.'},
        ],
    },
    {
        'n': 'Segundo bloque', 'titulo': 'Poner palabras',
        'intro': [
            'Una vez recuperas algo de contacto con el cuerpo, el siguiente paso es enriquecer el vocabulario emocional. Las personas que tienen dificultad para conectar suelen manejar tres o cuatro etiquetas («bien», «mal», «estresado», «cansado») que son demasiado gruesas para describir lo que realmente pasa por dentro. Es como intentar pintar un paisaje con un solo color.',
            'La investigación sobre regulación emocional apunta a algo importante: cuanto más precisa es la palabra con la que nombras lo que sientes, menos te desborda. Nombrar bien no es un capricho literario, es una herramienta de regulación.',
        ],
        'vocabulario': True,
        'ejercicios': [
            {'n': 4, 'titulo': 'Diario emocional de tres líneas',
             'cuando': 'Una vez al día, por la noche. Cinco minutos como máximo.',
             'cuerpo': [
                 ('p', 'Escribe a mano (importante: a mano, no en el móvil) tres líneas, ni una más:'),
                 ('plantilla', [
                     ('Línea 1', 'Hoy ha pasado… un hecho concreto, sin valoraciones.'),
                     ('Línea 2', 'En el cuerpo he notado… una sensación física.'),
                     ('Línea 3', 'Y eso lo llamaría… la palabra emocional más precisa. Mira el vocabulario si te bloqueas.'),
                 ]),
                 ('p', 'La regla esencial es no escribir más de tres líneas. Si te pasas, lo recortas. La brevedad obliga a destilar, no a divagar mentalmente.'),
             ],
             'entrena': 'El puente entre suceso, sensación y palabra. Es el ejercicio que más rendimiento da a medio plazo.'},
            {'n': 5, 'titulo': 'El detective de las emociones',
             'cuando': 'Cuando notes una reacción intensa o desproporcionada: irritación con alguien, ganas de huir, un bajón inesperado.',
             'cuerpo': [
                 ('p', 'Cuando aparezca esa reacción, en lugar de actuarla o reprimirla, hazte cuatro preguntas en este orden:'),
                 ('pasos', [
                     '¿Qué noto en el cuerpo, exactamente y dónde?',
                     'Si esto fuera el síntoma visible de una emoción «de fondo», ¿cuál podría ser?',
                     '¿Qué edad tendría yo si me sintiera así por dentro? La respuesta a veces sorprende.',
                     '¿Qué necesitaría esa parte de mí ahora?',
                 ]),
                 ('p', 'No siempre vas a encontrar una respuesta clara. El ejercicio funciona también cuando no la encuentras: te entrena a mirar hacia dentro antes de reaccionar hacia fuera.'),
             ],
             'entrena': 'Ir más allá de la emoción de superficie (la rabia, el agobio) para acceder a la emoción primaria que suele esconderse debajo: miedo, tristeza, vergüenza, una herida antigua.'},
        ],
    },
    {
        'n': 'Tercer bloque', 'titulo': 'Quedarse con la emoción',
        'intro': [
            'Notar y nombrar son dos pasos. El tercero, y a menudo el más difícil, es permanecer con la emoción sin huir de ella ni dejarse arrastrar. Para muchas personas desconectadas no es que no haya emociones: es que cuando asoman, se las traga, se las distrae o se las explica hasta hacerlas desaparecer.',
            'Quedarse con la emoción no significa hundirse, regodearse ni dramatizar. Significa sostenerla unos minutos con respeto, como sostendrías la mano de alguien que llora. Después, la emoción se mueve sola.',
        ],
        'ejercicios': [
            {'n': 6, 'titulo': 'Acoger en lugar de empujar',
             'cuando': 'Cuando aparezca una emoción incómoda y notes el impulso de quitártela de encima.',
             'cuerpo': [
                 ('p', 'En lugar de distraerte, racionalizar o reprimir, prueba esta secuencia. Puede durar entre dos y diez minutos.'),
                 ('pasos', [
                     'Localiza dónde la sientes en el cuerpo. Pon la mano ahí físicamente.',
                     'Respira hacia esa zona, como si el aire entrara y saliera de ahí.',
                     'Di internamente, dirigiéndote a la sensación:',
                 ]),
                 ('cita', '«Te veo. Estás aquí. No tengo que arreglarte ahora.»'),
                 ('pasos', [
                     'Quédate con ella sin hacer nada más. Observa si cambia de forma, de lugar, de intensidad. No la empujes para que se vaya.',
                     'Cuando notes que ha cambiado o aflojado (a veces basta con un suspiro profundo), retira la mano y sigue con lo que estabas haciendo.',
                 ], 4),
             ],
             'entrena': 'La tolerancia a la emoción. Descubrir, en vivo, que sentir no destruye. Que las emociones tienen un arco natural: suben, se sostienen y bajan, si las dejas.'},
            {'n': 7, 'titulo': 'La carta a la emoción',
             'cuando': 'Una vez por semana, o cuando una emoción se repita y no entiendas qué te quiere decir.',
             'cuerpo': [
                 ('p', 'Coge papel y boli. Elige una emoción que te esté visitando últimamente: la angustia, la tristeza, la rabia, lo que sea. Escríbele una carta como si fuera una persona. Empieza así:'),
                 ('cita', '«Querida [emoción], llevas un tiempo apareciendo en mi vida. Quiero entenderte mejor. Cuéntame…»'),
                 ('p', 'Pregúntale: ¿desde cuándo estás aquí?, ¿qué intentas decirme?, ¿qué necesitas que yo haga?, ¿de qué me proteges?'),
                 ('p', 'Después, gira la hoja y deja que la emoción «conteste». Escribe sin pensar, lo primero que salga, aunque parezca raro o no tenga sentido. No es magia: es una manera de darle voz a partes tuyas que normalmente no hablan.'),
             ],
             'entrena': 'Tratar las emociones como mensajeras con información útil, no como enemigas a eliminar. Cambia radicalmente la relación que tienes con tu mundo interno.'},
            {'n': 8, 'titulo': 'Cine emocional',
             'cuando': 'Una vez por semana.',
             'cuerpo': [
                 ('p', 'A veces es más fácil entrar en contacto con emociones a través de un canal indirecto. Elige una película, una serie, una canción o un libro que sospeches que puede moverte: no algo «de entretenimiento puro», sino algo que toque temas afectivos.'),
                 ('p', 'Antes de empezar, hazte una promesa:'),
                 ('cita', '«Voy a permitirme sentir lo que aparezca, sin reprimirlo y sin analizarlo mientras dura.»'),
                 ('p', 'Después, durante quince minutos, escribe:'),
                 ('puntos', [
                     '¿En qué momento algo se movió por dentro?',
                     '¿Qué sensación corporal hubo?',
                     '¿Con qué personaje o situación me identifiqué? ¿Qué me dice eso de mí?',
                 ]),
             ],
             'entrena': 'Abrir el canal emocional en un entorno seguro y controlado. Las ficciones funcionan como ensayos: permiten sentir sin las consecuencias reales que tu sistema asocia a sentir.'},
        ],
    },
    {
        'n': 'Cuarto bloque', 'titulo': 'Microprácticas para el día a día',
        'intro': ['Estos ejercicios son rápidos, encajan en cualquier rutina y mantienen el músculo emocional en forma sin necesidad de sentarte expresamente a hacer un trabajo «de psicología». Son los que dan continuidad al resto.'],
        'ejercicios': [
            {'n': 9, 'titulo': 'Pausas conscientes entre tareas',
             'cuando': 'Cada vez que terminas una tarea y vas a empezar otra.',
             'cuerpo': [
                 ('p', 'Antes de pasar a lo siguiente, no enlaces. Para treinta segundos. Toma tres respiraciones lentas y pregúntate:'),
                 ('cita', '«¿Con qué me quedo de lo que acabo de hacer? ¿Cómo estoy ahora?»'),
                 ('p', 'No hace falta una gran respuesta. Lo importante es no encadenar piloto automático con piloto automático. Cada pausa es un punto de contacto contigo.'),
             ],
             'entrena': None},
            {'n': 10, 'titulo': 'Un placer al día, sin culpa',
             'cuando': 'A diario.',
             'cuerpo': [
                 ('p', 'Las personas desconectadas suelen estar también desconectadas del placer, no solo del dolor. Identifica cada día algo pequeño que te dé placer (un café, una canción, el sol en la cara, una conversación, un olor) y dedícale toda tu atención durante un minuto.'),
                 ('p', 'La regla: mientras dura, no haces nada más. Sin móvil, sin pensar en lo siguiente. Solo eso.'),
             ],
             'entrena': 'Reabrir el canal del disfrute. La conexión emocional no es solo con lo difícil; también con lo bueno. Y muchas veces empieza por ahí, porque es más seguro.'},
            {'n': 11, 'titulo': 'El movimiento que pide el cuerpo',
             'cuando': 'Una vez al día, dos o tres minutos.',
             'cuerpo': [
                 ('p', 'Ponte de pie en un sitio donde nadie te vea. Cierra los ojos si te resulta cómodo. Pregúntate:'),
                 ('cita', '«¿Cómo se quiere mover mi cuerpo ahora mismo?»'),
                 ('p', 'No decidas con la cabeza. Espera a que algo aparezca: estirar los brazos, encogerte, balancearte, sacudirte, dar pasos en círculo, lo que sea. Hazlo durante un par de minutos siguiendo lo que el cuerpo pida, sin coreografía.'),
             ],
             'entrena': 'Devolverle al cuerpo iniciativa y voz. La emoción es movimiento (e-moción): cuando dejamos que el cuerpo se exprese, las emociones encuentran salida.'},
            {'n': 12, 'titulo': 'La pregunta de los cinco minutos',
             'cuando': 'Una vez a la semana, en un momento de tranquilidad.',
             'cuerpo': [
                 ('p', 'Pon un temporizador de cinco minutos. Durante ese tiempo, escribe sin parar la respuesta a una de estas preguntas. Elige una cada semana:'),
                 ('puntos', [
                     '¿Qué siento últimamente y de qué no estoy hablando con nadie?',
                     '¿Qué echo de menos sin haberme atrevido a decirlo?',
                     '¿Qué me está pesando que aún no me he permitido reconocer?',
                     '¿De qué me alegro de verdad esta semana?',
                     'Si pudiera pedirle algo a alguien sin que pasara nada malo, ¿qué pediría y a quién?',
                 ]),
                 ('p', 'Escribir sin parar significa que el boli no se levanta del papel. Si no sabes qué poner, escribe «no sé qué poner, no sé qué poner» hasta que algo aparezca. Lo que se cuela cuando dejas de controlar suele ser información valiosa.'),
             ],
             'entrena': None},
        ],
    },
]

# --- Plan y cierre -----------------------------------------------------------

PLAN_INTRO = 'Doce ejercicios pueden parecer muchos. No se trata de hacerlos todos cada día. Esta es una propuesta sensata para arrancar:'
PLAN = [
    ('Semanas 1–2', 'Solo el cuerpo', [
        'Ejercicio 1 (escaneo corporal) por la mañana o por la noche.',
        'Ejercicio 3 (termómetro del día) con tres alarmas.',
        'Ejercicio 2 (los tres anclajes) cuando lo recuerdes a lo largo del día.',
    ], 'Nada más. El objetivo es solo reabrir el canal del cuerpo. No esperes grandes emociones aún.'),
    ('Semanas 3–4', 'Añadir las palabras', [
        'Sigues con lo anterior.',
        'Añades el ejercicio 4 (diario de tres líneas) cada noche.',
        'Cuando aparezca una reacción intensa, usas el ejercicio 5 (detective).',
    ], None),
    ('Desde la 5.ª', 'Habitar y mantener', [
        'Mantienes el escaneo y el diario.',
        'Una vez por semana eliges entre el ejercicio 7 (carta) o el 8 (cine emocional).',
        'Cuando notes una emoción incómoda, en lugar de huir, pruebas el ejercicio 6 (acoger).',
        'Vas integrando las microprácticas (9, 10, 11 y 12) según te apetezca.',
    ], None),
]

ADVERTENCIA = 'Si en algún momento, al hacer estos ejercicios, te encuentras con emociones muy intensas, recuerdos antiguos que no esperabas o una sensación de desbordamiento, no fuerces. Para, vuelve al ejercicio 2 (los tres anclajes) para aterrizar, y lleva eso a la siguiente sesión. No estás haciéndolo mal: estás tocando algo que merece acompañamiento, no soledad.'

ULTIMA_IDEA = [
    'La desconexión emocional no se desactiva queriendo. No basta con decirse «a partir de ahora voy a sentir más». Lo que la desactiva es la repetición de pequeñas experiencias en las que sentir resulta seguro: notar algo en el cuerpo y que no pase nada malo, nombrar una tristeza y que el mundo siga, llorar y descubrir que después se respira mejor.',
    'Cada uno de estos ejercicios es una de esas pequeñas experiencias. Por separado no parecen gran cosa. Acumulados durante semanas, cambian la relación que tienes contigo.',
    'Date tiempo. El sistema que aprendió a desconectarse necesita confiar para volver a abrirse. Y la confianza, contigo mismo o con cualquier otro, no se decreta: se construye gesto a gesto.',
]
