# 01 · Marketing (Gemini) y producción (Claude)

Las redes funcionan con **dos departamentos** que solo hablan a través de un contrato de archivos.

| | Marketing (Gemini) | Producción (Claude) |
|---|---|---|
| Decide | Tema de la semana, ángulo, ganchos, guion del reel, textos del carrusel, adaptación del trend, pies, hashtags, horarios, experimento y palanca de crecimiento | Nada de estrategia |
| Hace | `parrilla.json` + `informe.md` de cada semana | Validar, revisar contra las reglas de marca, montar (reel, carrusel, trend), exportar |
| Modelo | `gemini-3.8-flash-high` (respaldo `flash-medium`) vía `agy` | Sonnet + ejecutores de la skill `delegar`; revisión con `revisor-contenido` (Haiku) |
| Cómo se lanza | `scripts/agentes/marketing.sh <lunes>` | Skill de reels y flujos de producción |

Claude **no reescribe la estrategia**. Si la parrilla incumple el contrato, se la devuelve a Gemini (el lanzador ya lo hace solo: hasta 2 rondas y luego el modelo de respaldo). Javi puede dar notas a Gemini en un archivo (`marketing.sh 2026-11-02 notas.txt`).

## Canales

- **Instagram y TikTok.** Son los dos que se trabajan.
- **Facebook** replica Instagram automáticamente: no se planifica nada para él.
- **YouTube** está parado: no se planifica nada para él.

## Cadencia semanal

| Pieza | Cuántas | Notas |
|---|---|---|
| **Reel de Angie hablando** | **1, fija** | Depende de que Angie se grabe y su tiempo es limitado: nunca se piden dos. El guion lo aprueba Angie (contenido clínico) antes de grabar. |
| **Carrusel** | 1 (admite hasta 2) | Flexible. Puede salir de un artículo del blog ya publicado. |
| **Trend adaptado a psicología** | 1 (admite 0 o hasta 2) | Flexible. Si ningún trend de la semana encaja, se dice y se deja en 0 con el motivo; forzarlo es peor que no publicarlo. |
| Extras (story, reel sin voz…) | 0–2 | Solo si aportan. |

La semana va de **lunes a domingo**. El reel necesita margen de producción: Gemini fija una `fecha_grabacion_angie` al menos 2 días antes de publicar. El trend y el resto de piezas **no requieren una segunda grabación de Angie**.

**Gemini no ve internet:** no sabe qué trend es el de la semana. Javi lo aporta en las notas (`marketing.sh <lunes> notas.txt`); si no, el trend sale marcado `trend_real: false` y es un formato propio.

## Qué decide marketing (y con qué ambición)

El objetivo es **crecer**: más gente que conoce a Angie, confía y reserva la primera sesión (35 €). Marketing puede ser audaz en estrategia, ángulos y ritmo. Cada semana, además de las piezas, entrega:

1. **Un experimento** con hipótesis, dos variantes, la métrica que lo decide y la `asignacion` (qué variante va en qué publicación: una publicación no prueba dos ganchos a la vez).
2. **Una palanca de crecimiento** que no sea contenido (colaboración, directorio profesional, SEO, lead magnet), con esfuerzo estimado.

No se inventa rendimiento: si `docs/marketing/metricas.md` está vacío, lo dice y propone qué medir.

## Líneas rojas (las comprueba el validador)

Además de las de `AGENTS.md`:

- Sin promesas de curación, resultados garantizados, plazos ("en 3 sesiones") ni "100 %".
- Sin diagnósticos al espectador ("tienes ansiedad", "eres narcisista").
- Sin relatos de pacientes presentados como reales (secreto profesional). Un ejemplo es siempre ficticio y se dice.
- Presencial solo como "próximamente". Una sola terapeuta: ningún "nuestro equipo".
- Precios solo 35 € y 50 €. Sin sesiones de tarde o noche.
- Suicidio o autolesión solo con la línea **024** a la vista y marcado `recursos_crisis`.
- Cada afirmación clínica lleva fuente, o queda marcada `revisa_angie`. Las fuentes las cita el modelo de memoria: **no cuentan hasta que Claude las verifica contra el original** (`fuente_verificada: true`); el validador avisa de cada una.
- Lenguaje inclusivo: el público es de cualquier género.
- Nada de Google Business Profile ni de enlaces desde Doctoralia (decisiones cerradas).
- El logo, siempre completo.

El resto de la voz lo marca `PRODUCT.md`: cálida, humana, tranquila. Ambición en la estrategia, calma en la voz.

## Flujo

```text
marketing.sh <lunes>   →  docs/marketing/semanas/<lunes>/parrilla.json + informe.md   (validada)
revisor-contenido      →  cada pieza contra las reglas de marca (Haiku, sin editar)
Angie                  →  aprueba el guion del reel (contenido clínico)
Javi                   →  tono, y da el visto bueno
producción             →  reel (pipeline de Remotion), carrusel y trend
```

## El contrato: `parrilla.json`

Ejemplo completo en `docs/marketing/ejemplo-parrilla.json`; lo que Gemini debe saber, en `docs/marketing/BRIEF.md`. Lo comprueba `npm run validar-parrilla -- <lunes>`.

```text
parrilla  { semana (lunes AAAA-MM-DD), desde, hasta, estrategia, experimento{}, palanca_crecimiento{}, piezas[], sin_trend_motivo? }
pieza     { id, tipo: reel_angie|carrusel|trend|story|reel_sin_voz, tema, objetivo: alcance|confianza|conversion,
            ganchos[3], gancho_pantalla (≤ 6 palabras), pie, hashtags[3–5], cta, publicaciones[], afirmaciones_clinicas[],
            recursos_crisis?, + campos propios de cada tipo }
reel      guion[] (≤ 225 palabras ≈ 90 s), claves[3–4], fecha_grabacion_angie, requiere_aprobacion_angie: true
carrusel  slides[5–10] { texto }
trend     mecanica_original, encaje_psicologia, riesgo: bajo|medio, trend_real: bool, requiere_grabacion_angie: false
publicación { fecha, hora, plataforma: instagram|tiktok, formato }
```

## Producción de reels (fuera de este repo)

El montaje del reel de Angie lo hace el pipeline de Remotion de la carpeta `reel/` del Mac de Javi (skill `reels-hogar-terapeutico`): brutos, cortes, subtítulos, animaciones y exportación. Ese flujo tiene su propio reparto de modelos y no se replica aquí. Desde el 31 oct 2026 **lo dirige Sonnet, no Opus** (decisión de Javi, sin medición previa); sus controles automáticos de cortes y entrega son obligatorios. La parrilla le da el tema, el guion y los ganchos; la hoja de planificación y las decisiones de corte y estilo siguen donde están.
