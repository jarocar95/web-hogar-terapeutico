/**
 * Scroll animations and reveal effects module
 * Implements intersection observer for smooth scroll animations
 */
export class ScrollAnimations {
    constructor() {
        this.init();
    }
    init() {
        this.setupIntersectionObserver();
        this.setupParallaxEffects();
        this.setupCounterAnimations();
        this.setupStaggeredAnimations();
    }
    /**
     * Setup intersection observer for scroll reveal animations
     */
    setupIntersectionObserver() {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    // Add animation classes with staggered delay
                    setTimeout(() => {
                        entry.target.classList.add('animate-reveal');
                        const target = entry.target;
                        target.style.opacity = '1';
                        target.style.transform = 'translateY(0)';
                    }, index * 100); // Staggered animation
                }
            });
        }, observerOptions);
        // Observe all sections and cards
        const animatedElements = document.querySelectorAll('section, .card, .service-card, .blog-card, .feature-card');
        animatedElements.forEach(el => {
            // Set initial state
            const htmlEl = el;
            htmlEl.style.opacity = '0';
            htmlEl.style.transform = 'translateY(30px)';
            htmlEl.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            observer.observe(el);
        });
        // Special handling for hero section
        const heroContent = document.querySelector('#hero .container');
        if (heroContent) {
            heroContent.classList.add('animate-fade-in-up');
        }
    }
    /**
     * Setup parallax effects for hero and other sections
     */
    setupParallaxEffects() {
        const handleScroll = () => {
            const scrolled = window.pageYOffset;
            // Parallax hero background
            const hero = document.getElementById('hero');
            if (hero) {
                const heroBackground = hero.querySelector('.hero-background-image');
                if (heroBackground) {
                    const speed = 0.5;
                    heroBackground.style.transform = `translateY(${scrolled * speed}px)`;
                }
            }
            // Parallax for other sections with parallax class
            const parallaxElements = document.querySelectorAll('.parallax-element');
            parallaxElements.forEach(element => {
                const rect = element.getBoundingClientRect();
                const speed = element.getAttribute('data-speed') || '0.3';
                const yPos = -(rect.top * parseFloat(speed));
                element.style.transform = `translateY(${yPos}px)`;
            });
        };
        window.addEventListener('scroll', this.throttle(handleScroll, 16));
    }
    /**
     * Setup counter animations for statistics
     */
    setupCounterAnimations() {
        const counters = document.querySelectorAll('.counter');
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    const target = parseFloat(counter.getAttribute('data-target') || '0');
                    const duration = parseInt(counter.getAttribute('data-duration') || '2000');
                    this.animateCounter(counter, target, duration);
                    counterObserver.unobserve(counter);
                }
            });
        }, { threshold: 0.5 });
        counters.forEach(counter => {
            counterObserver.observe(counter);
        });
    }
    /**
     * Animate counter from 0 to target value
     */
    animateCounter(element, target, duration) {
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;
        const updateCounter = () => {
            current += increment;
            if (current < target) {
                element.textContent = Math.floor(current).toString();
                requestAnimationFrame(updateCounter);
            }
            else {
                element.textContent = target.toString();
            }
        };
        updateCounter();
    }
    /**
     * Setup staggered animations for multiple elements
     */
    setupStaggeredAnimations() {
        const staggeredGroups = document.querySelectorAll('.stagger-group');
        staggeredGroups.forEach(group => {
            const items = group.querySelectorAll('.stagger-item');
            items.forEach((item, index) => {
                const htmlItem = item;
                htmlItem.style.transitionDelay = `${index * 100}ms`;
                htmlItem.style.opacity = '0';
                htmlItem.style.transform = 'translateY(20px)';
            });
        });
        // Trigger animations when group comes into view
        const groupObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const items = entry.target.querySelectorAll('.stagger-item');
                    items.forEach(item => {
                        setTimeout(() => {
                            item.classList.add('stagger-reveal');
                            item.style.opacity = '1';
                            item.style.transform = 'translateY(0)';
                        }, parseInt(item.style.transitionDelay));
                    });
                    groupObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        staggeredGroups.forEach(group => {
            groupObserver.observe(group);
        });
    }
    /**
     * Utility: Throttle function for scroll events
     */
    throttle(func, limit) {
        let inThrottle;
        return function (...args) {
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    /**
     * Add reveal animation to elements
     */
    static addRevealAnimation(element, animationType = 'fade') {
        element.style.opacity = '0';
        element.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        switch (animationType) {
            case 'slide':
                element.style.transform = 'translateY(30px)';
                break;
            case 'scale':
                element.style.transform = 'scale(0.9)';
                break;
            default:
                element.style.transform = 'translateY(0)';
        }
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-reveal');
                    const target = entry.target;
                    target.style.opacity = '1';
                    target.style.transform = 'translateY(0) scale(1)';
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        observer.observe(element);
    }
}
