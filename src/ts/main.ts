/**
 * Main TypeScript entry point
 * Implements code splitting and lazy loading for optimal performance
 */

// Core functionality - loaded immediately
import { initMobileMenu } from './modules/mobile-menu.js';
import { initScrollEffects } from './modules/scroll-effects.js';
import { initAnimations } from './modules/animations.js';
import { setupGlobalErrorHandling, setupPerformanceMonitoring, Logger } from './utils/logger.js';
import type { PerformanceEntry } from './types';

// Enhanced UI modules
import { EnhancedUI } from './modules/enhanced-ui.js';
import { ScrollAnimations } from './modules/scroll-animations.js';
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
    initAnimations();

    // Initialize enhanced UI features
    const enhancedUI = new EnhancedUI();

    // Initialize scroll animations
    const scrollAnimations = new ScrollAnimations();

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
            // Show loading state after a small delay to avoid flash for cached content
            const loadingTimeout = setTimeout(() => {
                calendarContainer.innerHTML = '<div class="text-center py-8"><div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div><p class="mt-2 text-gray-600">Cargando calendario...</p></div>';
            }, 300); // Only show loading if it takes more than 300ms

            try {
                // La hoja de Litepicker viaja con su JS: antes se pedia desde
                // el <head> de todas las paginas. Y con la version fijada, que
                // apuntaba a "litepicker" a secas (o sea, a la ultima) mientras
                // el JS iba clavado en 2.0.12.
                loadStyle('https://cdn.jsdelivr.net/npm/litepicker@2.0.12/dist/css/litepicker.css');
                await loadScript('https://cdn.jsdelivr.net/npm/moment@2.29.1/moment.min.js');
                await loadScript('https://cdn.jsdelivr.net/npm/litepicker@2.0.12/dist/litepicker.js');

                const { initBookingCalendar } = await import('./modules/booking-calendar.js');
                console.log('Booking calendar module loaded');
                initBookingCalendar();
                console.log('Calendar initialized successfully');

                // Clear loading timeout since calendar loaded successfully
                clearTimeout(loadingTimeout);
                Logger.getInstance().event('calendar_load', 'booking_calendar', 'success');
            } catch (calendarError) {
                console.error('Error loading calendar:', calendarError);
                Logger.getInstance().error('Calendar loading failed', { error: calendarError instanceof Error ? calendarError.message : String(calendarError) });

                // Clear loading timeout
                clearTimeout(loadingTimeout);

                // Show error state with fallback
                calendarContainer.innerHTML = `
                    <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                        <i class="ri-calendar-error-line text-4xl text-red-500 mb-2"></i>
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

// Performance monitoring - safely check for support
if ('performance' in window && 'PerformanceObserver' in window) {
    try {
        // @ts-ignore - PerformanceObserver types
        const perfObserver = new PerformanceObserver((list: PerformanceObserverEntryList) => {
            for (const entry of list.getEntries()) {
                const perfEntry = entry as PerformanceEntry;
                try {
                    if (perfEntry.entryType === 'largest-contentful-paint') {
                        console.log('LCP:', perfEntry.startTime);
                    }
                    if (perfEntry.entryType === 'first-input' && 'processingStart' in perfEntry) {
                        // @ts-ignore - safe to access processingStart here
                        console.log('FID:', perfEntry.processingStart - perfEntry.startTime);
                    }
                } catch (e) {
                    // Ignore deprecated API warnings
                }
            }
        });

        try {
            perfObserver.observe({ entryTypes: ['largest-contentful-paint', 'first-input'] });
        } catch (e) {
            // Fallback for browsers that don't support these entry types
            console.log('Performance monitoring partially supported');
        }
    } catch (e) {
        // PerformanceObserver not fully supported
        console.log('Performance monitoring not available');
    }
}