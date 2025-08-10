/**
 * Función principal que se ejecuta cuando el contenido del DOM ha sido cargado.
 * Llama a las funciones que inicializan las diferentes funcionalidades de la página.
 */
document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initScrollEffects();
    initAnimations();
    initCookieBanner();
});

/**
 * Inicializa la lógica para el menú de navegación móvil (hamburguesa).
 */
function initMobileMenu() {
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const hamburgerIcon = document.getElementById('hamburger-icon');
    const closeIcon = document.getElementById('close-icon');

    // Si alguno de los elementos del menú no existe, no se ejecuta el resto del código.
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

    // Cierra el menú al hacer clic en cualquiera de sus enlaces.
    document.querySelectorAll('.mobile-link').forEach(link => {
        link.addEventListener('click', () => {
            if (!mobileMenu.classList.contains('hidden')) {
                toggleMenu();
            }
        });
    });
}

/**
 * Inicializa los efectos de scroll, como el encogimiento del header
 * y la aparición del botón "Volver Arriba".
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
        
        // Ajusta la altura del header y el padding del body.
        header.classList.toggle('h-16', isScrolled);
        header.classList.toggle('h-20', !isScrolled);
        header.classList.toggle('shadow-lg', isScrolled);
        body.classList.toggle('pt-16', isScrolled);
        body.classList.toggle('pt-20', !isScrolled);
        
        // Muestra u oculta el botón "Volver Arriba".
        scrollToTopBtn.style.display = window.scrollY > 300 ? 'flex' : 'none';
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    scrollToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/**
 * Inicializa las animaciones de aparición de elementos al hacer scroll.
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

    // Aplica el observador a todos los elementos que deben animarse.
    document.querySelectorAll('.animate-fade-in-up, .card').forEach(el => {
        // El banner de cookies tiene su propia lógica de aparición, así que lo excluimos.
        if (el.id !== 'cookie-consent-banner') {
            observer.observe(el);
        }
    });
}

/**
 * Inicializa la lógica del banner de consentimiento de cookies.
 */
function initCookieBanner() {
    const cookieBanner = document.getElementById('cookie-consent-banner');
    const acceptCookiesBtn = document.getElementById('accept-cookies-btn');

    if (!cookieBanner || !acceptCookiesBtn) {
        return;
    }

    // Si no se han aceptado las cookies previamente, muestra el banner.
    if (!localStorage.getItem('cookiesAccepted')) {
        cookieBanner.classList.remove('hidden');
        cookieBanner.style.animationPlayState = 'running';
    }

    acceptCookiesBtn.addEventListener('click', () => {
        localStorage.setItem('cookiesAccepted', 'true');
        
        // Oculta el banner con una transición suave.
        cookieBanner.style.transition = 'opacity 0.5s ease';
        cookieBanner.style.opacity = '0';
        
        setTimeout(() => {
            cookieBanner.style.display = 'none';
        }, 500);
    });
}
