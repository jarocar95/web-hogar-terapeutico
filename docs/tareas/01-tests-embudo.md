# 01 · Tests unitarios de `embudo.ts`

**Tipo:** tests (Jest). **Ejecutor previsto:** DeepSeek.

## Qué y por qué

`src/ts/modules/embudo.ts` mide el embudo de reserva (cta → día → hora → WhatsApp/formulario). Es lo que dirá si falta tráfico o falta conversión, y no tiene ningún test: si alguien toca un selector, los eventos dejan de salir sin que falle nada. Hay que fijar su comportamiento documentado en el propio archivo.

## Archivos

- **Puedes crear:** `tests/unit/embudo.test.ts`
- **Debes leer antes:** `src/ts/modules/embudo.ts`, `src/ts/utils/logger.ts` (método `event`), `tests/setup.js`, `jest.config.js` y un test existente como estilo (`tests/unit/mobile-menu.test.ts`).
- **No tocar:** nada en `src/`, `jest.config.js`, `tests/setup.js`, `public/`.

## Qué debe cubrir

1. Un clic en un enlace `wa.me` **dentro de `#available-times`** emite `reserva_whatsapp`, con el texto del enlace como etiqueta (y `'hora'` si no hay texto).
2. Un enlace `wa.me` **fuera** de `#available-times` emite `contacto_whatsapp`, con la sección como etiqueta.
3. Un enlace con `#booking-calendar` emite `cta_reservar`.
4. La etiqueta de sección: usa el `id` de la sección, o el nombre de la etiqueta si no tiene id (`header`, `footer`, `section`), o `sin_seccion` si no hay ninguna.
5. Un clic en un enlace cualquiera (otro `href`) o fuera de un enlace no emite nada. Un clic en un hijo del enlace (p. ej. un `<span>` dentro) sí cuenta.
6. `registrarDiaElegido(fecha, huecos)` y `registrarFormularioEnviado()` emiten `calendario_dia` (con fecha y nº de huecos) y `formulario_enviado` (etiqueta `contacto`).
7. Los dos eventos de WhatsApp **no se mezclan**: es el motivo del diseño.

## Cuidado

- `Logger` es un singleton. Sustituye `Logger.getInstance` (con `jest.spyOn`) por un objeto con `event: jest.fn()` y comprueba los argumentos exactos (`nombre, categoría, etiqueta, valor`). No hagas pasar el test por gtag.
- `initEmbudo()` añade un listener a `document` **cada vez que se llama** y `document` no se limpia entre tests: si lo llamas en cada `beforeEach`, los clics se contarán varias veces. Llámalo una vez, o aísla el módulo, y demuestra con un test que un clic emite **un** solo evento.

## Criterios de aceptación

- `npm test` en verde y `npm run typecheck` en verde.
- Cada caso de arriba tiene al menos un test que **falla si rompes esa regla** (cambia a mano el selector `#available-times` o un nombre de evento y comprueba que algún test se pone rojo; deshaz el cambio antes de acabar).
- Los tests prueban el comportamiento observable, no reimplementan la lógica.

## Fuera de alcance

Cambiar `embudo.ts`, añadir dependencias, tocar la configuración de Jest, o tests de otros módulos.
