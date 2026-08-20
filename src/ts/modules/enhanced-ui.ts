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
        this.setupSmoothScrolling();
        // setupIntersectionObserver queda fuera: ponia opacity:0 a las 11
        // secciones y las 18 tarjetas DESPUES de que el navegador ya las
        // hubiera pintado, y las devolvia al hacer scroll. En un movil lento
        // eso significa que la pagina aparece entera y acto seguido se apaga.
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
    /**
     * NO SE USA. Se dejo de llamar desde init() porque apagaba toda la pagina.
     * Ver el comentario en init(). Se conserva solo como referencia de lo que
     * habia; la reaparicion al hacer scroll se rehara en CSS, respetando
     * prefers-reduced-motion, cuando toque el sistema de diseno.
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
        // Delegacion en document en vez de un listener por enlace: los CTA que
        // el calendario y el formulario inyectan despues no existian cuando
        // esto corria, asi que se quedaban sin interceptar.
        //
        // Se capturan tanto "#x" como "/#x": la cabecera y el pie son
        // compartidos con el blog, donde el enlace necesita el "/" para volver
        // a la home. Antes solo se miraba a[href^="#"], asi que en la home esos
        // enlaces caian al manejo nativo del hash y, si el hash ya coincidia,
        // el segundo clic no hacia nada.
        document.addEventListener('click', (e) => {
            const anchor = (e.target as HTMLElement | null)?.closest?.('a[href^="#"], a[href^="/#"]') as HTMLAnchorElement | null;
            if (!anchor) return;

            const href = anchor.getAttribute('href');
            if (!href) return;

            const hash = href.slice(href.indexOf('#'));
            if (hash.length < 2) return;

            let target: Element | null = null;
            try {
                target = document.querySelector(hash);
            } catch {
                return; // hash no valido como selector
            }
            if (!target) return; // en otra pagina: dejamos que navegue

            e.preventDefault();

            const header = document.getElementById('main-header');
            const headerHeight = header?.offsetHeight || 80;
            const targetPosition = (target as HTMLElement).getBoundingClientRect().top + window.scrollY - headerHeight - 20;

            const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            window.scrollTo({
                top: targetPosition,
                behavior: prefersReducedMotion ? 'auto' : 'smooth'
            });

            // Mantener la URL en sintonia sin provocar un salto del navegador.
            if (history.replaceState) {
                history.replaceState(null, '', hash);
            }

            // Cerrar el menu movil. El id correcto es mobile-menu-fixed; el que
            // habia aqui (mobile-menu) no existe en el DOM.
            const mobileMenu = document.getElementById('mobile-menu-fixed');
            if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
                const menuBtn = document.getElementById('menu-btn-fixed');
                menuBtn?.setAttribute('aria-expanded', 'false');
                document.getElementById('hamburger-icon-fixed')?.classList.remove('hidden');
                document.getElementById('close-icon-fixed')?.classList.add('hidden');
            }
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