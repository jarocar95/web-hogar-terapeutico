/**
 * Función principal minimalista - solo funcionalidades esenciales
 */
document.addEventListener('DOMContentLoaded', () => {
    initScrollEffects();
    initAnimations();
    initCookieBanner();
    initContactForm();
    initBookingCalendar();
});

// MINIMALISTA: Función mobile menu simplificada
function initMobileMenu() {
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const hamburgerIcon = document.getElementById('hamburger-icon');
    const closeIcon = document.getElementById('close-icon');

    if (!menuBtn || !mobileMenu || !hamburgerIcon || !closeIcon) return;

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
            if (!mobileMenu.classList.contains('hidden')) toggleMenu();
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
            mobileCtaBar.classList.remove('hidden'); // Make it visible
            // Force reflow to ensure 'hidden' is removed before transition starts
            mobileCtaBar.offsetHeight; // Trigger reflow
            mobileCtaBar.classList.remove('opacity-0'); // Transition to full opacity
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

/**
 * Injects custom CSS for Litepicker to apply brand colors.
 */
function injectLitepickerStyles() {
    // Remove any existing custom styles to prevent duplication
    const existingStyle = document.getElementById('custom-litepicker-styles');
    if (existingStyle) {
        existingStyle.remove();
    }

    const style = document.createElement('style');
    style.id = 'custom-litepicker-styles';
    style.textContent = `
        /* A more modern, beautiful, and visual theme */
        #calendar-container .litepicker,
        #calendar-container .litepicker * {
            outline: none !important;
            box-shadow: none !important;
            font-family: inherit; /* Inherit the beautiful font from the body */
        }

        /* Header styling */
        #calendar-container .litepicker .month-item-header {
            padding-bottom: 0.5rem;
        }
        #calendar-container .litepicker .month-item-name,
        #calendar-container .litepicker .month-item-year {
            color: #8B5A5A; /* Darker accent for header text */
            font-weight: 600;
        }
        #calendar-container .litepicker .button-previous-month,
        #calendar-container .litepicker .button-next-month {
            background-color: #F6EEEE !important; /* Lighter background for nav buttons */
            border-radius: 9999px !important;
            /* Transitions removed for better mobile performance */
        }
        #calendar-container .litepicker .button-previous-month:hover,
        #calendar-container .litepicker .button-next-month:hover {
            background-color: #E6A6A1 !important; /* Accent color on hover */
            /* Transform removed for better mobile performance */
        }
        #calendar-container .litepicker .button-previous-month svg,
        #calendar-container .litepicker .button-next-month svg {
            fill: #8B5A5A !important; /* Darker icon color */
        }

        /* Weekdays row */
        #calendar-container .litepicker .month-item-weekdays-row {
            color: #9C6666; /* Lighter, less prominent color */
            font-weight: 500;
            margin-top: 0.5rem;
        }

        /* General Day Item */
        #calendar-container .litepicker .container__days .day-item {
            color: #4A3B3B !important;
            background-color: transparent !important;
            border: 1px solid transparent !important;
            border-radius: 0.75rem !important; /* Slightly more rounded */
            /* Transitions removed for better mobile performance */
        }

        /* Today's Date */
        #calendar-container .litepicker .container__days .day-item.is-today {
            color: #8B5A5A !important;
            font-weight: 700 !important;
        }

        /* Available Day */
        #calendar-container .litepicker .container__days .day-item.is-available {
            background-color: #F6EEEE !important;
            color: #4A3B3B !important;
        }

        /* Hover on Available Day */
        #calendar-container .litepicker .container__days .day-item.is-available:hover {
            background-color: #E6A6A1 !important;
            color: white !important;
            /* Transform removed for better mobile performance */
            box-shadow: 0 8px 15px rgba(140, 90, 90, 0.2);
        }

        /* Hover on regular, non-available days */
        #calendar-container .litepicker .container__days .day-item:not(.is-available):not(.is-locked):not(.is-start-date):hover {
            background-color: #f5f5f5 !important; /* A subtle grey */
            /* Transform removed for better mobile performance */
        }

        /* Selected Day */
        #calendar-container .litepicker .container__days .day-item.is-start-date {
            background-image: linear-gradient(to top, #E6A6A1, #eebbbb) !important; /* Subtle gradient */
            color: white !important;
            font-weight: 700 !important;
            /* Transform removed for better mobile performance */
            box-shadow: 0 4px 10px rgba(140, 90, 90, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.4);
        }

        /* Locked Day */
        #calendar-container .litepicker .container__days .day-item.is-locked {
            color: #d1c7c7 !important; /* Lighter text color for locked days */
            background-color: transparent !important;
        }
    `;
    document.body.appendChild(style);
}

/**
 * Inicializa el calendario de reservas de Doctoralia.
 */
function initBookingCalendar() {
    const calendarContainer = document.getElementById('calendar-container');
    const availableTimesContainer = document.getElementById('available-times');

    if (!calendarContainer || !availableTimesContainer) {
        return;
    }

    fetch('/api/horarios.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(horarios => {
            if (!horarios || horarios.length === 0) {
                calendarContainer.innerHTML = `
                    <div class="text-center p-8">
                        <i class="ri-calendar-close-line text-4xl text-primary/30 mb-4"></i>
                        <p class="font-semibold text-primary">Actualmente no hay citas disponibles</p>
                        <p class="text-text/70 mt-2">Por favor, vuelve a consultarlo más tarde o contáctame directamente.</p>
                    </div>
                `;
                availableTimesContainer.innerHTML = '';
                return;
            }

            const availableDates = horarios.map(h => h.fecha);
            const firstAvailableDate = availableDates[0];

            const picker = new Litepicker({
                element: calendarContainer,
                inlineMode: true,
                singleMode: true,
                lang: 'es-ES',
                minDate: new Date(),
                startDate: firstAvailableDate,
                lockDaysFilter: (date) => {
                    const d = date.format('YYYY-MM-DD');
                    const schedule = horarios.find(h => h.fecha === d);
                    return !schedule || schedule.horas.length === 0;
                },
                setup: (picker) => {
                    const highlightAvailableDates = () => {
                        const cal = calendarContainer;
                        if (!cal) return;

                        availableDates.forEach(d => {
                            // FIX: Replace moment.js with native Date
                            const dayEl = cal.querySelector(`[data-time="${new Date(d).getTime()}"]`);
                            if (dayEl) {
                                dayEl.classList.add('is-available');
                            }
                        });
                    };

                    picker.on('show', () => {
                        highlightAvailableDates();
                    });

                    picker.on('monthchange', () => {
                        setTimeout(highlightAvailableDates, 100);
                    });

                    picker.on('selected', (date) => {
                        const selectedDate = date.format('YYYY-MM-DD');
                        const scheduleForDate = horarios.find(h => h.fecha === selectedDate);

                        if (scheduleForDate && scheduleForDate.horas.length > 0) {
                            displayAvailableTimes(scheduleForDate);
                        } else {
                            availableTimesContainer.innerHTML = `
                                <div class="flex items-center justify-center h-full text-center">
                                    <div class="space-y-3">
                                        <i class="ri-calendar-close-line text-4xl text-primary/30"></i>
                                        <p class="text-text/60">No hay horarios disponibles para este día.</p>
                                        <p class="text-text/50 text-sm">Por favor, selecciona otra fecha.</p>
                                    </div>
                                </div>
                            `;
                        }
                    });
                },
            });

            injectLitepickerStyles();

            const firstSchedule = horarios.find(h => h.fecha === firstAvailableDate);
            if (firstSchedule) {
                displayAvailableTimes(firstSchedule);
            }

        })
        .catch(error => {
            console.error('Error al cargar horarios.json:', error);
            availableTimesContainer.innerHTML = '<p class="text-red-600 font-semibold p-4">Lo siento, ha ocurrido un problema al cargar la disponibilidad. Por favor, inténtalo de nuevo más tarde.</p>';
        });

    function displayAvailableTimes(schedule) {
        const { fecha, horas } = schedule;
        const fechaObj = new Date(fecha + 'T00:00:00');
        const fechaFormateada = fechaObj.toLocaleDateString('es-ES', {
            weekday: 'long', day: 'numeric', month: 'long'
        });

        let html = '';
        html += '<div class="space-y-4" role="region" aria-label="Horarios disponibles">';
        html += '<div class="flex items-center gap-2 text-text/80">';
        html += '<i class="ri-calendar-check-line text-accent text-xl"></i>';
        html += `<span class="font-medium">Horas disponibles para el ${fechaFormateada}:</span>`;
        html += '</div>';

        html += '<div class="grid grid-cols-2 sm:grid-cols-3 gap-3">';

        horas.forEach(hora => {
            const mensaje = `Hola Angie, te escribo desde la web de Hogar Terapéutico. Me gustaría reservar una cita para el día ${fecha} a las ${hora}.`;
            const whatsappLink = `https://wa.me/34621348616?text=${encodeURIComponent(mensaje)}`;
            html += `<a href="${whatsappLink}" target="_blank" rel="noopener noreferrer" class="cta-button bg-secondary text-white text-center py-3 px-4 hover:bg-primary-darker transform hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center gap-2" role="button" aria-label="Reservar cita a las ${hora}">`;
            html += `<i class="ri-whatsapp-line text-lg"></i>`;
            html += `<span>${hora}</span>`;
            html += `</a>`;
        });

        html += '</div>';

        // Add confirmation message
        html += '<div class="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">';
        html += '<div class="flex items-center gap-3 mb-2">';
        html += '<i class="ri-information-line text-green-600 text-xl"></i>';
        html += '<h4 class="font-semibold text-green-800">¡Solicitud recibida!</h4>';
        html += '</div>';
        html += '<p class="text-sm text-green-700">Al hacer clic en tu horario preferido, serás redirigido a WhatsApp para confirmar tu cita. Te espero al otro lado.</p>';
        html += '</div>';

        html += '</div>';
        availableTimesContainer.innerHTML = html;

        // Update remaining slots counter
        updateRemainingSlots();
    }

    function updateRemainingSlots() {
        const remainingSlotsElement = document.getElementById('remaining-slots');
        if (remainingSlotsElement) {
            const currentSlots = parseInt(remainingSlotsElement.textContent);
            if (currentSlots > 0) {
                remainingSlotsElement.textContent = Math.max(0, currentSlots - 1);
            }
        }
    }

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}