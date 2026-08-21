/**
 * Performance optimization module
 * Implements various performance improvements and monitoring
 */

export class PerformanceOptimizer {
    private metrics: Map<string, number> = new Map();
    private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();

    constructor() {
        this.init();
    }

    init() {
        this.setupResourceHints();
        this.setupImageOptimization();
        this.setupCodeSplitting();
        this.setupCaching();
        this.setupPerformanceMonitoring();
        this.setupCriticalResourceLoading();
        this.setupPreloading();
        this.setupIdleCallbacks();
    }

    /**
     * Setup resource hints for better performance
     */
    setupResourceHints() {
        // DNS prefetch for external domains
        const domains = [
            'https://cdn.jsdelivr.net',
            'https://fonts.googleapis.com',
            'https://fonts.gstatic.com',
            'https://www.googletagmanager.com',
            'https://formspree.io'
        ];

        domains.forEach(domain => {
            const link = document.createElement('link');
            link.rel = 'dns-prefetch';
            link.href = domain;
            document.head.appendChild(link);
        });

        // Preconnect for critical third-party resources
        const criticalDomains = [
            'https://cdn.jsdelivr.net',
            'https://fonts.googleapis.com',
            'https://fonts.gstatic.com'
        ];

        criticalDomains.forEach(domain => {
            const link = document.createElement('link');
            link.rel = 'preconnect';
            link.href = domain;
            link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
        });
    }

    /**
     * Setup image optimization with lazy loading and WebP support
     */
    setupImageOptimization() {
        this.setupLazyLoading();
        this.setupWebPFallback();
        this.setupImageCompression();
    }

    /**
     * Setup lazy loading for images
     */
    setupLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');

        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target as HTMLImageElement;
                    this.loadImage(img);
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.1
        });

        images.forEach(img => imageObserver.observe(img));
    }

    /**
     * Setup WebP format detection and fallback
     */
    setupWebPFallback() {
        const checkWebP = () => {
            return new Promise((resolve) => {
                const webP = new Image();
                webP.onload = webP.onerror = () => {
                    resolve(webP.height === 2);
                };
                webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
            });
        };

        checkWebP().then((supportsWebP) => {
            if (supportsWebP) {
                document.documentElement.classList.add('webp-supported');
            }
        });
    }

    /**
     * Setup image compression simulation
     */
    setupImageCompression() {
        // Add loading="lazy" to all images that don't have it
        const images = document.querySelectorAll('img:not([loading])');
        images.forEach(img => {
            if (!img.hasAttribute('loading')) {
                img.setAttribute('loading', 'lazy');
            }
        });
    }

    /**
     * Load image with performance optimization
     */
    loadImage(img: HTMLImageElement) {
        const src = img.getAttribute('data-src');
        if (!src) return;

        // Create a new image to preload
        const tempImg = new Image();
        tempImg.onload = () => {
            img.src = src;
            img.removeAttribute('data-src');
            img.classList.add('loaded');
        };
        tempImg.src = src;
    }

    /**
     * Setup code splitting and dynamic imports
     */
    setupCodeSplitting() {
        // Lazy load non-critical JavaScript
        this.lazyLoadNonCriticalJS();

        // Load polyfills only when needed
        this.loadPolyfillsIfNeeded();
    }

    /**
     * Lazy load non-critical JavaScript
     */
    lazyLoadNonCriticalJS() {
        const loadWhenIdle = () => {
            // Load additional modules when browser is idle
            if ('requestIdleCallback' in window) {
                requestIdleCallback(() => {
                    // Load analytics or other non-critical scripts
                    this.loadAnalytics();
                });
            } else {
                setTimeout(() => {
                    this.loadAnalytics();
                }, 2000);
            }
        };

        // Load when user interacts with page
        const loadOnInteraction = () => {
            loadWhenIdle();
            document.removeEventListener('click', loadOnInteraction);
            document.removeEventListener('scroll', loadOnInteraction);
        };

        document.addEventListener('click', loadOnInteraction, { once: true });
        document.addEventListener('scroll', loadOnInteraction, { once: true });
    }

    /**
     * Polyfills: ya no se cargan.
     *
     * Esto pedia https://polyfill.io/v3/polyfill.min.js a un dominio que cambio
     * de propietario en 2024 y se uso para servir malware a los sitios que lo
     * enlazaban. Ejecutar codigo arbitrario de un tercero en la web de una
     * consulta de psicologia, donde la gente escribe por lo que necesita ayuda,
     * no es un riesgo aceptable, y ademas contradecia el trabajo de "cero
     * terceros" del resto del proyecto.
     *
     * Que se perdia a cambio: IntersectionObserver, fetch y Promise. Los tres
     * estan en todos los navegadores desde 2019 y el propio codigo comprueba su
     * existencia antes de usarlos, asi que degrada solo en vez de romperse.
     */
    loadPolyfillsIfNeeded() {
        // Intencionadamente vacio. Ver el comentario de arriba antes de
        // reintroducir cualquier polyfill servido desde un CDN de terceros.
    }

    /**
     * Setup caching strategies
     */
    setupCaching() {
        // Cache frequently accessed data
        this.setupAPICaching();
        this.setupImageCaching();
    }

    /**
     * Setup API response caching
     */
    setupAPICaching() {
        // Aqui se registraba un service worker en '/sw.js' que no existe ni ha
        // existido nunca. El .catch() se tragaba la promesa rechazada, pero el
        // navegador seguia pidiendo el archivo y dejando un 404 y un error en
        // consola en cada carga de pagina. Una peticion desperdiciada por
        // visita, desde el modulo encargado de optimizar el rendimiento.
        //
        // Si algun dia hace falta cachear la API, primero hay que escribir el
        // service worker y publicarlo.
    }

    /**
     * Setup image caching
     */
    setupImageCaching() {
        // Prefetch hero images
        const heroImages = document.querySelectorAll('#hero .hero-background-image img');
        heroImages.forEach(img => {
            const src = img.getAttribute('src');
            if (src) {
                const link = document.createElement('link');
                link.rel = 'prefetch';
                link.href = src;
                document.head.appendChild(link);
            }
        });
    }

    /**
     * Setup performance monitoring
     */
    setupPerformanceMonitoring() {
        this.monitorWebVitals();
        this.monitorResourceTiming();
        this.setupPerformanceBudget();
    }

    /**
     * Monitor Core Web Vitals
     */
    /**
     * Core Web Vitals.
     *
     * La version anterior publicaba numeros que no significaban nada, y lo
     * hacia por consola en cada carga. Tres errores distintos:
     *
     * 1. CLS. El acumulador `clsValue` se declaraba DENTRO del callback, asi
     *    que empezaba en cero en cada lote de mutaciones: nunca acumulaba. Y no
     *    filtraba `hadRecentInput`, cuando la definicion de la metrica excluye
     *    los desplazamientos que provoca el propio usuario. Abrir una pregunta
     *    del acordeon contaba como mala puntuacion. De ahi los 0,93 medidos.
     * 2. LCP. Seguia registrando despues de la primera interaccion, asi que
     *    cualquier imagen que entrase en pantalla al hacer scroll pasaba a ser
     *    "LCP". Por eso aparecian valores de mas de 100.000 ms. La metrica
     *    termina en la primera interaccion, por definicion.
     * 3. Se imprimia por consola en produccion, en cada carga.
     */
    monitorWebVitals() {
        if (!('PerformanceObserver' in window)) return;

        // ---- LCP: se congela en la primera interaccion --------------------
        try {
            let lcp = 0;
            const lcpObserver = new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                lcp = entries[entries.length - 1].startTime;
            });
            lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true } as any);

            const finalizarLCP = (): void => {
                lcpObserver.disconnect();
                if (lcp > 0) this.recordMetric('LCP', lcp);
            };
            ['keydown', 'click', 'pointerdown'].forEach((ev) =>
                addEventListener(ev, finalizarLCP, { once: true, capture: true })
            );
            // Si nadie interactua, se cierra cuando la pestania pasa a segundo
            // plano: es el momento en que la metrica deja de poder cambiar.
            addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'hidden') finalizarLCP();
            }, { once: true });
        } catch (e) {
            // LCP no soportado
        }

        // ---- FID ----------------------------------------------------------
        try {
            const fidObserver = new PerformanceObserver((entryList) => {
                entryList.getEntries().forEach((entry) => {
                    if ('processingStart' in entry) {
                        this.recordMetric('FID', (entry as any).processingStart - entry.startTime);
                        fidObserver.disconnect();
                    }
                });
            });
            fidObserver.observe({ type: 'first-input', buffered: true } as any);
        } catch (e) {
            // FID no soportado
        }

        // ---- CLS: acumulado de verdad y sin los saltos del usuario --------
        try {
            let cls = 0;
            const clsObserver = new PerformanceObserver((entryList) => {
                entryList.getEntries().forEach((entry) => {
                    const e = entry as any;
                    if (!e.hadRecentInput) cls += e.value;
                });
            });
            clsObserver.observe({ type: 'layout-shift', buffered: true } as any);

            addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'hidden') {
                    clsObserver.takeRecords();
                    clsObserver.disconnect();
                    this.recordMetric('CLS', cls);
                }
            }, { once: true });
        } catch (e) {
            // CLS no soportado
        }
    }

    /**
     * Monitor resource timing
     */
    monitorResourceTiming() {
        window.addEventListener('load', () => {
            const resources = performance.getEntriesByType('resource');
            resources.forEach(resource => {
                if (resource.duration > 1000) { // Resources taking more than 1 second
                    console.warn(`Slow resource: ${resource.name} took ${resource.duration}ms`);
                }
            });
        });
    }

    /**
     * Setup performance budget monitoring
     */
    setupPerformanceBudget() {
        const budget = {
            totalKb: 1000, // 1MB
            javascriptKb: 300, // 300KB
            cssKb: 100, // 100KB
            imageKb: 500 // 500KB
        };

        // Check performance budget after load
        window.addEventListener('load', () => {
            this.checkPerformanceBudget(budget);
        });
    }

    /**
     * Check if performance budget is exceeded
     */
    checkPerformanceBudget(budget: any) {
        const resources = performance.getEntriesByType('resource');
        let totalSize = 0;
        let jsSize = 0;
        let cssSize = 0;
        let imageSize = 0;

        resources.forEach(resource => {
            const size = (resource as any).transferSize || 0;
            totalSize += size;

            if (resource.name.endsWith('.js')) {
                jsSize += size;
            } else if (resource.name.endsWith('.css')) {
                cssSize += size;
            } else if (resource.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
                imageSize += size;
            }
        });

        if (totalSize > budget.totalKb * 1024) {
            console.warn(`Performance budget exceeded: Total size ${Math.round(totalSize / 1024)}KB > ${budget.totalKb}KB`);
        }
    }

    /**
     * Setup critical resource loading
     */
    /**
     * Intencionadamente vacia.
     *
     * Esto inyectaba <link rel="preload"> para /dist/output.css y /js/main.js,
     * y hacia justo lo contrario de lo que pretendia:
     *
     * - Corria DESDE main.js, o sea despues de que ambos recursos ya hubieran
     *   cargado. Precargar algo que ya esta cargado no adelanta nada.
     * - Y lo pedia SIN la cadena de version (?v=hash) que llevan las etiquetas
     *   reales, asi que para el navegador eran URL distintas: las descargaba
     *   otra vez, enteras, y no las usaba jamas.
     *
     * Medido: cuatro peticiones donde debia haber dos. Unos 114 KB tirados en
     * cada carga (94 de CSS y 20 de JS), ademas del aviso de Chrome sobre
     * recursos precargados que no se usan.
     *
     * Las precargas de verdad estan en el <head> de base.njk, que es donde
     * sirven de algo.
     */
    setupCriticalResourceLoading() {
        // Ver el comentario de arriba antes de reintroducir nada aqui.
    }

    /**
     * Intencionadamente vacia.
     *
     * Enganchaba un mouseenter a cada enlace de navegacion para prefetch de
     * '/blog', '/sobre-mi' y '/contacto'. Las dos ultimas no existen: esta web
     * es de scroll unico y usa anclas (#about, #contact). Solo quedaba /blog,
     * que ya se prefetchea solo en navegadores modernos.
     */
    setupPreloading() {
        // Ver el comentario de arriba.
    }

    /**
     * Preload a page
     */
    preloadPage(url: string) {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        document.head.appendChild(link);
    }

    /**
     * Setup idle callbacks for non-critical tasks
     */
    setupIdleCallbacks() {
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                // Load non-critical analytics
                this.loadAnalytics();

                // Initialize non-critical features
                this.initializeNonCriticalFeatures();
            });
        }
    }

    /**
     * Load analytics scripts
     */
    loadAnalytics() {
        // This would load analytics scripts when the browser is idle
        console.log('Analytics would be loaded here');
    }

    /**
     * Initialize non-critical features
     */
    initializeNonCriticalFeatures() {
        // Initialize features that aren't critical for initial page load
        console.log('Non-critical features initialized');
    }

    /**
     * Record performance metric
     */
    recordMetric(name: string, value: number) {
        this.metrics.set(name, value);

        // Sin console.log en produccion. Esto escupia una linea por metrica en
        // cada carga para cualquiera que abriese las herramientas de
        // desarrollo. Para depurar, `localStorage.setItem('ht:debug','1')`.
        if (localStorage.getItem('ht:debug') === '1') {
            console.log(`${name}: ${value.toFixed(2)}`);
        }

        // Solo se envia si hay consentimiento analitico. `gtag` existe siempre
        // (es la cola que deja el head), asi que comprobar su presencia no
        // decia nada: estos eventos se encolaban igual y se disparaban en
        // cuanto alguien aceptaba las cookies, aunque se hubiesen recogido
        // antes de aceptar. La clave la escribe cookie-banner.ts.
        let consentido = false;
        try {
            consentido = localStorage.getItem('cookieConsent') === 'granted';
        } catch {
            // localStorage bloqueado: sin consentimiento comprobable, no se envia.
        }
        if (consentido && 'gtag' in window) {
            (window as any).gtag('event', 'performance_metric', {
                metric_name: name,
                metric_value: value,
            });
        }
    }

    /**
     * Get performance metrics
     */
    getMetrics(): Map<string, number> {
        return new Map(this.metrics);
    }

    /**
     * Clear cache
     */
    clearCache(): void {
        this.cache.clear();
    }

    /**
     * Get cached data
     */
    getCachedData(key: string): any | null {
        const cached = this.cache.get(key);
        if (!cached) return null;

        if (Date.now() - cached.timestamp > cached.ttl) {
            this.cache.delete(key);
            return null;
        }

        return cached.data;
    }

    /**
     * Cache data
     */
    cacheData(key: string, data: any, ttl: number = 300000): void { // Default 5 minutes
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl
        });
    }
}