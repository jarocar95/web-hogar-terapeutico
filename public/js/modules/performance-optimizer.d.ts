/**
 * Performance optimization module
 * Implements various performance improvements and monitoring
 */
export declare class PerformanceOptimizer {
    private metrics;
    private cache;
    constructor();
    init(): void;
    /**
     * Setup resource hints for better performance
     */
    setupResourceHints(): void;
    /**
     * Setup image optimization with lazy loading and WebP support
     */
    setupImageOptimization(): void;
    /**
     * Setup lazy loading for images
     */
    setupLazyLoading(): void;
    /**
     * Setup WebP format detection and fallback
     */
    setupWebPFallback(): void;
    /**
     * Setup image compression simulation
     */
    setupImageCompression(): void;
    /**
     * Load image with performance optimization
     */
    loadImage(img: HTMLImageElement): void;
    /**
     * Setup code splitting and dynamic imports
     */
    setupCodeSplitting(): void;
    /**
     * Lazy load non-critical JavaScript
     */
    lazyLoadNonCriticalJS(): void;
    /**
     * Load polyfills based on browser support
     */
    loadPolyfillsIfNeeded(): void;
    /**
     * Setup caching strategies
     */
    setupCaching(): void;
    /**
     * Setup API response caching
     */
    setupAPICaching(): void;
    /**
     * Setup image caching
     */
    setupImageCaching(): void;
    /**
     * Setup performance monitoring
     */
    setupPerformanceMonitoring(): void;
    /**
     * Monitor Core Web Vitals
     */
    monitorWebVitals(): void;
    /**
     * Monitor resource timing
     */
    monitorResourceTiming(): void;
    /**
     * Setup performance budget monitoring
     */
    setupPerformanceBudget(): void;
    /**
     * Check if performance budget is exceeded
     */
    checkPerformanceBudget(budget: any): void;
    /**
     * Setup critical resource loading
     */
    setupCriticalResourceLoading(): void;
    /**
     * Setup preloading of likely resources
     */
    setupPreloading(): void;
    /**
     * Preload a page
     */
    preloadPage(url: string): void;
    /**
     * Setup idle callbacks for non-critical tasks
     */
    setupIdleCallbacks(): void;
    /**
     * Load analytics scripts
     */
    loadAnalytics(): void;
    /**
     * Initialize non-critical features
     */
    initializeNonCriticalFeatures(): void;
    /**
     * Record performance metric
     */
    recordMetric(name: string, value: number): void;
    /**
     * Get performance metrics
     */
    getMetrics(): Map<string, number>;
    /**
     * Clear cache
     */
    clearCache(): void;
    /**
     * Get cached data
     */
    getCachedData(key: string): any | null;
    /**
     * Cache data
     */
    cacheData(key: string, data: any, ttl?: number): void;
}
