/**
 * Banner de consentimiento de cookies.
 *
 * La guia de la AEPD exige que rechazar sea tan facil y tan visible como
 * aceptar, y que la decision se pueda cambiar despues. Por eso hay dos botones
 * con el mismo peso y un enlace permanente en el pie para reabrir el banner.
 *
 * La decision se guarda en localStorage bajo 'cookieConsent': 'granted' |
 * 'denied'. Se sigue escribiendo la clave antigua 'cookiesAccepted' cuando se
 * acepta, para no romper nada que dependiera de ella, y se lee como respaldo
 * para no volver a preguntar a quien ya habia aceptado.
 */

type Consent = 'granted' | 'denied';

const CLAVE = 'cookieConsent';
const CLAVE_ANTIGUA = 'cookiesAccepted';

function leerDecision(): Consent | null {
    try {
        const guardada = localStorage.getItem(CLAVE);
        if (guardada === 'granted' || guardada === 'denied') {
            return guardada;
        }
        if (localStorage.getItem(CLAVE_ANTIGUA) === 'true') {
            return 'granted';
        }
    } catch {
        // localStorage puede estar bloqueado (navegacion privada, cookies de terceros).
    }
    return null;
}

function guardarDecision(valor: Consent): void {
    try {
        localStorage.setItem(CLAVE, valor);
        if (valor === 'granted') {
            localStorage.setItem(CLAVE_ANTIGUA, 'true');
        } else {
            localStorage.removeItem(CLAVE_ANTIGUA);
        }
    } catch {
        // Si no se puede guardar, la decision solo dura esta sesion.
    }
}

/**
 * Carga gtag.js. Solo se llama cuando hay consentimiento.
 *
 * Antes la libreria se pedia en cada visita desde la cabecera, con el
 * consentimiento en 'denied': ~90 KB compitiendo por ancho de banda en la ruta
 * critica sin recoger nada. Las llamadas a gtag() que se hicieron antes de
 * esto quedan encoladas en dataLayer y se procesan al arrancar la libreria.
 */
export const DOMINIOS_PRODUCCION = ['hogarterapeutico.com', 'www.hogarterapeutico.com'];

/**
 * Analytics solo se carga en el dominio real.
 *
 * Los tests de navegador pulsan «Aceptar» en el banner contra localhost, en
 * cinco navegadores y cada vez que se pasan, y con el ID real de la
 * propiedad: cada pasada eran visitas «directas» de pocos segundos colandose
 * en los datos de Angie. Lo mismo valia para npm start y para los deploy
 * previews de Netlify. Mismo criterio que isProduction en utils/logger.ts.
 */
export function esDominioDeProduccion(host: string = window.location.hostname): boolean {
    return DOMINIOS_PRODUCCION.includes(host);
}

function cargarAnalytics(): void {
    const id = (window as any).__ANALYTICS_ID as string | undefined;
    if (!id) return;
    if (!esDominioDeProduccion()) return;
    if (document.querySelector('script[data-analytics]')) return;

    const script = document.createElement('script');
    script.async = true;
    script.dataset.analytics = '';
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
    document.head.appendChild(script);
}

function aplicarConsentimiento(valor: Consent): void {
    if (typeof window.gtag === 'function') {
        window.gtag('consent', 'update', { analytics_storage: valor });
    }
    if (valor === 'granted') {
        cargarAnalytics();
    }
}

export function initCookieBanner(): void {
    const banner = document.getElementById('cookie-consent-banner') as HTMLElement | null;
    const btnAceptar = document.getElementById('accept-cookies-btn') as HTMLButtonElement | null;
    const btnRechazar = document.getElementById('reject-cookies-btn') as HTMLButtonElement | null;
    const btnPreferencias = document.getElementById('cookie-settings-link') as HTMLElement | null;

    // Reaplicar la decision guardada SIEMPRE y antes que nada: es lo unico que
    // no depende de que el banner exista en esta pagina.
    const decisionPrevia = leerDecision();
    if (decisionPrevia) {
        aplicarConsentimiento(decisionPrevia);
    }

    if (!banner || !btnAceptar) {
        return;
    }

    const mostrar = (): void => {
        banner.classList.remove('hidden');
        banner.style.transition = '';
        banner.style.opacity = '1';
        banner.style.display = '';
    };

    const ocultar = (): void => {
        banner.style.transition = 'opacity 0.5s ease';
        banner.style.opacity = '0';
        window.setTimeout(() => {
            banner.style.display = 'none';
            banner.classList.add('hidden');
        }, 500);
    };

    const decidir = (valor: Consent): void => {
        guardarDecision(valor);
        aplicarConsentimiento(valor);
        ocultar();
    };

    btnAceptar.addEventListener('click', () => decidir('granted'));
    btnRechazar?.addEventListener('click', () => decidir('denied'));

    // Permitir cambiar de opinion en cualquier momento desde el pie.
    btnPreferencias?.addEventListener('click', (e) => {
        e.preventDefault();
        mostrar();
        btnAceptar.focus();
    });

    if (!decisionPrevia) {
        mostrar();
    }
}
