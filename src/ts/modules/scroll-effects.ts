/**
 * Scroll effects functionality
 * Sombra de la cabecera y barra fija de CTA en movil.
 *
 * Antes esto encogia la cabecera de 5rem a 4rem al hacer scroll y, con ella,
 * cambiaba el padding-top del body. Es decir: desplazaba el documento entero
 * 16 px a mitad de scroll y forzaba un recalculo de estilos de todo el arbol
 * en cada evento (los toggles estaban fuera del debounce). Medimos CLS 0,40.
 * La cabecera ahora mantiene su altura y solo gana una sombra.
 *
 * La barra fija tampoco depende ya de la direccion del scroll: aparece cuando
 * el hero sale de pantalla y desaparece cuando vuelve. Antes solo se ocultaba
 * por encima de scrollY < 50, asi que en una pagina larga estaba siempre
 * presente compitiendo con los CTA de cada seccion, incluidos los del hero.
 */

export function initScrollEffects(): void {
    const header = document.getElementById('main-header') as HTMLElement | null;
    const stickyCta = document.getElementById('mobile-cta-bar') as HTMLElement | null;

    if (header) {
        const applyHeaderState = (): void => {
            header.classList.toggle('shadow-e1', window.scrollY > 8);
        };
        applyHeaderState();
        window.addEventListener('scroll', applyHeaderState, { passive: true });
    }

    if (!stickyCta) {
        return;
    }

    const hero = document.getElementById('hero');

    // Sin hero (blog, paginas legales) la barra no aplica.
    if (!hero) {
        return;
    }

    if (!('IntersectionObserver' in window)) {
        // Sin soporte, la barra simplemente no aparece: es un atajo, no la
        // unica via de reserva.
        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            for (const entry of entries) {
                stickyCta.classList.toggle('is-visible', !entry.isIntersecting);
            }
        },
        { rootMargin: '-80px 0px 0px 0px', threshold: 0 }
    );

    observer.observe(hero);
}
