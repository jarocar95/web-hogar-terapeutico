/**
 * Enhanced UI interactions module
 * Handles microinteractions, scroll effects, and enhanced navigation
 */
export declare class EnhancedUI {
    constructor();
    init(): void;
    /**
     * Setup scroll progress indicator
     */
    setupScrollProgress(): void;
    /**
     * Setup enhanced navigation with scroll effects
     */
    setupEnhancedNavigation(): void;
    /**
     * Setup magnetic button effect
     */
    setupMagneticButtons(): void;
    /**
     * Setup intersection observer for scroll animations
     */
    setupIntersectionObserver(): void;
    /**
     * Setup smooth scrolling with offset for fixed header
     */
    setupSmoothScrolling(): void;
    /**
     * Utility: Throttle function for scroll events
     */
    throttle(func: Function, limit: number): (this: any, ...args: any[]) => void;
    /**
     * Add parallax effect to hero section
     */
    setupParallaxEffect(): void;
}
