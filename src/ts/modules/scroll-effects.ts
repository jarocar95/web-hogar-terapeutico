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

    // La barra se oculta tambien dentro de reserva y contacto.
    //
    // Antes solo miraba el hero, asi que permanecia visible el resto de la
    // pagina y tapaba justo lo que una persona indecisa necesita leer: la
    // cuarta hora disponible y el aviso de "la cita queda confirmada cuando te
    // respondo". Al final del documento cubria entera la linea de copyright.
    // Y ofrecer "Reservar" cuando ya estas DENTRO de la seccion de reserva no
    // aporta nada: es ruido, y un destino equivocado si alguien lo pulsa.
    const zonas = [hero, document.getElementById('booking-calendar'), document.getElementById('contact')]
        .filter((el): el is HTMLElement => el !== null);

    const visibles = new Set<Element>();

    const observer = new IntersectionObserver(
        (entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting) visibles.add(entry.target);
                else visibles.delete(entry.target);
            }
            stickyCta.classList.toggle('is-visible', visibles.size === 0);
        },
        { rootMargin: '-80px 0px 0px 0px', threshold: 0 }
    );

    zonas.forEach((z) => observer.observe(z));
}
