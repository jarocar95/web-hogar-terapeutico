# -*- coding: utf-8 -*-
"""Las quince distorsiones, reescritas.

Se conservan los nombres (terminologia clinica estandar) y el esqueleto
definicion / como se nota / que preguntarse, que es el del material del que
parte. Las definiciones y los quince ejemplos estan escritos de cero: los del
original venian de un manual de los noventa y arrastraban un estereotipo racial
en el 11 y una escena de convivencia con alcohol y voces en el 15 que hoy no se
le entrega a nadie, ademas de repartir los papeles por sexos en casi todos.
"""

INTRO = ("Detrás de casi todo malestar intenso hay un pensamiento que lo sostiene, y muchas veces ese "
         "pensamiento no es del todo cierto: es un atajo que ha tomado tu cabeza. Estos son los quince "
         "atajos más frecuentes. No están aquí para que te juzgues por hacerlos —los hacemos todos—, "
         "sino para que puedas ponerles nombre cuando aparezcan. Ponerles nombre es media tarea.")

CIERRE = ("Marca las que reconozcas y quédate con dos o tres, no con quince. Cuando detectes una, "
          "llévala al Registro de pensamientos: es la casilla «¿Distorsión cognitiva?», y ahí es donde "
          "se trabaja de verdad.")

DISTORSIONES = [
 ("Filtraje", "Te quedas con un solo detalle de lo que ha pasado, casi siempre el peor, y ese detalle tiñe el resto.",
  "Presentas un proyecto, cinco personas te felicitan y una señala un fallo en una diapositiva. Vuelves a casa pensando solo en la diapositiva.",
  "«Ha sido un desastre», «lo único que pasó fue…», «no lo soporto».",
  "¿Qué más pasó que no me estoy contando?"),

 ("Pensamiento polarizado", "O perfecto o desastre. No existe el término medio, y como lo perfecto casi nunca llega, casi todo cae en desastre.",
  "Llevas cuatro días yendo a caminar. El quinto no vas y piensas: «ya lo he roto, esto no es para mí».",
  "«Siempre», «nunca», «un fracaso», «un inútil».",
  "Entre esos dos extremos, ¿qué hay? Si fuera un porcentaje, ¿cuál sería?"),

 ("Sobregeneralización", "De un caso suelto sacas una regla general, y la regla se queda mandando.",
  "Una entrevista que no sale y la conclusión es: «no voy a encontrar nada nunca».",
  "«Todo», «nadie», «siempre», «ninguno».",
  "¿Cuántas veces ha pasado esto de verdad? ¿Hay algún caso que no encaje?"),

 ("Lectura de pensamiento", "Das por sabido lo que otra persona piensa o siente, sin haberlo comprobado.",
  "Le mandas un audio largo a una amiga. Lo escucha y tarda dos horas en contestar. «Se ha cansado de mí».",
  "«Seguro que piensa…», «sé que le ha parecido…».",
  "¿Qué pruebas tengo? ¿Y qué pasaría si se lo preguntara directamente?"),

 ("Visión catastrófica", "Te adelantas al peor final posible y lo vives por anticipado, como si ya hubiera ocurrido.",
  "Tu jefa escribe «¿tienes un momento luego?» y pasas la mañana entera montando tu despido.",
  "«¿Y si…?», «esto va a acabar fatal».",
  "¿Cuántas veces he montado esta película antes y cómo acabó en realidad?"),

 ("Personalización", "Das por hecho que lo que pasa alrededor va por ti. También cuenta compararte a todas horas, y siempre saliendo perdiendo.",
  "En una reunión se habla en general de plazos que se están incumpliendo y sales con la certeza de que lo decían por ti.",
  "«Lo dice por mí», «yo hago esto peor que…».",
  "Si no me conocieran, ¿qué otra explicación tendría esto?"),

 ("Falacia de control", "O crees que todo depende de ti, o crees que no depende de ti nada. Los dos extremos cansan igual.",
  "Organizas una cena familiar y te sientes responsable de que todo el mundo esté a gusto, también de lo que discutan entre ellos.",
  "«Soy el responsable de todo», «yo aquí no puedo hacer nada».",
  "¿Qué parte de esto es mía de verdad? ¿Y qué puedo hacer con esa parte?"),

 ("Falacia de justicia", "Llamas injusto a lo que no coincide con lo que querías.",
  "Un amigo hace un plan y no te avisa. «No hay derecho, con todo lo que yo he estado ahí».",
  "«No hay derecho», «es injusto», «si de verdad me quisiera…».",
  "¿Esto es injusto, o sencillamente no es lo que yo quería?"),

 ("Razonamiento emocional", "Tomas lo que sientes como prueba de que algo es cierto. Si lo sientes, es que es así.",
  "Te levantas con culpa sin motivo claro y concluyes: «por algo será, algo habré hecho».",
  "«Si me siento así, por algo será».",
  "¿Qué pensé justo antes de sentirme así? ¿Lo sentido es el hecho, o mi lectura del hecho?"),

 ("Falacia de cambio", "Tu bienestar queda aparcado a la espera de que otra persona cambie primero.",
  "«Cuando él se relaje un poco, yo ya estaré bien». Mientras tanto, la espera.",
  "«Si cambiara…, entonces yo podría…».",
  "Aunque eso no cambie, ¿qué puedo hacer yo esta semana?"),

 ("Etiquetas globales", "Resumes a una persona entera —tú incluida— en una palabra, casi siempre con el verbo ser.",
  "Te cuesta arrancar conversación en una cena y te vas con la conclusión: «soy un desastre social».",
  "«Soy un…», «es un…», «son unos…».",
  "¿Soy así el cien por cien del tiempo? ¿Qué se queda fuera de esa etiqueta?"),

 ("Culpabilidad", "Repartes la responsabilidad entera, a ti o a otro, sin contar con todo lo demás que influye. Y darle vueltas no cambia nada.",
  "Tu hijo tiene una mala semana en el colegio y das por hecho que es por algo que has hecho tú.",
  "«Culpa mía», «culpa suya».",
  "Culparme, ¿cambia algo del problema? ¿Qué más ha influido aquí?"),

 ("Los deberías", "Normas rígidas sobre cómo tienen que ser las cosas. Cuando la realidad no las cumple, el disgusto es enorme.",
  "«Debería poder con esto», «a mi edad ya debería tener la vida resuelta», «no debería costarme tanto».",
  "«Debería», «tengo que», «tendría que».",
  "¿De dónde sale esa norma? ¿Qué pasa de verdad si no se cumple?"),

 ("Tener razón", "La conversación deja de ser una conversación y pasa a ser un pulso. Escuchas solo para responder.",
  "Una discusión de pareja por algo pequeño que dura una hora, y al final ya ninguno de los dos recuerda de qué iba.",
  "«Yo llevo razón», «es que no lo entiendes».",
  "¿Quiero tener razón o quiero resolver esto? ¿Qué está diciendo la otra persona?"),

 ("Falacia de recompensa", "Aguantas sin mover nada, confiando en que un día la situación se arregle sola o alguien lo compense.",
  "Llevas dos años asumiendo más trabajo del que te toca sin decirlo, esperando que alguien se dé cuenta y lo reconozca.",
  "«Algún día se darán cuenta», «ya mejorará».",
  "¿Qué podría hacer hoy, en lugar de esperar?"),
]
