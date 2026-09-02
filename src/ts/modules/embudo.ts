/**
 * Medicion del embudo de reserva.
 *
 * Hasta ahora solo se median las visitas. Entre "alguien entra" y "alguien
 * reserva" habia cuatro pasos completamente a oscuras, asi que ante una agenda
 * con huecos libres no habia forma de distinguir dos problemas muy distintos:
 * que no llegue gente, o que llegue y no reserve. El primero se arregla con
 * trafico; el segundo, no.
 *
 * Los cinco eventos:
 *
 *   cta_reservar        pulsa uno de los botones que llevan al calendario
 *   calendario_dia      elige un dia con huecos
 *   reserva_whatsapp    pulsa una hora concreta   <- la conversion
 *   contacto_whatsapp   escribe por WhatsApp sin pasar por el calendario
 *   formulario_enviado  manda el formulario de contacto
 *
 * Los dos de WhatsApp van separados a proposito. Son el mismo enlace wa.me y
 * significan cosas opuestas: uno es alguien eligiendo hora, el otro es alguien
 * con dudas antes de decidir. Sumarlos deja un numero que no dice nada.
 *
 * Lo que esto NO puede medir, para que conste:
 *
 * - Si el mensaje de WhatsApp llega a enviarse, y si acaba en cita. Eso pasa
 *   fuera del sitio. Ese tramo solo lo cierra Angie contando cuantos mensajes
 *   recibe y cuantos se convierten.
 * - A quien no acepta cookies. gtag no se carga sin consentimiento, asi que los
 *   absolutos van por debajo del real. Para comparar pasos entre si sigue
 *   sirviendo, que es para lo que se usa.
 *
 * No recoge nada nominativo: cuenta acciones, no personas.
 */
import { Logger } from '../utils/logger.js';

// Delegacion en document en lugar de un listener por enlace.
// Los huecos horarios los pinta el calendario despues de elegir dia, asi que
// cuando se configura esto todavia no existen en el DOM.
export function initEmbudo(): void {
    const registrar = Logger.getInstance();

    document.addEventListener('click', (evento) => {
        const destino = evento.target as HTMLElement | null;
        const enlace = destino?.closest?.('a') as HTMLAnchorElement | null;
        if (!enlace) return;

        const href = enlace.getAttribute('href') || '';

        // --- La conversion: una hora concreta del calendario ---
        // Se distingue por estar dentro del panel de horarios, no por el href:
        // los enlaces de contacto tambien apuntan a wa.me.
        if (href.includes('wa.me') && enlace.closest('#available-times')) {
            registrar.event('reserva_whatsapp', 'embudo', enlace.textContent?.trim() || 'hora');
            return;
        }

        // --- WhatsApp para dudas, desde cualquier otro sitio ---
        if (href.includes('wa.me')) {
            registrar.event('contacto_whatsapp', 'embudo', seccionDe(enlace));
            return;
        }

        // --- Intencion: pulsa un boton que lleva al calendario ---
        if (href.includes('#booking-calendar')) {
            registrar.event('cta_reservar', 'embudo', seccionDe(enlace));
        }
    });
}

/**
 * Etiqueta el evento con la seccion desde la que se pulso.
 *
 * Con siete botones hacia el calendario repartidos por la pagina, saber cual
 * se usa es la mitad de la informacion: si todas las reservas salen del ultimo,
 * los seis anteriores estan de adorno.
 */
function seccionDe(elemento: HTMLElement): string {
    const seccion = elemento.closest('section, header, footer');
    if (!seccion) return 'sin_seccion';
    return seccion.id || seccion.tagName.toLowerCase();
}

/** Se llama desde el calendario al elegir un dia con huecos libres. */
export function registrarDiaElegido(fecha: string, huecos: number): void {
    Logger.getInstance().event('calendario_dia', 'embudo', fecha, huecos);
}

/** Se llama desde el formulario cuando Formspree confirma la recepcion. */
export function registrarFormularioEnviado(): void {
    Logger.getInstance().event('formulario_enviado', 'embudo', 'contacto');
}
