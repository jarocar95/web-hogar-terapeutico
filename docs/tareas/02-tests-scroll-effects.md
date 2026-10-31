# 02 · Tests unitarios de `scroll-effects.ts`

**Tipo:** tests (Jest). **Ejecutor previsto:** GLM.

## Qué y por qué

`src/ts/modules/scroll-effects.ts` pone la sombra de la cabecera y decide cuándo se ve la barra fija de reserva en móvil. Se reescribió para arreglar un CLS de 0,40 y no tiene tests: una regresión devolvería el salto de layout o dejaría la barra tapando el calendario sin que falle nada.

## Archivos

- **Puedes crear:** `tests/unit/scroll-effects.test.ts`
- **Debes leer antes:** `src/ts/modules/scroll-effects.ts`, `tests/setup.js`, `jest.config.js` y `tests/unit/mobile-menu.test.ts` como estilo.
- **No tocar:** nada en `src/`, `jest.config.js`, `tests/setup.js`, `public/`.

## Qué debe cubrir

1. Cabecera (`#main-header`): al iniciar, con `scrollY` ≤ 8 no lleva la clase `shadow-e1`; tras un evento `scroll` con `scrollY` > 8 sí; al volver arriba la pierde. Si no existe la cabecera, no falla.
2. Sin `#mobile-cta-bar`: no hace nada más y no falla.
3. Sin `#hero` (blog, legales): no crea ningún observador.
4. Sin `IntersectionObserver` en `window`: no falla y la barra no aparece.
5. Con barra y hero: la barra tiene `is-visible` solo cuando **ninguna** de las zonas observadas (`#hero`, `#booking-calendar`, `#contact`) está en pantalla; basta con que una lo esté para ocultarla. Si faltan `#booking-calendar` o `#contact`, solo observa las que existen.

## Cuidado

`tests/setup.js` define un `IntersectionObserver` falso que **no ejecuta nunca el callback**. Para el punto 5 sustituye `global.IntersectionObserver` en el test por una clase falsa que guarde el callback y las zonas observadas, y dispáralo a mano con entradas `{ target, isIntersecting }`. Restaura el original al acabar para no afectar a otros tests. Para cambiar `scrollY` usa `Object.defineProperty(window, 'scrollY', …)`.

## Criterios de aceptación

- `npm test` en verde y `npm run typecheck` en verde.
- Cada caso tiene al menos un test que **falla si rompes esa regla** (cambia a mano el umbral `8` o el `size === 0` y comprueba que algún test se pone rojo; deshaz el cambio antes de acabar).
- Los tests prueban comportamiento observable (clases en el DOM), no reimplementan la lógica.

## Fuera de alcance

Cambiar `scroll-effects.ts`, añadir dependencias, tocar la configuración de Jest, o tests de otros módulos.
