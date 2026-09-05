# Por qué ya no hay `animations.spec.ts`

Se borró junto con la función que probaba.

El fichero comprobaba que existieran elementos con `.animate-fade-in-up` y que
un `IntersectionObserver` los fuera revelando al hacer scroll. Ese observer se
quitó a propósito de `enhanced-ui.ts` (ver el comentario en `init()`): ponía
`opacity: 0` a las once secciones y las dieciocho tarjetas **después** de que el
navegador ya las hubiera pintado, y las devolvía a cero al hacer scroll. En un
móvil lento eso significa que la página aparece entera y acto seguido se apaga.

Con la función fuera, las ocho pruebas quedaron en rojo permanente. Una prueba
que exige una función que se eliminó por decisión no es una prueba que arreglar:
es ruido que tapa los fallos de verdad. De hecho tapó uno grave —el formulario
de contacto llevaba tiempo sin poder enviarse— porque con veintitrés pruebas en
rojo nadie miraba cuál era cuál.

Si algún día vuelve a haber animaciones de entrada, el sitio de la prueba es
comprobar que **no** se aplican con `prefers-reduced-motion` y que el contenido
es visible sin JavaScript, no que existan unas clases concretas.
