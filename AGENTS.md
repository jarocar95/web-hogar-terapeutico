# hogarterapeutico.com: guía para agentes

Léela entera antes de tocar nada. Vale para cualquier agente (Gemini en Antigravity, opencode, Claude Code…) y manda sobre cualquier otra guía. Si algo de aquí choca con lo que te pide una tarea, para y pregunta a Javi.

## Qué es

Web de **Angie Sánchez**, psicóloga sanitaria colegiada (M-42569, Madrid) que atiende por videollamada. Capta pacientes: informa, genera confianza y lleva a reservar la primera sesión (35 €). Es una sola profesional, no una clínica. Contexto de negocio, público y tono en `docs/00-contexto-proyecto.md` (empieza por ahí) y en `PRODUCT.md`.

Las tareas están en **`docs/tareas/`**. Haz solo la que te pidan, dentro de su alcance.

## Stack

- Sitio estático: **Eleventy 3** (plantillas Nunjucks `.njk`, páginas `.html` y artículos `.md`), **Tailwind 3**, **TypeScript** compilado con esbuild.
- Fuentes, iconos y Litepicker **autoalojados**. Los únicos orígenes externos son googletagmanager y Formspree.
- Despliegue: **Netlify** (`npm run build`, publica `public/`, Node 22). Cada push a `main` acaba en producción; no hay staging.
- Formulario de contacto con Formspree; calendario de reservas propio sobre `public/api/horarios.json`; cookies con banner de consentimiento.

## Mapa del código

```
src/index.html, *.njk     Páginas: portada, sobre-mi, terapia-emdr-online, psicologa-ansiedad-online
src/aviso-legal.html, politica-*.html   Legales (zona crítica)
src/blog/*.md             Artículos (frontmatter: layout post.njk, faq, relacionados…)
src/guias/                PDF descargables (se copian tal cual)
src/_includes/            base.njk, post.njk, legal.njk, schemas.njk (JSON-LD), faq-acordeon.njk
src/_data/                doctoralia.js, opiniones.json (reseñas reales, las actualiza scraper.py + workflow)
src/ts/                   main.ts, modules/, utils/, types/
src/input.css             Tailwind y CSS propio
src/images, src/fonts     Originales (eleventy-img genera las variantes)
public/                   SALIDA del build, pero está versionada (ver "Cómo trabajar")
public/api/horarios.json  Disponibilidad real de Angie
.eleventy.js              Config, imágenes responsive, minificado y generación de la CSP
scripts/                  build-js, build-icons, build-fonts
recursos/                 Generadores Python (reportlab) de PDF/Excel de marca; fuera de src/ a propósito
tests/unit, tests/e2e     Jest y Playwright
```

## Lo que no se rompe

- **`public/_headers` lo escribe el build** (la CSP con hashes de los scripts inline, desde `.eleventy.js`). No lo edites a mano. Para cambiar la política, toca `.eleventy.js`. El resto de cabeceras viven en `netlify.toml`.
- Si cambias un script inline, el build debe seguir calculando su hash; el workflow `build-produccion.yml` falla si alguno se queda sin él.
- Los nombres de las imágenes responsive salen del archivo original: los nombres de `src/images` deben ser únicos. El `preload` del hero y las llamadas a `Image()` comparten la misma función de nombres; no las separes.
- `public/api/horarios.json` son horas **reales**: solo hay mañanas laborables (≈10:00–13:00). No las "arregles" ni inventes tardes.
- Sin dependencias nuevas, sin librerías de UI, sin CDN: todo se autoaloja.

## Datos reales: no se inventan

- **Precios publicados:** primera sesión 35 € (50 min), seguimiento online 50 € (50 min). Solo los cambia Javi.
- **Terapia presencial:** "próximamente". Nunca la presentes como disponible hoy.
- **Credenciales:** solo las de la sección "Mi Formación" de la web. Ni premios, ni prensa, ni titulaciones nuevas.
- **Reseñas:** solo las reales de Doctoralia (`src/_data/opiniones.json`). Nunca las inventes ni las parafrasees en afirmaciones nuevas.
- **Una sola terapeuta.** Nada que sugiera equipo, clínica o varios profesionales.
- Si un dato no está verificado, escribe `[PENDIENTE]` y avisa.

## Texto y tono

- Español de España, tuteo, cálido, claro y sin jerga clínica fría. Detalle en `PRODUCT.md` y `docs/00-contexto-proyecto.md`.
- **Nunca prometas curar, ni resultados garantizados.** No des diagnósticos ni consejos clínicos personalizados.
- Contenido de salud mental = terreno delicado: cada dato clínico se cita con su fuente original.
- Los artículos del blog siguen `docs/escritor.md`.
- El logo se usa **siempre completo**, nunca recortado, ni siquiera en el favicon (engrosa el trazo si hace falta).

## Zonas críticas

Las trabaja o revisa Opus (en sesión o vía `arquitecto-opus`). **Ejecutores externos y Haiku no las tocan nunca:**

- Textos clínicos: afirmaciones terapéuticas, descripciones de enfoques (EMDR, ansiedad, trauma), material clínico para pacientes.
- `src/aviso-legal.html`, `src/politica-privacidad.html`, `src/politica-cookies.html`.

Sobre ese contenido sí puedes hacer trabajo **mecánico** si la tarea lo pide expresamente (comprobar enlaces, formato, metadatos SEO, accesibilidad), sin reescribir ni reformular ninguna afirmación.

## Privacidad con modelos externos

Los ejecutores gratuitos (DeepSeek, GLM vía opencode; Gemini vía agy) envían lo que lean a un tercero. Por eso:

- **No les pases datos personales de pacientes ni de terceros.** Nunca lean ni citen material con datos de otras personas (NIF, direcciones, colegiados ajenos).
- Eso incluye el **material clínico que viene de GB Psicología** hasta que Claude lo haya auditado y limpiado.
- Nada de `.env*`, credenciales ni `.mcp.json`.

## Comandos

```
npm start               Servidor local con recarga (Eleventy en :8080 + watch de CSS y JS)
npm run build           Iconos + CSS + typecheck + JS + Eleventy: genera public/
npm run typecheck       tsc --noEmit
npm test                Jest (unitarios)
npm run test:e2e        Playwright (lento; el CI lo ejecuta en 3 navegadores)
npm run verificar       typecheck + Jest + build. Debe pasar entero antes de cada commit
```

## Cómo trabajar (obligatorio)

1. **Una rama por tarea**: `tarea/NN-nombre`, desde `main` actualizado. Nunca trabajes ni hagas push a `main`: despliega a producción.
2. Lee la tarea en `docs/tareas/` y los archivos que cita antes de escribir. Respeta su "Fuera de alcance".
3. Commits pequeños, en español, que digan qué y por qué.
4. **`public/` está versionado.** Si tocas `src/`, `npm run verificar` regenera `public/`; commitea ese resultado en el mismo commit que el cambio, nunca editado a mano. Es normal que cada build toque ~4 líneas de todas las páginas: es el hash corto de `HEAD` que usa la cadena anticaché (`?v=…`). Cualquier otro cambio inesperado en `public/`, explícalo en el PR en vez de ocultarlo.
5. Antes de dar la tarea por terminada: `npm run verificar` en verde y, si tocas pantallas, revisa a 390 px y en escritorio.
6. Sube la rama y abre un Pull Request: qué has hecho, cómo lo has probado, capturas si hay interfaz y qué queda pendiente. Javi (o Claude) lo revisa antes de fusionar.

### Lo que NO puedes hacer sin el visto bueno explícito de Javi en el chat

- Hacer push o fusionar en `main`, ni nada que despliegue a producción.
- Tocar `.env*`, claves, credenciales de Google/Search Console, `.mcp.json`, o el id de Formspree.
- Añadir dependencias nuevas (si es imprescindible, justifícalo en el PR).
- Editar los textos legales o los textos clínicos (zonas críticas).
- Cambiar precios, horarios publicados, credenciales o reseñas.
- Borrar datos o archivos que no creaste tú.
- Desactivar, saltar (`.skip`) o rebajar tests para que pasen.
- Instalar nada fuera del repo o global.

Si te atascas o la tarea no encaja con el código real, detente y explícalo en lugar de improvisar. Lo que digas haber hecho es una afirmación, no una prueba: quien revise lo verificará.
