/**
 * Enhanced booking calendar functionality
 * Optimized for mobile performance and stability
 * Handles Doctoralia integration and Litepicker calendar
 */

// Custom CSS injection for Litepicker
function injectLitepickerStyles() {
    const existingStyle = document.getElementById('custom-litepicker-styles');
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
            /* Transitions removed for better mobile performance */
        }
        #calendar-container .litepicker .button-previous-month:hover,
        #calendar-container .litepicker .button-next-month:hover {
            background-color: #E6A6A1 !important;
            /* Transform removed for better mobile performance */
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
            /* Transitions removed for better mobile performance */
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
            /* Transform removed for better mobile performance */
            box-shadow: 0 8px 15px rgba(140, 90, 90, 0.2);
        }

        #calendar-container .litepicker .container__days .day-item:not(.is-available):not(.is-locked):not(.is-start-date):hover {
            background-color: #f5f5f5 !important;
            /* Transform removed for better mobile performance */
        }

        #calendar-container .litepicker .container__days .day-item.is-start-date {
            background-image: linear-gradient(to top, #E6A6A1, #eebbbb) !important;
            color: white !important;
            font-weight: 700 !important;
            /* Transform removed for better mobile performance */
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
function displayAvailableTimes(schedule, availableTimesContainer) {
    const { fecha, horas } = schedule;
    const fechaObj = new Date(fecha + 'T00:00:00');
    const fechaFormateada = fechaObj.toLocaleDateString('es-ES', {
        weekday: 'long', day: 'numeric', month: 'long'
    });

    let html = `<p class="font-semibold mb-4">Horas disponibles para el ${fechaFormateada}:</p>`;
    html += '<div class="grid grid-cols-3 gap-2">';

    horas.forEach(hora => {
        const mensaje = `Hola Angie, te escribo desde la web de Hogar Terapéutico. Me gustaría reservar una cita para el día ${fecha} a las ${hora}.`;
        const whatsappLink = `https://wa.me/34621348616?text=${encodeURIComponent(mensaje)}`;
        html += `<a href="${whatsappLink}" target="_blank" rel="noopener noreferrer" class="cta-button bg-secondary text-white text-center text-sm py-2 px-1">${hora}</a>`;
    });

    html += '</div>';
    availableTimesContainer.innerHTML = html;
}

export function initBookingCalendar() {
    const calendarContainer = document.getElementById('calendar-container');
    const availableTimesContainer = document.getElementById('available-times');

    if (!calendarContainer || !availableTimesContainer) {
        return;
    }

    // Hide loading message immediately for better UX
    availableTimesContainer.style.opacity = '0';

    // Performance optimization: use requestAnimationFrame for DOM updates
    const updateAvailableTimes = (content) => {
        requestAnimationFrame(() => {
            availableTimesContainer.innerHTML = content;
            availableTimesContainer.style.opacity = '1';
        });
    };

    fetch('/api/horarios.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(horarios => {
            if (!horarios || horarios.length === 0) {
                calendarContainer.innerHTML = '<p class="font-semibold text-primary p-4">Actualmente no hay citas disponibles. Por favor, vuelve a consultarlo más tarde.</p>';
                updateAvailableTimes('');
                return;
            }

            // Filter out past dates and dates with no available hours
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const validHorarios = horarios.filter(h => {
                const scheduleDate = new Date(h.fecha + 'T00:00:00');
                return scheduleDate >= today && h.horas.length > 0;
            });

            if (validHorarios.length === 0) {
                calendarContainer.innerHTML = '<p class="font-semibold text-primary p-4">Actualmente no hay citas disponibles. Por favor, vuelve a consultarlo más tarde.</p>';
                updateAvailableTimes('');
                return;
            }

            const availableDates = validHorarios.map(h => h.fecha);
            const firstAvailableDate = availableDates[0];

            const picker = new Litepicker({
                element: calendarContainer,
                inlineMode: true,
                singleMode: true,
                lang: 'es-ES',
                minDate: today,
                startDate: firstAvailableDate,
                lockDaysFilter: (date) => {
                    const d = date.format('YYYY-MM-DD');
                    const schedule = validHorarios.find(h => h.fecha === d);
                    return !schedule || schedule.horas.length === 0;
                },
                setup: (picker) => {
                    const highlightAvailableDates = () => {
                        const cal = calendarContainer;
                        if (!cal) return;

                        availableDates.forEach(d => {
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
                        const scheduleForDate = validHorarios.find(h => h.fecha === selectedDate);

                        if (scheduleForDate && scheduleForDate.horas.length > 0) {
                            displayAvailableTimes(scheduleForDate, availableTimesContainer);
                        } else {
                            updateAvailableTimes('<p class="text-text/70 p-4">No hay horarios disponibles para este día.</p>');
                        }
                    });
                },
            });

            injectLitepickerStyles();

        })
        .catch(error => {
            console.error('Error al cargar horarios.json:', error);
            updateAvailableTimes('<p class="text-red-600 font-semibold p-4">Lo siento, ha ocurrido un problema al cargar la disponibilidad. Por favor, inténtalo de nuevo más tarde.</p>');
        });
}