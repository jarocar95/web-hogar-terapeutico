/**
 * Main JavaScript entry point
 * Implements code splitting and lazy loading for optimal performance
 */

// Core functionality - loaded immediately
import { initMobileMenu } from './modules/mobile-menu.js';
import { initScrollEffects } from './modules/scroll-effects.js';

// Initialize critical functionality immediately
document.addEventListener('DOMContentLoaded', () => {
    // initMobileMenu(); // Temporarily disabled to avoid conflicts
    initScrollEffects();

    // Lazy load non-critical functionality
    loadNonCriticalModules();
});

/**
 * Loads non-critical modules using dynamic imports
 * These are loaded only when needed to improve initial page load performance
 */
async function loadNonCriticalModules() {
    try {
        // Load cookie banner only if user hasn't accepted cookies
        if (localStorage.getItem('cookiesAccepted') !== 'true') {
            const { initCookieBanner } = await import('./modules/cookie-banner.js');
            initCookieBanner();
        }

        // Load contact form only if form exists on page
        if (document.getElementById('contactForm')) {
            const { initContactForm } = await import('./modules/contact-form.js');
            initContactForm();
        }

        // Load booking calendar only if calendar container exists
        if (document.getElementById('calendar-container')) {
            // Load Litepicker dependencies first
            await loadScript('https://cdn.jsdelivr.net/npm/moment@2.29.1/moment.min.js');
            await loadScript('https://cdn.jsdelivr.net/npm/litepicker@2.0.12/dist/litepicker.js');

            const { initBookingCalendar } = await import('./modules/booking-calendar.js');
            initBookingCalendar();
        }

    } catch (error) {
        console.error('Error loading non-critical modules:', error);
    }
}

/**
 * Utility function to load external scripts dynamically
 * @param {string} src - Script URL
 * @returns {Promise} Resolves when script is loaded
 */
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Performance monitoring
if ('performance' in window && 'PerformanceObserver' in window) {
    const perfObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            if (entry.entryType === 'largest-contentful-paint') {
                console.log('LCP:', entry.startTime);
            }
            if (entry.entryType === 'first-input') {
                console.log('FID:', entry.processingStart - entry.startTime);
            }
        }
    });

    perfObserver.observe({ entryTypes: ['largest-contentful-paint', 'first-input'] });
}