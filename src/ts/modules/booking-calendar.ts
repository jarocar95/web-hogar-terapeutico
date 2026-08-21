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
        // Marca de estado que lee sincronizarPanel() para saber si el panel
        // está mostrando un día concreto o el mensaje de "elige un día".
        subtitle.dataset.estado = 'lleno';
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

                    // Litepicker pone tabindex="-1" en TODOS los días, así que
                    // el tabulador saltaba del selector de mes directamente a
                    // las horas: quien navega con teclado o lector de pantalla
                    // solo podía reservar la fecha autoseleccionada, y si había
                    // pasado de mes, una que ni siquiera estaba a la vista.
                    // Los días con hueco pasan a ser botones de verdad.
                    const makeDaysFocusable = (): void => {
                        calendarContainer
                            .querySelectorAll<HTMLElement>('.day-item.is-available')
                            .forEach((el) => {
                                if (el.dataset.htAccesible === '1') return;
                                el.dataset.htAccesible = '1';
                                el.setAttribute('tabindex', '0');
                                el.setAttribute('role', 'button');
                                const ts = Number(el.getAttribute('data-time'));
                                if (ts) {
                                    const f = new Date(ts).toLocaleDateString('es-ES', {
                                        weekday: 'long', day: 'numeric', month: 'long',
                                    });
                                    el.setAttribute('aria-label', `${f}, con horarios disponibles`);
                                }
                                el.addEventListener('keydown', (ev: KeyboardEvent) => {
                                    if (ev.key === 'Enter' || ev.key === ' ') {
                                        ev.preventDefault();
                                        el.click();
                                    }
                                });
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
                    // Litepicker escribe "lun mar mié jue vie sáb dom": siete
                    // palabras de tres letras sobre celdas estrechas, que es
                    // ruido en la fila que menos informacion aporta. Se pasa a
                    // la inicial, que es la convencion en español, conservando
                    // el nombre completo para lectores de pantalla.
                    const INICIALES: Record<string, string> = {
                        lun: 'L', mar: 'M', mié: 'X', mie: 'X',
                        jue: 'J', vie: 'V', sáb: 'S', sab: 'S', dom: 'D',
                    };
                    const shortenWeekdays = (): void => {
                        calendarContainer
                            .querySelectorAll<HTMLElement>('.month-item-weekdays-row > div')
                            .forEach((el) => {
                                const texto = (el.textContent || '').trim();
                                const inicial = INICIALES[texto.toLowerCase()];
                                if (inicial) {
                                    el.setAttribute('aria-label', texto);
                                    el.setAttribute('title', texto);
                                    el.textContent = inicial;
                                }
                            });
                    };

                    // Aviso de disponibilidad escondida. El calendario abre en
                    // la primera fecha libre, que puede caer en un mes con un
                    // único hueco mientras el siguiente tiene veintiuno: la
                    // pantalla se llena de días grises y se lee como "no tiene
                    // sitio para mí" o "esto está roto". Ninguna es cierta, y
                    // ninguna se recupera una vez cerrada la pestaña.
                    const renderHintOtrosMeses = (): void => {
                        const visible = calendarContainer.querySelector('.month-item-name');
                        if (!visible) return;
                        const enPantalla = calendarContainer.querySelectorAll('.day-item.is-available').length;

                        let hint = document.getElementById('calendar-hint');
                        const porMes = new Map<string, number>();
                        availableDates.forEach((d) => porMes.set(d.slice(0, 7), (porMes.get(d.slice(0, 7)) || 0) + 1));

                        // El primer mes futuro con más huecos que el visible.
                        const mesVisibleISO = (() => {
                            const primero = calendarContainer.querySelector('.day-item[data-time]');
                            if (!primero) return null;
                            const d = new Date(Number(primero.getAttribute('data-time')));
                            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                        })();

                        const candidato = [...porMes.entries()]
                            .filter(([mes, n]) => mesVisibleISO !== null && mes > mesVisibleISO && n > enPantalla)
                            .sort((a, b) => a[0].localeCompare(b[0]))[0];

                        const slot = document.getElementById('calendar-hint-slot');
                        if (!slot) return;

                        if (!candidato) { hint?.remove(); return; }

                        const [mesISO, n] = candidato;
                        const nombreMes = new Date(`${mesISO}-01T00:00:00`)
                            .toLocaleDateString('es-ES', { month: 'long' });
                        const texto = `${n} huecos más en ${nombreMes} →`;

                        if (!hint) {
                            hint = document.createElement('button');
                            hint.id = 'calendar-hint';
                            hint.setAttribute('type', 'button');
                            hint.className = 'w-full flex items-center justify-center gap-1.5 min-h-[44px] '
                                + 'rounded-xl bg-clay-50 border border-clay-100 text-clay-600 '
                                + 'text-[14px] font-semibold transition-colors hover:bg-clay-100';
                            hint.addEventListener('click', () => {
                                (calendarContainer.querySelector('.button-next-month') as HTMLElement | null)?.click();
                            });
                            // Va en el hueco de fuera, no dentro del contenedor
                            // observado: escribir dentro dispararía el
                            // MutationObserver que llama a esta misma función.
                            slot.appendChild(hint);
                        }
                        if (hint.textContent !== texto) hint.textContent = texto;
                    };

                    // Desincronía mes/panel. Al pasar de mes, el panel seguía
                    // anunciando "4 huecos · lunes, 31 de agosto" mientras la
                    // rejilla mostraba septiembre: una fecha sin ninguna celda
                    // visible que le correspondiese. Se comprueba aquí, en el
                    // refresco, y no en el evento monthchange, porque ese no
                    // llega de forma fiable al pulsar las flechas.
                    const sincronizarPanel = (): void => {
                        const elegido = calendarContainer.querySelector('.day-item.is-start-date, .day-item.is-selected');
                        if (elegido) return; // el día elegido sigue a la vista

                        const sub = document.getElementById('available-times-subtitle');
                        const panel = document.getElementById('available-times');
                        if (!sub || !panel) return;
                        if (sub.dataset.estado === 'vacio') return;

                        sub.dataset.estado = 'vacio';
                        sub.textContent = 'Elige un día para ver sus horarios';
                        panel.innerHTML = '<p class="text-ink-mute text-[14.5px] py-10 text-center">'
                            + 'Selecciona un día resaltado de este mes.</p>';
                    };

                    // Guarda de reentrada. refrescar() escribe en el DOM que el
                    // propio observador vigila (clases, atributos, textos de
                    // los días), así que sin esto cada pasada se dispara a sí
                    // misma y el navegador se queda colgado.
                    // Refresco agrupado por fotograma, no descartado.
                    //
                    // La versión anterior usaba una guarda que DESCARTABA los
                    // refrescos que llegaban mientras había uno en curso, y eso
                    // rompía el botón de "N huecos más en...": su click provoca
                    // el cambio de mes de forma síncrona, así que el refresco
                    // del mes nuevo caía dentro de la guarda y se perdía. El
                    // resultado era un mes sin días seleccionables y un botón
                    // que no se actualizaba, mientras navegar con las flechas
                    // funcionaba bien.
                    //
                    // Aquí no se pierde ninguno: se agrupan en el siguiente
                    // fotograma. Y no hay bucle porque todas las operaciones
                    // son idempotentes: la segunda pasada no muta nada, así que
                    // el observador deja de dispararse solo.
                    let pendiente = false;
                    const refrescar = (): void => {
                        if (pendiente) return;
                        pendiente = true;
                        requestAnimationFrame(() => {
                            pendiente = false;
                            highlightAvailableDates();
                            labelNavigationButtons();
                            shortenWeekdays();
                            makeDaysFocusable();
                            renderHintOtrosMeses();
                            sincronizarPanel();
                        });
                    };

                    const observer = new MutationObserver(refrescar);
                    observer.observe(calendarContainer, { childList: true, subtree: true });

                    picker.on('show', refrescar);
                    picker.on('monthchange', refrescar);

                    picker.on('selected', (date: any) => {
                        const selectedDate = date.format('YYYY-MM-DD');
                        const scheduleForDate = horarios.find((h) => h.fecha === selectedDate);

                        if (scheduleForDate && scheduleForDate.horas.length > 0) {
                            displayAvailableTimes(scheduleForDate, availableTimesContainer);
                            // En móvil el panel de horas queda unos 800 px por
                            // debajo del calendario: elegías un día y el
                            // resultado aparecía fuera de pantalla, así que la
                            // sensación era que no había pasado nada.
                            if (window.innerWidth < 1024) {
                                availableTimesContainer.scrollIntoView({
                                    block: 'center',
                                    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
                                        ? 'auto' : 'smooth',
                                });
                            }
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
            Logger.getInstance().error('Calendar fetch failed', {
                error: error instanceof Error ? error.message : String(error),
            });

            // Antes esto era un callejón sin salida ("inténtalo más tarde") en
            // el punto exacto de conversión, mientras el estado de agenda vacía
            // —el mismo tipo de fallo— sí ofrecía WhatsApp. Ahora hay reintento
            // y salida humana: si la agenda no carga, la reserva no debería
            // depender de que cargue.
            const msg = 'Hola Angie, quería reservar desde la web pero el calendario no carga. '
                + '¿Me dices qué huecos tienes?';
            calendarContainer.innerHTML = `
                <div class="bg-clay-50 border border-clay-100 rounded-lg2 p-6 text-center" role="alert">
                    <h4 class="font-serif text-base font-semibold text-ink mb-2">No hemos podido cargar la agenda</h4>
                    <p class="text-[14.5px] text-ink-soft mb-5">Puede ser un problema de conexión. Puedes reintentarlo o escribirme directamente y lo vemos.</p>
                    <div class="flex flex-col sm:flex-row gap-3 justify-center">
                        <button type="button" id="calendar-retry" class="btn btn-primary">Reintentar</button>
                        <a href="https://wa.me/34621348616?text=${encodeURIComponent(msg)}"
                           target="_blank" rel="noopener noreferrer" class="btn btn-ghost">Escribir por WhatsApp</a>
                    </div>
                </div>`;
            availableTimesContainer.innerHTML = '';
            const sub = document.getElementById('available-times-subtitle');
            if (sub) sub.textContent = 'No disponible ahora mismo';

            document.getElementById('calendar-retry')?.addEventListener('click', () => {
                calendarContainer.innerHTML = '';
                initBookingCalendar();
            });
        });
}