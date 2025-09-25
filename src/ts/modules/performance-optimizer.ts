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
     * Load polyfills based on browser support
     */
    loadPolyfillsIfNeeded() {
        const needsIntersectionObserver = !('IntersectionObserver' in window);
        const needsFetch = !('fetch' in window);
        const needsPromise = !('Promise' in window);

        if (needsIntersectionObserver || needsFetch || needsPromise) {
            // Load polyfills from CDN
            const polyfillScript = document.createElement('script');
            polyfillScript.src = 'https://polyfill.io/v3/polyfill.min.js?features=IntersectionObserver,fetch,Promise';
            polyfillScript.async = true;
            document.head.appendChild(polyfillScript);
        }
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
        // This would work with service workers in a production environment
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch(() => {
                // Service worker registration failed
            });
        }
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
    monitorWebVitals() {
        if ('PerformanceObserver' in window) {
            // Largest Contentful Paint
            try {
                const lcpObserver = new PerformanceObserver((entryList) => {
                    const entries = entryList.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    this.recordMetric('LCP', lastEntry.startTime);
                });
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
            } catch (e) {
                // LCP not supported
            }

            // First Input Delay
            try {
                const fidObserver = new PerformanceObserver((entryList) => {
                    const entries = entryList.getEntries();
                    entries.forEach(entry => {
                        if ('processingStart' in entry) {
                            const fid = (entry as any).processingStart - entry.startTime;
                            this.recordMetric('FID', fid);
                        }
                    });
                });
                fidObserver.observe({ entryTypes: ['first-input'] });
            } catch (e) {
                // FID not supported
            }

            // Cumulative Layout Shift
            try {
                const clsObserver = new PerformanceObserver((entryList) => {
                    let clsValue = 0;
                    entryList.getEntries().forEach(entry => {
                        if (entry && 'value' in entry) {
                            clsValue += (entry as any).value;
                        }
                    });
                    this.recordMetric('CLS', clsValue);
                });
                clsObserver.observe({ entryTypes: ['layout-shift'] });
            } catch (e) {
                // CLS not supported
            }
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
    setupCriticalResourceLoading() {
        // Identify and prioritize critical resources
        const criticalResources = [
            '/dist/output.css',
            '/js/main.js'
        ];

        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource;
            link.as = resource.endsWith('.css') ? 'style' : 'script';
            document.head.appendChild(link);
        });
    }

    /**
     * Setup preloading of likely resources
     */
    setupPreloading() {
        // Preload pages that user is likely to visit
        const likelyPages = ['/blog', '/sobre-mi', '/contacto'];

        // Use Intersection Observer to detect when user might navigate
        const navLinks = document.querySelectorAll('nav a');
        navLinks.forEach(link => {
            link.addEventListener('mouseenter', () => {
                const href = link.getAttribute('href');
                if (href && likelyPages.includes(href)) {
                    this.preloadPage(href);
                }
            });
        });
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
        console.log(`${name}: ${value.toFixed(2)}`);

        // Send to analytics service if available
        if ('gtag' in window) {
            (window as any).gtag('event', 'performance_metric', {
                metric_name: name,
                metric_value: value
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