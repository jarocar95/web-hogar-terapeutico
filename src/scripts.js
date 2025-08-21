/**
 * Debounce function to limit how often a function is called.
 * @param {function} func - The function to debounce.
 * @param {number} delay - The delay in milliseconds.
 * @returns {function} The debounced function.
 */
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

/**
 * Función principal que se ejecuta cuando el contenido del DOM ha sido cargado.
 * Llama a las funciones que inicializan las diferentes funcionalidades de la página.
 */
document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initScrollEffects();
    initAnimations();
    initCookieBanner();
    initContactForm(); // <-- Aquí se añade la nueva función
});

/**
 * Inicializa la lógica para el menú de navegación móvil (hamburguesa).
 */
function initMobileMenu() {
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const hamburgerIcon = document.getElementById('hamburger-icon');
    const closeIcon = document.getElementById('close-icon');

    if (!menuBtn || !mobileMenu || !hamburgerIcon || !closeIcon) {
        return;
    }

    let focusableElements = [];
    let firstFocusableElement;
    let lastFocusableElement;

    const setFocusableElements = () => {
        focusableElements = Array.from(mobileMenu.querySelectorAll('a[href], button:not([disabled]), textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'));
        firstFocusableElement = focusableElements[0];
        lastFocusableElement = focusableElements[focusableElements.length - 1];
    }

    const handleKeyDown = (e) => {
        let isTabPressed = e.key === 'Tab' || e.keyCode === 9;

        if (!isTabPressed) {
            return;
        }

        if (e.shiftKey) { // shift + tab
            if (document.activeElement === firstFocusableElement) {
                lastFocusableElement.focus();
                e.preventDefault();
            }
        } else { // tab
            if (document.activeElement === lastFocusableElement) {
                firstFocusableElement.focus();
                e.preventDefault();
            }
        }
    }

    const toggleMenu = () => {
        const isExpanded = menuBtn.getAttribute('aria-expanded') === 'true';
        mobileMenu.classList.toggle('hidden');
        hamburgerIcon.classList.toggle('hidden');
        closeIcon.classList.toggle('hidden');
        menuBtn.setAttribute('aria-expanded', String(!isExpanded));

        if (mobileMenu.classList.contains('hidden')) {
            document.removeEventListener('keydown', handleKeyDown);
            menuBtn.focus();
        }
    };

    menuBtn.addEventListener('click', toggleMenu);

    document.querySelectorAll('.mobile-link').forEach(link => {
        link.addEventListener('click', () => {
            if (!mobileMenu.classList.contains('hidden')) {
                toggleMenu();
            }
        });
    });
}

/**
 * Inicializa los efectos de scroll.
 */
function initScrollEffects() {
    const header = document.getElementById('main-header');
    const body = document.body;
    // const scrollToTopBtn = document.getElementById("scrollToTopBtn"); // This button was removed

    // New: Mobile CTA Bar
    const mobileCtaBar = document.getElementById('mobile-cta-bar');
    let lastScrollY = window.scrollY; // Track last scroll position, now updated inside debounce

    // if (!header || !body || !scrollToTopBtn) { // Removed scrollToTopBtn check
    if (!header || !body || !mobileCtaBar) { // Added mobileCtaBar check
        return;
    }

    const debouncedCtaBarLogic = debounce((currentScrollY) => {
        const newScrollThreshold = 150; // Slightly increased threshold

        if (currentScrollY > lastScrollY && currentScrollY > newScrollThreshold) {
            // Scrolling down and past threshold, show bar
            mobileCtaBar.classList.remove('hidden'); // Remove hidden first
            mobileCtaBar.classList.remove('opacity-0'); // Then remove opacity
        } else if (currentScrollY < 50) { // Disappear only when near the very top
            // Scrolling up or near top, hide bar
            mobileCtaBar.classList.add('opacity-0'); // Add opacity first
            setTimeout(() => { // Then add hidden after transition
                mobileCtaBar.classList.add('hidden');
            }, 500); // Match transition duration
        }
        lastScrollY = currentScrollY; // IMPORTANT: Update lastScrollY inside the debounced function
    }, 100); // Debounce delay of 100ms

    window.addEventListener('scroll', () => {
        debouncedCtaBarLogic(window.scrollY);
        // The header/body class toggling can remain outside debounce if it needs to be more responsive
        const isScrolled = window.scrollY > 50;
        header.classList.toggle('h-16', isScrolled);
        header.classList.toggle('h-20', !isScrolled);
        header.classList.toggle('shadow-lg', isScrolled);
        body.classList.toggle('pt-16', isScrolled);
        body.classList.toggle('pt-20', !isScrolled);
    }, { passive: true });
}

/**
 * Inicializa las animaciones de aparición de elementos.
 */
function initAnimations() {
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.animate-fade-in-up, .card').forEach(el => {
        if (el.id !== 'cookie-consent-banner') {
            observer.observe(el);
        }
    });
}

/**
 * Inicializa la lógica del banner de cookies.
 */
function initCookieBanner() {
    const cookieBanner = document.getElementById('cookie-consent-banner');
    const acceptCookiesBtn = document.getElementById('accept-cookies-btn');

    if (!cookieBanner || !acceptCookiesBtn) {
        return;
    }

    // Función para otorgar el consentimiento a Google Analytics
    const grantConsent = () => {
        // Comprueba que la función gtag exista para evitar errores
        if (typeof gtag === 'function') {
            gtag('consent', 'update', {
                'analytics_storage': 'granted'
            });
            console.log('Consentimiento de Analytics otorgado.');
        }
    };

    // Comprueba si las cookies ya fueron aceptadas en una visita anterior
    if (localStorage.getItem('cookiesAccepted') === 'true') {
        grantConsent(); // Si es así, activa Analytics directamente
    } else {
        // Si no, muestra el banner para pedir consentimiento
        cookieBanner.classList.remove('hidden');
        cookieBanner.style.animationPlayState = 'running';
    }

    // Añade el evento al botón de aceptar
    acceptCookiesBtn.addEventListener('click', () => {
        localStorage.setItem('cookiesAccepted', 'true');
        grantConsent(); // Otorga el consentimiento al hacer clic

        // Oculta el banner con una transición suave
        cookieBanner.style.transition = 'opacity 0.5s ease';
        cookieBanner.style.opacity = '0';
        setTimeout(() => {
            cookieBanner.style.display = 'none';
        }, 500);
    });
}


/**
 * Inicializa la lógica del formulario de contacto para enviarlo sin recargar la página.
 */
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('form-status');

    if (!contactForm || !formStatus) {
        return;
    }

    contactForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const form = event.target;
        const data = new FormData(form);
        const submitButton = form.querySelector('button[type="submit"]');

        formStatus.innerHTML = '<p class="text-center text-gray-500">Enviando...</p>';
        submitButton.disabled = true;

        try {
            const response = await fetch(form.action, {
                method: form.method,
                body: data,
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                formStatus.innerHTML = '<p class="p-4 rounded-lg bg-green-100 text-green-800 text-center">¡Gracias por tu mensaje! Te responderé lo antes posible.</p>';
                form.reset();
            } else {
                throw new Error('Error en el envío del formulario');
            }
        } catch (error) {
            formStatus.innerHTML = '<p class="p-4 rounded-lg bg-red-100 text-red-800 text-center">Oops! Hubo un problema. Por favor, inténtalo de nuevo o contáctame directamente.</p>';
        } finally {
            submitButton.disabled = false;
            setTimeout(() => {
                formStatus.innerHTML = '';
            }, 6000); // Limpia el mensaje después de 6 segundos
        }
    });
}