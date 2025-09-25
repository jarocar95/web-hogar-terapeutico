/**
 * Scroll animations and reveal effects module
 * Implements intersection observer for smooth scroll animations
 */
export declare class ScrollAnimations {
    constructor();
    init(): void;
    /**
     * Setup intersection observer for scroll reveal animations
     */
    setupIntersectionObserver(): void;
    /**
     * Setup parallax effects for hero and other sections
     */
    setupParallaxEffects(): void;
    /**
     * Setup counter animations for statistics
     */
    setupCounterAnimations(): void;
    /**
     * Animate counter from 0 to target value
     */
    animateCounter(element: HTMLElement, target: number, duration: number): void;
    /**
     * Setup staggered animations for multiple elements
     */
    setupStaggeredAnimations(): void;
    /**
     * Utility: Throttle function for scroll events
     */
    throttle(func: Function, limit: number): (this: any, ...args: any[]) => void;
    /**
     * Add reveal animation to elements
     */
    static addRevealAnimation(element: HTMLElement, animationType?: 'fade' | 'slide' | 'scale'): void;
}
