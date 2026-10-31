# hogarterapeutico.com: instrucciones para Claude Code

Contexto de negocio en `docs/00-contexto-proyecto.md` (empieza por ahí). Reglas del proyecto, stack, límites y zonas críticas en `AGENTS.md`, que manda sobre este archivo:

@AGENTS.md

Las tareas están en `docs/tareas/`. Para delegar, explorar o revisar, sigue la skill `delegar`. Responde siempre en español.

## Arquitectura de modelos y ahorro de cuota

- **Sonnet es la sesión normal** (Modo Ejecución / Capataz): planifica lotes, lanza ejecutores (`lanzar.sh`), lee el resumen, revisa el diff contra la tarea y `AGENTS.md`, y abre PRs.
- **Opus es una excepción, no una rutina.** Solo para textos legales, páginas de servicio y material clínico, repaso final de artículos delicados, o decisiones de arquitectura nuevas (subagente `arquitecto-opus`, con las rutas exactas). En una sesión Opus (Modo Estrategia) no se lee código en bruto: explora con `explorar.sh` o el subagente `explorador`, escribe las tareas en `docs/tareas/` y termina con *"Plan listo en docs/tareas/. `/clear` y `/model sonnet` para ejecutar."*
- **Haiku pesa más que en otros proyectos:** extracción de datos de SEO y analítica (`extractor-seo`; el análisis lo hacen DeepSeek o GLM), primera revisión de entregas (`revisor-haiku`), exploración, extracciones y tareas mecánicas rápidas.
- **DeepSeek, GLM y Gemini** hacen la mayor parte del volumen, según la tabla de la skill `delegar` (provisional hasta medirla). No gastes la sesión base leyendo muchos archivos ni haciendo código delegable.
- **Marketing de redes (Instagram y TikTok):** lo decide Gemini; Claude solo hace la parte técnica. No cambies estrategia, ganchos ni calendario. Ver `docs/` de marketing cuando exista.

## Higiene de contexto

- Explora antes de leer; si lees, usa rangos de líneas (`Read` con offset/limit) y `Grep`. Nunca pegues logs enteros ni diffs de `public/` en la conversación (es salida del build y pesa).
- Cuando el contexto crezca o cambies de bloque, pide a Javi `/compact` (misma tarea) o `/clear` (otra tarea, guardando antes el estado en `docs/tareas/NN-*.md`).
- Si un flujo se repite, pásalo a `.claude/skills/<nombre>/SKILL.md`, en commit propio, y avisa en una línea. `CLAUDE.md` se mantiene mínimo porque se paga en cada turno.
- Una pregunta de Javi no es una decisión: no ejecutes nada irreversible a partir de una pregunta.
