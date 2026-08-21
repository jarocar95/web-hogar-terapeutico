/**
 * Main TypeScript entry point
 * Implements code splitting and lazy loading for optimal performance
 */

// Core functionality - loaded immediately
import { initMobileMenu } from './modules/mobile-menu.js';
import { initScrollEffects } from './modules/scroll-effects.js';
import { setupGlobalErrorHandling, setupPerformanceMonitoring, Logger } from './utils/logger.js';
import type { PerformanceEntry } from './types';

// Enhanced UI modules
import { EnhancedUI } from './modules/enhanced-ui.js';
import { LoadingStates } from './modules/loading-states.js';
import { PerformanceOptimizer } from './modules/performance-optimizer.js';

// Initialize monitoring and critical functionality
document.addEventListener('DOMContentLoaded', (): void => {
    // Setup error handling and performance monitoring
    setupGlobalErrorHandling();
    setupPerformanceMonitoring();

    // Initialize core functionality
    initMobileMenu();
    initScrollEffects();

    // Initialize enhanced UI features
    const enhancedUI = new EnhancedUI();

    // ScrollAnimations ya no se instancia. Hacia cuatro cosas y las cuatro
    // sobraban: ocultaba todas las secciones para reaparecerlas al hacer
    // scroll (la causa del CLS de 1,0 que reporto Lighthouse), movia el fondo
    // del hero en cada evento de scroll, y animaba contadores y grupos
    // escalonados cuyos ganchos (.counter, .stagger-group, .parallax-element)
    // no existen en el HTML.
    // initAnimations tampoco: solo ponia animationPlayState a elementos cuyas
    // animaciones CSS se habian borrado hace tiempo.

    // Initialize loading states and skeleton screens
    const loadingStates = new LoadingStates();

    // Initialize performance optimization
    const performanceOptimizer = new PerformanceOptimizer();

    // Log page load event
    const logger = Logger.getInstance();
    logger.event('page_load', 'page_view', document.title);

    // Lazy load non-critical functionality
    loadNonCriticalModules();
});

/**
 * Loads non-critical modules using dynamic imports
 * These are loaded only when needed to improve initial page load performance
 */
async function loadNonCriticalModules(): Promise<void> {
    try {
        // El modulo de consentimiento se carga SIEMPRE: decide el solo si
        // muestra el banner o si se limita a reaplicar la decision guardada.
        // Antes se saltaba cuando ya se habia aceptado, asi que a los visitantes
        // recurrentes nunca se les volvia a otorgar el consentimiento de
        // Analytics y gtag se quedaba en 'denied' para siempre.
        const { initCookieBanner } = await import('./modules/cookie-banner.js');
        initCookieBanner();

        // Load enhanced contact form only if form exists on page
        if (document.getElementById('contactForm')) {
            const { EnhancedContactForm } = await import('./modules/enhanced-contact-form.js');
            new EnhancedContactForm();
        }

        // Load booking calendar only if calendar container exists
        const calendarContainer = document.getElementById('calendar-container');
        if (calendarContainer) {
            // Estado de carga, en su propio elemento.
            //
            // Antes esto escribia directamente en innerHTML del contenedor y se
            // limpiaba solo con clearTimeout, que impide que el temporizador
            // vuelva a dispararse pero NO retira lo que ya habia escrito. Si el
            // CDN tardaba mas de 300 ms, Litepicker se montaba debajo y el
            // "Cargando calendario..." se quedaba para siempre encima del
            // calendario ya funcionando.
            const loadingTimeout = setTimeout(() => {
                const loader = document.createElement('div');
                loader.id = 'calendar-loading';
                loader.className = 'text-center py-8';
                loader.setAttribute('role', 'status');
                // Mismo spinner SVG que el boton de envio del formulario, en
                // vez del truco de rounded-full + border-b-2: dos spinners con
                // dos tecnicas distintas en la misma pagina no tenian por que
                // existir.
                loader.innerHTML = '<svg class="inline-block animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg><p class="mt-2 text-ink-mute">Cargando calendario...</p>';
                calendarContainer.prepend(loader);
            }, 300); // Only show loading if it takes more than 300ms

            const removeLoader = (): void => {
                clearTimeout(loadingTimeout);
                document.getElementById('calendar-loading')?.remove();
            };

            try {
                // La hoja de Litepicker viaja con su JS: antes se pedia desde
                // el <head> de todas las paginas. Y con la version fijada, que
                // apuntaba a "litepicker" a secas (o sea, a la ultima) mientras
                // el JS iba clavado en 2.0.12.
                loadStyle('https://cdn.jsdelivr.net/npm/litepicker@2.0.12/dist/css/litepicker.css');
                await loadScript('https://cdn.jsdelivr.net/npm/moment@2.29.1/moment.min.js');
                await loadScript('https://cdn.jsdelivr.net/npm/litepicker@2.0.12/dist/litepicker.js');

                const { initBookingCalendar } = await import('./modules/booking-calendar.js');

                // Se retira ANTES de montar el calendario: si se hace despues,
                // Litepicker ya se ha insertado y el aviso queda encima.
                removeLoader();

                initBookingCalendar();
                Logger.getInstance().event('calendar_load', 'booking_calendar', 'success');
            } catch (calendarError) {
                console.error('Error loading calendar:', calendarError);
                Logger.getInstance().error('Calendar loading failed', { error: calendarError instanceof Error ? calendarError.message : String(calendarError) });

                removeLoader();

                // Show error state with fallback
                calendarContainer.innerHTML = `
                    <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                        <i class="ri-error-warning-line text-4xl text-red-500 mb-2"></i>
                        <h3 class="text-lg font-semibold text-red-800 mb-2">Calendario no disponible</h3>
                        <p class="text-red-600 mb-4">No pudimos cargar el calendario de reservas en este momento.</p>
                        <a href="https://wa.me/34621348616?text=Hola%20Angie,%20me%20gustaría%20agendar%20una%20cita."
                           target="_blank"
                           rel="noopener noreferrer"
                           class="inline-flex items-center gap-2 bg-secondary text-white px-6 py-2 rounded-lg hover:bg-secondary-darker transition-colors">
                            <i class="ri-whatsapp-line"></i>
                            Agendar por WhatsApp
                        </a>
                    </div>
                `;
            }
        }

    } catch (error) {
        console.error('Error loading non-critical modules:', error);
    }
}

/**
 * Utility function to load external scripts dynamically
 * @param src - Script URL
 * @returns Promise that resolves when script is loaded
 */
function loadStyle(href: string): void {
    if (document.querySelector(`link[href="${href}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
}

/**
 * Utility function to load external scripts dynamically
 * @param src - Script URL
 * @returns Promise that resolves when script is loaded
 */
function loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
        document.head.appendChild(script);
    });
}

// Aquí había un segundo observador de LCP y FID, duplicando el que ya vive en
// performance-optimizer.monitorWebVitals(). Se ha eliminado por tres motivos:
//
// 1. Usaba la forma antigua `observe({ entryTypes: [...] })`, que es la que
//    provocaba el aviso "Deprecated API for given entry type" en cada carga.
//    El que se queda usa `{ type, buffered: true }`, uno por métrica.
// 2. Escribía los valores directamente con console.log, sin pasar por el
//    Logger, así que ni respetaba el entorno ni llegaba a analítica.
// 3. Medía lo mismo dos veces y peor: no congelaba el LCP en la primera
//    interacción, así que informaba de valores que ya no eran el LCP real.