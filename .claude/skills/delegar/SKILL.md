---
name: delegar
description: Repartir el trabajo entre modelos para ahorrar cuota de Claude. DeepSeek, GLM, Gemini y Haiku hacen la mayor parte; Sonnet coordina y revisa; Opus aparece solo en excepciones. Úsala siempre que haya trabajo delegable, búsquedas en el repo, análisis de datos (SEO), borradores o revisiones.
---

# Delegar (ahorro de cuota y reparto por modelo)

Todo lo que diga `AGENTS.md` vale para todos los agentes y manda sobre esta guía. **Principio: la cuota cara se gasta lo mínimo.** Opus casi nunca; Sonnet coordina y remata; el trabajo repetitivo, los datos y la primera revisión los hacen modelos baratos.

## Quién hace qué

| Papel | Modelo | Cómo se llama | Cuota |
|---|---|---|---|
| **Coordinación diaria** | Sonnet | Sesión activa: planifica lotes, lanza ejecutores, revisa el diff, abre PRs | Claude (media) |
| **Opus: solo excepciones** | Opus | Subagente `arquitecto-opus` (o sesión Opus si Javi la abre) | Claude (cara) |
| **Ejecutor de código y contenido** | DeepSeek, GLM | `scripts/agentes/lanzar.sh` (incluye tests+build+autocorrección) | Gratis |
| **Ejecutor largo / relevo** | Gemini | `lanzar.sh … gemini` | Google |
| **Ejecutor rápido y analista de datos** | **Haiku** | `lanzar.sh … haiku` y subagentes `analista-seo`, `revisor-haiku`, `explorador` | Claude (mínima) |
| **Explorador** | DeepSeek → GLM → Haiku | `scripts/agentes/explorar.sh "¿…?"` | Gratis (Haiku si caen) |
| **Marketing de IG y TikTok** | Gemini | Decide estrategia; ver `docs/` de marketing cuando exista | Google |
| **Revisión de segunda pasada** | Sonnet | La propia sesión o `revisor-sonnet` | Claude (media) |
| **Lote completo en sesión Opus** | Sonnet | Subagente `capataz` (SOLO si la sesión activa es Opus) | Claude (media) |

### Cuándo aparece Opus (y solo entonces)

1. Editar o aprobar **textos legales** (aviso legal, privacidad, cookies) o **páginas de servicio y enfoque** (EMDR, ansiedad, trauma) y **material clínico para pacientes**.
2. Una **decisión de arquitectura nueva** (cambiar de generador, de hosting, de estructura de `public/`).
3. Un **artículo de tema delicado** (suicidio, trauma, medicación): un solo repaso final.
4. Cuando Javi abre una sesión Opus para estrategia.

Todo lo demás (código, tests, SEO, datos, enlazado, borradores, redes) no lo toca. Antes de invocarlo, pregúntate si puede resolverlo Sonnet con un buen encargo.

### Dónde pesa Haiku

- **Datos de SEO y analítica:** `analista-seo` lee exportes de Search Console y Analytics y escribe el informe en `docs/informes/`. Es su trabajo principal.
- **Primera revisión de entregas:** `revisor-haiku` comprueba alcance, criterios y tests antes de que Sonnet gaste nada.
- **Extracciones y tablas:** inventarios de enlaces, metadatos, alts, FAQ, comparativas.
- **Ejecutor rápido** de tests y tareas mecánicas cuando importa la prisa.

## Qué ejecutor elegir (PROVISIONAL)

> La tabla viene de la batería de otro proyecto (haztemilitar, 2026-10-22) y son **hipótesis, no medidas aquí**. Se sustituye por datos reales con la mini-batería de la Fase 4 y con `../ht-agentes-logs/registro.csv`. Diferencias de 1 punto son ruido.

| Tipo de tarea | Primero | Después | Notas |
|---|---|---|---|
| Explorar el repo | DeepSeek | GLM, Haiku | Haiku fue el más rápido |
| Tests unitarios (Jest) | DeepSeek | Haiku, GLM | Revisar que no reimplementen la lógica en el test |
| Lógica TypeScript | DeepSeek | Haiku, GLM | |
| Pantallas y CSS (Tailwind) | GLM | Gemini, DeepSeek | Revisar a 390 px |
| Contenido en español (borradores) | DeepSeek | Haiku, GLM | Verificar siempre los datos |
| **Datos SEO y analítica** | **Haiku** | DeepSeek | Sin web; trabaja sobre exportes |
| Ganchos, pies, guiones (volumen) | DeepSeek, GLM | Haiku | Gemini decide la estrategia; esto es volumen |
| Primera revisión de una entrega | Haiku | Sonnet | |

Haiku gasta cuota de Claude (poca). Gemini es el más lento y el que más se corta: reserva para contexto muy largo o relevo.

## Qué NO se delega (resumen; manda `AGENTS.md`)

- Textos clínicos publicados y textos legales: solo Opus.
- Material con datos de terceros: no se lo pases a ningún ejecutor externo.
- Un **borrador** de artículo sí se puede delegar, pero **vive en `docs/borradores/`**. Nunca entra en `src/blog/` sin que Sonnet lo reescriba y contraste cada dato clínico con su fuente original. Las fuentes que cite el borrador son pistas, no pruebas.

## Cómo coordinar según tu modelo activo

- **Si eres Sonnet (lo normal):** llevas el lote. Exploras con `explorar.sh`, lanzas con `lanzar.sh`, lees `../ht-agentes-logs/resumen-<TAREA>.txt` y revisas el diff. Pide una primera pasada a `revisor-haiku` si el diff es grande. No lances `capataz` ni `revisor-sonnet` (sería duplicarte).
- **Si eres Opus (Modo Estrategia):** no leas código en bruto ni esperes ejecuciones largas. Explora con `explorar.sh`, escribe las tareas en `docs/tareas/` y di a Javi: *"Plan listo en docs/tareas/. `/clear` y `/model sonnet` para ejecutar."*

## Explorar

```bash
scripts/agentes/explorar.sh "¿Qué módulos de src/ts no tienen test?"           # deepseek → glm → haiku
scripts/agentes/explorar.sh "¿…?" haiku                                          # directo a Haiku
```

Devuelve conclusión + `ruta:línea` en menos de 80 líneas. Los worktrees de exploración están en `../ht-wt-explorar-<ejecutor>`.

## Lanzar una tarea

1. Escribe la tarea en `docs/tareas/NN-nombre.md` (qué, archivos exactos, criterios de aceptación, fuera de alcance, tipo) y haz commit en la rama base.
2. Solo tareas **independientes** en paralelo: nunca dos sobre los mismos archivos; como mucho 2–3 por proveedor a la vez.
3. Escribe el encargo en un archivo (plantilla abajo) y lanza en segundo plano (Bash `run_in_background`, timeout 1500000):

```bash
scripts/agentes/lanzar.sh NN-nombre deepseek,glm,haiku /ruta/encargo.txt main
VERIFICACION=ninguna scripts/agentes/lanzar.sh NN-nombre haiku,deepseek /ruta/encargo.txt main   # informes, borradores, datos
```

El script crea el worktree `../ht-wt-tarea-NN-nombre` (rama `tarea/NN-nombre`), lanza el ejecutor, pasa `npm run verificar`, pide **una** autocorrección si falla, hace failover si un ejecutor no tiene cupo y anota el resultado en `../ht-agentes-logs/registro.csv`. Si la tarea toca `src/`, el script commitea el `public/` regenerado; si no, lo descarta (es solo el hash anticaché). El ejecutor **no** commitea `public/`.

4. Lee `../ht-agentes-logs/resumen-NN-nombre.txt` (commits, archivos, estado). Revisa el diff contra la tarea y `AGENTS.md`. Lo que diga el ejecutor es una afirmación, no una prueba.
5. Correcciones: al **mismo** ejecutor y la misma sesión (opencode: `opencode run -s <sesión> --dir <worktree>`; Haiku: `claude -p --resume <session_id>`; agy: `--conversation <id>`; ids en `../ht-agentes-logs/tarea-NN-*.json`).
6. `npm run verificar` en verde → PR → Javi (o Claude si Javi lo pide) fusiona. Nunca fusionar ni hacer push a `main` sin que lo pida.

### Plantilla del encargo

```text
Tarea NN-nombre. Lee primero AGENTS.md y docs/tareas/NN-nombre.md y haz solo lo que pone.
Trabajas en el worktree actual (rama tarea/NN-nombre). Tipo: <código | pantallas | tests | borrador | informe>.

Archivos que puedes tocar: <lista exacta>
Archivos que debes leer antes: <lista>
Fuera de alcance: <lista>; no toques public/ (lo regenera el script), .env*, textos legales ni textos clínicos.

Cuando termines:
1. npm test y npm run typecheck en verde (si el tipo lo pide).
2. Commits pequeños en español que digan qué y por qué.
3. Último mensaje: qué has hecho, qué no has comprobado y qué dudas tienes. Sin inventar.
```

## Mantener esta skill

Actualiza la tabla de ejecutores con cada batería y cada patrón claro del registro. Un flujo que se repite pasa a su propia skill, en commit propio.
