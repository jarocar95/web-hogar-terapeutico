/**
 * Enhanced UI interactions module
 * Handles microinteractions, scroll effects, and enhanced navigation
 */

export class EnhancedUI {
    constructor() {
        this.init();
    }

    init() {
        this.setupScrollProgress();
        this.setupEnhancedNavigation();
        this.setupMagneticButtons();
        this.setupIntersectionObserver();
        this.setupSmoothScrolling();
    }

    /**
     * Setup scroll progress indicator
     */
    setupScrollProgress() {
        const progressBar = document.getElementById('scroll-progress');
        if (!progressBar) return;

        const updateProgress = () => {
            const scrollTop = window.pageYOffset;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            progressBar.style.width = `${scrollPercent}%`;
        };

        window.addEventListener('scroll', this.throttle(updateProgress, 16));
        updateProgress(); // Initial call
    }

    /**
     * Setup enhanced navigation with scroll effects
     */
    setupEnhancedNavigation() {
        const header = document.getElementById('main-header');
        if (!header) return;

        let lastScroll = 0;
        const scrollThreshold = 100;

        const handleScroll = () => {
            const currentScroll = window.pageYOffset;

            // Add shadow on scroll - header remains fixed
            if (currentScroll > scrollThreshold) {
                header.classList.add('shadow-md');
            } else {
                header.classList.remove('shadow-md');
            }

            lastScroll = currentScroll;
        };

        window.addEventListener('scroll', this.throttle(handleScroll, 16));
    }

    /**
     * Setup magnetic button effect
     */
    setupMagneticButtons() {
        const magneticButtons = document.querySelectorAll('.magnetic-btn');

        magneticButtons.forEach(button => {
            (button as HTMLElement).addEventListener('mousemove', (e: MouseEvent) => {
                const rect = button.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

                const distance = Math.sqrt(x * x + y * y);
                const maxDistance = 100;

                if (distance < maxDistance) {
                    const strength = (maxDistance - distance) / maxDistance;
                    const moveX = (x / maxDistance) * 10 * strength;
                    const moveY = (y / maxDistance) * 10 * strength;

                    (button as HTMLElement).style.transform = `translate(${moveX}px, ${moveY}px) scale(1.05)`;
                }
            });

            (button as HTMLElement).addEventListener('mouseleave', () => {
                (button as HTMLElement).style.transform = 'translate(0, 0) scale(1)';
            });
        });
    }

    /**
     * Setup intersection observer for scroll animations
     */
    setupIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fade-in-up');
                    (entry.target as HTMLElement).style.opacity = '1';

                    // Add staggered animation to cards
                    if (entry.target.classList.contains('card')) {
                        const parent = entry.target.parentElement;
                        if (parent) {
                            const cards = parent.querySelectorAll('.card');
                            cards.forEach((card, index) => {
                                setTimeout(() => {
                                    card.classList.add('animate-slide-in-left');
                                    (card as HTMLElement).style.opacity = '1';
                                }, index * 100);
                            });
                        }
                    }
                }
            });
        }, options);

        // Observe all sections and cards
        document.querySelectorAll('section, .card').forEach(el => {
            (el as HTMLElement).style.opacity = '0';
            observer.observe(el);
        });
    }

    /**
     * Setup smooth scrolling with offset for fixed header
     */
    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();

                const href = anchor.getAttribute('href');
                if (href) {
                    const target = document.querySelector(href);
                    if (target) {
                        const header = document.getElementById('main-header');
                        const headerHeight = header?.offsetHeight || 80;
                        const targetPosition = (target as HTMLElement).offsetTop - headerHeight - 20;

                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });

                        // Close mobile menu if open
                        const mobileMenu = document.getElementById('mobile-menu');
                        if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                            mobileMenu.classList.add('hidden');
                        }
                    }
                }
            });
        });
    }

    /**
     * Utility: Throttle function for scroll events
     */
    throttle(func: Function, limit: number) {
        let inThrottle: boolean;
        return function(this: any, ...args: any[]) {
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Add parallax effect to hero section
     */
    setupParallaxEffect() {
        const hero = document.getElementById('hero');
        if (!hero) return;

        const handleScroll = () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            const heroBackground = hero.querySelector('.hero-background-image');

            if (heroBackground) {
                (heroBackground as HTMLElement).style.transform = `translateY(${rate}px)`;
            }
        };

        window.addEventListener('scroll', this.throttle(handleScroll, 16));
    }
}