# Contexto del proyecto: Hogar Terapéutico

Punto de partida para cualquier agente. Las reglas de código y los límites están en `AGENTS.md`; el detalle de producto y marca, en `PRODUCT.md`. Esto es el "por qué" del negocio.

## El negocio

**Hogar Terapéutico** es la consulta de **Angie Sánchez** (Sánchez Gallego), psicóloga sanitaria colegiada **M-42569** (Madrid). Terapia **solo online**, por videollamada. La presencial en Madrid está anunciada como "próximamente" y no puede presentarse como disponible.

- Una sola profesional. Nada que sugiera clínica o equipo.
- Enfoque **integrativo y personalizado** (con EMDR para trauma y apego). El diferenciador frente a una ficha de directorio es el marco del *hogar interior*: la terapia como construir un lugar seguro al que volver, no solo gestionar síntomas.
- Primera sesión **35 €** (50 min); seguimiento online **50 €** (50 min).
- Disponibilidad real para sesiones: **mañanas laborables, ≈10:00–13:00**. El "Lu–Vi 9:00–20:00" de la web es la ventana de **contacto y respuesta**, no de sesiones.
- Contacto: info@hogarterapeutico.com, +34 621 348 616 (también WhatsApp).

## Qué queremos

**Crecer: más primeras sesiones reservadas.** La web convierte (reserva en el calendario, formulario o WhatsApp) y las redes y el SEO traen tráfico. Hay ambición de expansión y se juega con ella: el departamento de marketing (Gemini) puede ser audaz en estrategia, canales y formatos. Lo que no se negocia es la verdad de lo que se promete.

Nota de atribución: la primera paciente con canal conocido llegó por **ChatGPT** (29 oct 2026). Analytics infravalora ese canal porque casi nadie acepta cookies. Por eso el contenido se escribe fácil de citar por asistentes de IA: respuesta clara al principio, FAQ con su schema, datos con fuente, y no se bloquean sus rastreadores.

## Público

Adultos hispanohablantes que valoran empezar terapia online por bienestar emocional general: ansiedad, estrés, trauma, autoestima, regulación emocional, relaciones o crecimiento personal. Llegan a decidir si el encaje se siente bien para reservar o escribir antes. No son pacientes ya en crisis ni buscan un tratamiento psiquiátrico.

## Tono

Cálido, humano, tranquilo y seguro. **No suena clínico ni corporativo**, aunque haya credenciales clínicas detrás. Español de España, tuteo. La calidez es estable aunque el marketing sea ambicioso: ambición en la estrategia, calma en la voz.

## Qué NO prometer ni decir

- Curación, resultados garantizados o plazos de mejora.
- Diagnósticos ni consejos clínicos personalizados en contenido público.
- Que la terapia presencial ya existe.
- Credenciales, premios, prensa o casos de éxito que no estén en la web. Ni reseñas inventadas o parafraseadas en afirmaciones nuevas (solo las reales de Doctoralia).
- Que hay un equipo o una clínica.
- Horas de sesión por la tarde o la noche.
- Datos clínicos sin fuente original.

## Decisiones cerradas: no las propongas

- **Google Business Profile:** suspendido y debe seguir así (no hay local ni zona de servicio válidos para terapia solo por videollamada). No es una tarea pendiente.
- **Enlace a la web desde Doctoralia:** descartado por Javi el 31 oct 2026. Para autoridad externa, otras vías (directorios profesionales, colegio, colaboraciones).
- **Hero claro de la portada:** maquetado y aparcado hasta que haya fotos mejores. No se propone por iniciativa propia.
- **Logo:** siempre completo, sin recortar (tampoco en favicon o avatares).
- **Blog:** lo redacta Claude contrastando cada dato con su fuente; Angie lo revisa (y revisa también el material clínico). Los ejecutores externos no redactan artículos.

## Qué se trabaja en este proyecto

| Área | Qué es | Quién |
|---|---|---|
| **Web (código)** | Eleventy, Tailwind, TS, tests, rendimiento, accesibilidad | Ejecutores y Sonnet; Opus en decisiones |
| **Blog / SEO** | Artículos (`docs/escritor.md`), enlazado, metadatos, schema | Claude redacta; ejecutores solo mecánica |
| **Material clínico** | PDF y Excel de marca (`recursos/`, reportlab) | Claude; ver `AGENTS.md` sobre datos de terceros |
| **Marketing** | Instagram y TikTok (reels, carruseles). Facebook replica Instagram solo; YouTube está parado | Gemini decide, Claude produce |

## Dónde mirar

- `PRODUCT.md`: usuarios, posicionamiento, restricciones y principios.
- `docs/escritor.md`: cómo se escribe un artículo.
- `docs/tareas/`: tareas para agentes.
- `DOCUMENTACION_CAMBIOS.md` y `CACHE_OPTIMIZATION.md`: historia técnica y decisiones de caché.
