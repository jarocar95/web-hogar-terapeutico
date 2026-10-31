# Tareas para agentes

Cada archivo `NN-nombre.md` es una tarea autocontenida. Una rama (`tarea/NN-nombre`) y un Pull Request por tarea; ver `AGENTS.md`.

## Qué lleva cada tarea

1. **Qué** y por qué, en pocas líneas.
2. **Archivos exactos** que puede tocar y los que debe leer antes.
3. **Criterios de aceptación** comprobables (qué comando pasa, qué se ve).
4. **Fuera de alcance**: lo que no debe tocar aunque parezca relacionado.
5. **Tipo**: para qué ejecutor encaja (pantallas/CSS, lógica TS, tests, contenido mecánico, exploración). Lo decide la skill `delegar`.

Las zonas críticas (textos clínicos y legales) no se delegan en ejecutores externos: ver `AGENTS.md`.

## Qué es "terminado" en todas

- `npm run verificar` en verde, sin tests desactivados ni rebajados.
- Si hay `src/` tocado, `public/` regenerado por el build y commiteado con el cambio.
- Pantallas tocadas revisadas a 390 px y en escritorio.
- PR con qué se hizo, cómo se probó y qué queda pendiente.

## Índice

| # | Tarea | Depende de | Estado |
|---|---|---|---|
| 00 | Implantar el sistema de delegación (rama `tarea/00-sistema-delegacion`) | — | En curso |
