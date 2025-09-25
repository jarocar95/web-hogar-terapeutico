/**
 * Booking calendar functionality
 * Handles Doctoralia integration and Litepicker calendar
 */
import type { Schedule } from '../types';

// Custom CSS injection for Litepicker
function injectLitepickerStyles(): void {
    const existingStyle = document.getElementById('custom-litepicker-styles') as HTMLStyleElement | null;
    if (existingStyle) {
        existingStyle.remove();
    }

    const style = document.createElement('style');
    style.id = 'custom-litepicker-styles';
    style.textContent = `
        #calendar-container .litepicker,
        #calendar-container .litepicker * {
            outline: none !important;
            box-shadow: none !important;
            font-family: inherit;
        }

        #calendar-container {
            width: 100%;
            max-width: 400px;
            margin: 0 auto;
        }

        #calendar-container .litepicker {
            width: 100% !important;
            box-sizing: border-box !important;
        }

        #calendar-container .litepicker .month-item-header {
            padding-bottom: 0.5rem;
        }
        #calendar-container .litepicker .month-item-name,
        #calendar-container .litepicker .month-item-year {
            color: #8B5A5A;
            font-weight: 600;
        }
        #calendar-container .litepicker .button-previous-month,
        #calendar-container .litepicker .button-next-month {
            background-color: #F6EEEE !important;
            border-radius: 9999px !important;
            transition: all 0.3s ease;
        }
        #calendar-container .litepicker .button-previous-month:hover,
        #calendar-container .litepicker .button-next-month:hover {
            background-color: #E6A6A1 !important;
            transform: scale(1.1);
        }
        #calendar-container .litepicker .button-previous-month svg,
        #calendar-container .litepicker .button-next-month svg {
            fill: #8B5A5A !important;
        }

        #calendar-container .litepicker .month-item-weekdays-row {
            color: #9C6666;
            font-weight: 500;
            margin-top: 0.5rem;
        }

        #calendar-container .litepicker .container__days .day-item {
            color: #4A3B3B !important;
            background-color: transparent !important;
            border: 1px solid transparent !important;
            border-radius: 0.75rem !important;
            transition: all 0.2s ease-in-out;
        }

        #calendar-container .litepicker .container__days .day-item.is-today {
            color: #8B5A5A !important;
            font-weight: 700 !important;
        }

        #calendar-container .litepicker .container__days .day-item.is-available {
            background-color: #F6EEEE !important;
            color: #4A3B3B !important;
        }

        #calendar-container .litepicker .container__days .day-item.is-available:hover {
            background-color: #E6A6A1 !important;
            color: white !important;
            transform: translateY(-2px);
            box-shadow: 0 8px 15px rgba(140, 90, 90, 0.2);
        }

        #calendar-container .litepicker .container__days .day-item:not(.is-available):not(.is-locked):not(.is-start-date):hover {
            background-color: #f5f5f5 !important;
            transform: translateY(-1px);
        }

        #calendar-container .litepicker .container__days .day-item.is-start-date {
            background-image: linear-gradient(to top, #E6A6A1, #eebbbb) !important;
            color: white !important;
            font-weight: 700 !important;
            transform: scale(1.05);
            box-shadow: 0 4px 10px rgba(140, 90, 90, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.4);
        }

        #calendar-container .litepicker .container__days .day-item.is-locked {
            color: #d1c7c7 !important;
            background-color: transparent !important;
        }
    `;
    document.body.appendChild(style);
}

// Display available times for selected date
function displayAvailableTimes(schedule: Schedule, availableTimesContainer: HTMLElement): void {
    const { fecha, horas } = schedule;
    const fechaObj = new Date(fecha + 'T00:00:00');
    const fechaFormateada = fechaObj.toLocaleDateString('es-ES', {
        weekday: 'long', day: 'numeric', month: 'long'
    });

    let html = `<p class="font-semibold mb-4">Horas disponibles para el ${fechaFormateada}:</p>`;
    html += '<div class="grid grid-cols-3 gap-2">';

    horas.forEach((hora) => {
        const mensaje = `Hola Angie, te escribo desde la web de Hogar Terapéutico. Me gustaría reservar una cita para el día ${fecha} a las ${hora}.`;
        const whatsappLink = `https://wa.me/34621348616?text=${encodeURIComponent(mensaje)}`;
        html += `<a href="${whatsappLink}" target="_blank" rel="noopener noreferrer" class="cta-button bg-secondary text-white text-center text-sm py-2 px-1">${hora}</a>`;
    });

    html += '</div>';
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
        .then((horarios) => {
            if (!horarios || horarios.length === 0) {
                calendarContainer.innerHTML = '<p class="font-semibold text-primary p-4">Actualmente no hay citas disponibles. Por favor, vuelve a consultarlo más tarde.</p>';
                availableTimesContainer.innerHTML = '';
                return;
            }

            const availableDates = horarios.map((h) => h.fecha);
            const firstAvailableDate = availableDates[0];

            // Hide skeleton once calendar is loaded
            const skeletonElement = calendarContainer.querySelector('.calendar-skeleton') as HTMLElement | null;
            if (skeletonElement) {
                skeletonElement.style.display = 'none';
            }

            // @ts-ignore - LitePicker is loaded from CDN
            const picker = new Litepicker({
                element: calendarContainer,
                inlineMode: true,
                singleMode: true,
                lang: 'es-ES',
                minDate: new Date(),
                startDate: firstAvailableDate,
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