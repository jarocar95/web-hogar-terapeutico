# hogarterapeutico.com: instrucciones para Claude Code

Contexto de negocio en `docs/00-contexto-proyecto.md` (empieza por ahí). Reglas del proyecto, stack, límites y zonas críticas en `AGENTS.md`, que manda sobre este archivo:

@AGENTS.md

Las tareas están en `docs/tareas/`. Para delegar, explorar o revisar, sigue la skill `delegar`. Responde siempre en español.

## Arquitectura de modelos y ahorro de cuota

- **Opus (Modo Estrategia / Auditoría):** diseña, escribe tareas en `docs/tareas/`, da el visto bueno y es el único que trabaja las zonas críticas. No lee código en bruto: explora con `scripts/agentes/explorar.sh "<pregunta>"` o el subagente `explorador`, y lee solo `docs/` o los rangos de líneas que marque el informe. Al acabar el plan dice: *"Plan listo en docs/tareas/. `/clear` y `/model sonnet` para ejecutar."*
- **Sonnet (Modo Ejecución / Capataz):** planifica lotes, lanza ejecutores (`lanzar.sh`), lee el resumen, revisa el diff contra la tarea y `AGENTS.md`, y abre PRs. Si hay duda en una zona crítica, invoca al subagente `arquitecto-opus` pasándole solo las rutas exactas.
- **Ejecutores externos (DeepSeek, GLM, Gemini) y Haiku:** según la tabla de la skill `delegar`. No gastes la sesión base leyendo muchos archivos ni haciendo código delegable.
- **Marketing de redes (Instagram y TikTok):** lo decide Gemini; Claude solo hace la parte técnica. No cambies estrategia, ganchos ni calendario. Ver `docs/` de marketing cuando exista.

## Higiene de contexto

- Explora antes de leer; si lees, usa rangos de líneas (`Read` con offset/limit) y `Grep`. Nunca pegues logs enteros ni diffs de `public/` en la conversación (es salida del build y pesa).
- Cuando el contexto crezca o cambies de bloque, pide a Javi `/compact` (misma tarea) o `/clear` (otra tarea, guardando antes el estado en `docs/tareas/NN-*.md`).
- Si un flujo se repite, pásalo a `.claude/skills/<nombre>/SKILL.md`, en commit propio, y avisa en una línea. `CLAUDE.md` se mantiene mínimo porque se paga en cada turno.
- Una pregunta de Javi no es una decisión: no ejecutes nada irreversible a partir de una pregunta.
