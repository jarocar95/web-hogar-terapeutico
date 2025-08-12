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

    const toggleMenu = () => {
        const isExpanded = menuBtn.getAttribute('aria-expanded') === 'true';
        mobileMenu.classList.toggle('hidden');
        hamburgerIcon.classList.toggle('hidden');
        closeIcon.classList.toggle('hidden');
        menuBtn.setAttribute('aria-expanded', String(!isExpanded));
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
    const scrollToTopBtn = document.getElementById("scrollToTopBtn");

    if (!header || !body || !scrollToTopBtn) {
        return;
    }

    const handleScroll = () => {
        const isScrolled = window.scrollY > 50;
        header.classList.toggle('h-16', isScrolled);
        header.classList.toggle('h-20', !isScrolled);
        header.classList.toggle('shadow-lg', isScrolled);
        body.classList.toggle('pt-16', isScrolled);
        body.classList.toggle('pt-20', !isScrolled);
        scrollToTopBtn.style.display = window.scrollY > 300 ? 'flex' : 'none';
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    scrollToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
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
