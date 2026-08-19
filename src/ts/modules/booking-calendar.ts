/**
 * Booking calendar functionality
 * Handles Doctoralia integration and Litepicker calendar
 */
import type { Schedule } from '../types';
import { Logger } from '../utils/logger.js';

// Devuelve la fecha de hoy como "YYYY-MM-DD" en hora local.
// Importante: no usar toISOString(), que convierte a UTC y en Madrid
// (UTC+1/+2) devuelve el dia anterior durante las primeras horas.
function hoyLocalISO(): string {
    const d = new Date();
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mes}-${dia}`;
}

// Convierte "YYYY-MM-DD" a un Date en medianoche LOCAL.
// new Date("2026-09-26") lo interpreta como medianoche UTC, mientras que el
// atributo data-time que genera Litepicker es medianoche local: los dos
// timestamps nunca coincidian y el resaltado de dias disponibles no llegaba
// a aplicarse nunca.
function fechaLocal(iso: string): Date {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d);
}

// Custom CSS injection for Litepicker
function injectLitepickerStyles(): void {
    // Intencionadamente vacia.
    //
    // Esto inyectaba en <body> una hoja de ~90 lineas con !important en casi
    // cada declaracion. Al llegar despues de output.css ganaba SIEMPRE, asi que
    // el tema del calendario estaba realmente definido aqui, invisible desde
    // el CSS del proyecto, y contradecia lo que decia input.css.
    //
    // El dano concreto: el dia seleccionado se pintaba con
    // `background-image: linear-gradient(to top, #E6A6A1, #eebbbb)` y
    // `color: white`, es decir texto blanco sobre rosa claro, alrededor de
    // 2,1:1. El numero del dia que acabas de elegir era el menos legible del
    // calendario.
    //
    // El tema vive ahora en src/input.css, en un unico bloque comentado.
}


// Display available times for selected date
function displayAvailableTimes(schedule: Schedule, availableTimesContainer: HTMLElement): void {
    const { fecha, horas } = schedule;
    const fechaObj = new Date(fecha + 'T00:00:00');
    const fechaFormateada = fechaObj.toLocaleDateString('es-ES', {
        weekday: 'long', day: 'numeric', month: 'long'
    });

    // El subtitulo estatico decia "Selecciona una fecha para ver los horarios"
    // mientras el panel ya mostraba los horarios de un dia concreto. Ahora
    // refleja el estado real.
    const subtitle = document.getElementById('available-times-subtitle');
    if (subtitle) {
        const n = horas.length;
        subtitle.textContent = `${n} ${n === 1 ? 'hueco' : 'huecos'} · ${fechaFormateada}`;
    }

    let html = '<div class="grid grid-cols-3 gap-2">';

    horas.forEach((hora) => {
        const mensaje = `Hola Angie, te escribo desde la web de Hogar Terapéutico. Me gustaría reservar una cita para el día ${fecha} a las ${hora}.`;
        const whatsappLink = `https://wa.me/34621348616?text=${encodeURIComponent(mensaje)}`;
        // aria-label explicito: "10:00" a secas no dice a un lector de pantalla
        // ni el dia ni que el enlace abre WhatsApp fuera del sitio.
        const etiqueta = `Reservar el ${fechaFormateada} a las ${hora} — se abre WhatsApp`;
        html += `<a href="${whatsappLink}" target="_blank" rel="noopener noreferrer" aria-label="${etiqueta}" class="flex items-center justify-center min-h-[44px] rounded-xl bg-sage-50 border border-sage-200 text-sage-700 font-semibold text-[14.5px] no-underline transition-colors hover:bg-sage-200">${hora}</a>`;
    });

    html += '</div>';
    // Aviso de que la reserva aun no esta confirmada. Antes se pulsaba una hora,
    // se abria WhatsApp en otra pestania y nada decia que la cita no estuviera
    // hecha: se podia creer que ya tenias sesion cuando solo habias enviado un
    // mensaje.
    html += '<p class="mt-4 text-[13px] text-ink-mute leading-snug">Al elegir una hora se abre WhatsApp con el mensaje preparado. La cita queda confirmada cuando te respondo.</p>';
    availableTimesContainer.innerHTML = html;
}

export function initBookingCalendar(): void {
    const calendarContainer = document.getElementById('calendar-container') as HTMLElement | null;
    const availableTimesContainer = document.getElementById('available-times') as HTMLElement | null;

    if (!calendarContainer || !availableTimesContainer) {
        return;
    }

    // Show calendar skeleton while loading
    const skeletonElement = calendarContainer.querySelector('.calendar-skeleton') as HTMLElement | null;
    if (skeletonElement) {
        skeletonElement.style.display = 'block';
    }

    availableTimesContainer.innerHTML = `
        <div class="animate-pulse">
            <div class="bg-gray-200 h-6 rounded w-3/4 mb-4"></div>
            <div class="grid grid-cols-3 gap-2">
                ${Array.from({ length: 6 }, () => '<div class="bg-gray-200 h-10 rounded"></div>').join('')}
            </div>
        </div>
    `;

    fetch('/api/horarios.json')
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json() as Promise<Schedule[]>;
        })
        .then((todosLosHorarios) => {
            // Solo dias de hoy en adelante y con horas libres. Sin esto, un
            // horarios.json desactualizado abre el calendario en una fecha
            // pasada y muestra huecos que ya no existen.
            const hoy = hoyLocalISO();
            const horarios = (todosLosHorarios || [])
                .filter((h) => h && h.fecha >= hoy && Array.isArray(h.horas) && h.horas.length > 0)
                .sort((a, b) => a.fecha.localeCompare(b.fecha));

            if (horarios.length === 0) {
                calendarContainer.innerHTML = `
                    <div class="bg-light border border-accent/40 rounded-xl p-6 text-center">
                        <h3 class="font-semibold text-primary mb-2">Agenda en actualización</h3>
                        <p class="text-text/80 mb-4">Ahora mismo no hay huecos publicados. Escríbeme y buscamos juntos el que mejor te venga.</p>
                        <a href="https://wa.me/34621348616?text=Hola%20Angie%2C%20me%20gustar%C3%ADa%20reservar%20una%20primera%20sesi%C3%B3n."
                           target="_blank" rel="noopener noreferrer"
                           class="cta-button bg-primary text-white text-sm">Escribir por WhatsApp</a>
                    </div>`;
                availableTimesContainer.innerHTML = '';
                Logger.getInstance().event('calendar_empty', 'booking_calendar', 'sin_fechas_futuras');
                return;
            }

            const availableDates = horarios.map((h) => h.fecha);
            const firstAvailableDate = availableDates[0];

            // Hide skeleton once calendar is loaded
            const skeletonElement = calendarContainer.querySelector('.calendar-skeleton') as HTMLElement | null;
            if (skeletonElement) {
                skeletonElement.style.display = 'none';
            }

            // Litepicker renders its prev/next month buttons as bare SVG
            // icons with no text, so screen readers announce them as
            // unlabeled "button". Label them ourselves.
            const labelNavigationButtons = (): void => {
                const cal = calendarContainer;
                if (!cal) return;

                const prevButton = cal.querySelector('.button-previous-month');
                const nextButton = cal.querySelector('.button-next-month');
                if (prevButton && !prevButton.hasAttribute('aria-label')) {
                    prevButton.setAttribute('aria-label', 'Mes anterior');
                }
                if (nextButton && !nextButton.hasAttribute('aria-label')) {
                    nextButton.setAttribute('aria-label', 'Mes siguiente');
                }
            };

            // @ts-ignore - LitePicker is loaded from CDN
            const picker = new Litepicker({
                element: calendarContainer,
                inlineMode: true,
                singleMode: true,
                lang: 'es-ES',
                minDate: new Date(),
                startDate: fechaLocal(firstAvailableDate),
                lockDaysFilter: (date: any) => {
                    const d = date.format('YYYY-MM-DD');
                    const schedule = horarios.find((h) => h.fecha === d);
                    return !schedule || schedule.horas.length === 0;
                },
                setup: (picker: any) => {
                    const highlightAvailableDates = (): void => {
                        const cal = calendarContainer;
                        if (!cal) return;

                        availableDates.forEach((d) => {
                            const dayEl = cal.querySelector(`[data-time="${fechaLocal(d).getTime()}"]`);
                            if (dayEl) {
                                dayEl.classList.add('is-available');
                            }
                        });
                    };

                    // El texto de la seccion dice "los dias con hueco aparecen
                    // resaltados" y no habia NI UN elemento con is-available:
                    // en inlineMode el evento 'show' se dispara antes de que
                    // Litepicker pinte los dias, asi que la clase se aplicaba
                    // sobre un grid vacio y no volvia a intentarse.
                    //
                    // Un MutationObserver sobre el contenedor cubre todos los
                    // repintados (alta inicial, cambio de mes, seleccion) sin
                    // depender de que evento concreto emita cada version de la
                    // libreria.
                    const observer = new MutationObserver(() => {
                        highlightAvailableDates();
                        labelNavigationButtons();
                    });
                    observer.observe(calendarContainer, { childList: true, subtree: true });

                    picker.on('show', () => {
                        highlightAvailableDates();
                        labelNavigationButtons();
                    });

                    picker.on('monthchange', () => {
                        setTimeout(highlightAvailableDates, 100);
                        labelNavigationButtons();
                    });

                    picker.on('selected', (date: any) => {
                        const selectedDate = date.format('YYYY-MM-DD');
                        const scheduleForDate = horarios.find((h) => h.fecha === selectedDate);

                        if (scheduleForDate && scheduleForDate.horas.length > 0) {
                            displayAvailableTimes(scheduleForDate, availableTimesContainer);
                        } else {
                            availableTimesContainer.innerHTML = '<p class="text-text/70 p-4">No hay horarios disponibles para este día.</p>';
                        }
                    });
                },
            });

            injectLitepickerStyles();
            labelNavigationButtons();

            const firstSchedule = horarios.find((h) => h.fecha === firstAvailableDate);
            if (firstSchedule) {
                displayAvailableTimes(firstSchedule, availableTimesContainer);
            }

        })
        .catch((error) => {
            console.error('Error al cargar horarios.json:', error);
            availableTimesContainer.innerHTML = '<p class="text-red-600 font-semibold p-4">Lo siento, ha ocurrido un problema al cargar la disponibilidad. Por favor, inténtalo de nuevo más tarde.</p>';
        });
}