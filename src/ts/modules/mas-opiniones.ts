/**
 * "Ver mas opiniones" en movil.
 *
 * En movil la portada ensena tres opiniones y deja el resto (.tst-extra)
 * ocultas por CSS: las seis apiladas ocupaban casi tres pantallas justo antes
 * del calendario. El boton nace oculto en el HTML y solo se muestra aqui, asi
 * que sin JavaScript nadie ve un boton que no hace nada. En sm y superior las
 * extra ya son visibles por CSS y el boton lleva sm:hidden.
 */
export function initMasOpiniones(): void {
    const boton = document.querySelector<HTMLButtonElement>('[data-mas-opiniones]');
    const extra = document.querySelectorAll<HTMLElement>('.tst-extra');
    if (!boton || extra.length === 0) return;

    boton.classList.remove('hidden');
    boton.classList.add('sm:hidden');

    boton.addEventListener('click', () => {
        extra.forEach((el) => el.classList.add('is-visible'));
        boton.setAttribute('aria-expanded', 'true');
        // Clase y no el atributo hidden: .btn declara su propio display y
        // pisaria el display:none que el navegador da a [hidden].
        boton.classList.add('hidden');
        // El foco iria a parar al body al desaparecer el boton; se lleva a la
        // primera opinion nueva para que el teclado siga donde estaba.
        extra[0].setAttribute('tabindex', '-1');
        extra[0].focus({ preventScroll: true });
    });
}
