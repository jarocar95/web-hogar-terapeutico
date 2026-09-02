/**
 * Tests del calendario de reservas.
 *
 * Es la pieza mas critica del sitio —el embudo entero pasa por aqui— y era la
 * unica sin ninguna prueba. Lo que se fija aqui son los tres comportamientos
 * cuya rotura no da error en consola y no se ve en una revision rapida:
 *
 *   1. Que no se ofrezcan dias pasados aunque horarios.json venga desfasado.
 *   2. Que un dia sin huecos no llegue al calendario.
 *   3. Que al elegir dia salgan tantos enlaces a WhatsApp como horas hay.
 *
 * Litepicker se sustituye por un doble: la libreria real necesita layout y no
 * aporta nada a lo que se quiere comprobar, que es la logica de filtrado y de
 * pintado del panel de horas.
 */
import { initBookingCalendar } from '../../src/ts/modules/booking-calendar';

type Horario = { fecha: string; horas: string[] };

// Devuelve una fecha desplazada n dias respecto a hoy, en formato YYYY-MM-DD
// y en hora local (no UTC: en Madrid toISOString() devuelve el dia anterior
// durante las primeras horas de la maniana).
function diaRelativo(n: number): string {
    const d = new Date();
    d.setDate(d.getDate() + n);
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mes}-${dia}`;
}

let opcionesDelPicker: any = null;
let manejadores: Record<string, Function> = {};

function montarDOM(): void {
    document.body.innerHTML = `
        <div id="calendar-container"><div class="calendar-skeleton"></div></div>
        <p id="available-times-subtitle"></p>
        <div id="available-times"></div>
    `;
}

function simularHorarios(horarios: Horario[]): void {
    (global as any).fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => horarios,
    });
}

beforeEach(() => {
    jest.clearAllMocks();
    opcionesDelPicker = null;
    manejadores = {};
    montarDOM();

    (window as any).requestAnimationFrame = (cb: Function) => { cb(); return 0; };

    // Doble de Litepicker: guarda las opciones con las que se construye y los
    // manejadores que se le registran, para poder dispararlos desde el test.
    (window as any).Litepicker = class {
        constructor(opciones: any) {
            opcionesDelPicker = opciones;
            if (typeof opciones.setup === 'function') opciones.setup(this);
        }
        on(evento: string, cb: Function) { manejadores[evento] = cb; }
    };
});

// Espera a que se resuelva la cadena de promesas del fetch.
const asentar = () => new Promise((r) => setTimeout(r, 0));

describe('Calendario de reservas', () => {
    it('descarta los días anteriores a hoy aunque vengan en el JSON', async () => {
        simularHorarios([
            { fecha: diaRelativo(-30), horas: ['10:00', '11:00'] },
            { fecha: diaRelativo(-1), horas: ['12:00'] },
            { fecha: diaRelativo(5), horas: ['10:00'] },
        ]);

        initBookingCalendar();
        await asentar();

        // El calendario debe abrirse en el primer dia FUTURO, no en el pasado.
        const inicio = opcionesDelPicker.startDate as Date;
        const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
        expect(inicio.getTime()).toBeGreaterThanOrEqual(hoy.getTime());
    });

    it('descarta los días que vienen sin ninguna hora libre', async () => {
        simularHorarios([
            { fecha: diaRelativo(1), horas: [] },
            { fecha: diaRelativo(2), horas: ['09:00'] },
        ]);

        initBookingCalendar();
        await asentar();

        // lockDaysFilter devuelve true para los dias que hay que bloquear.
        const bloquear = opcionesDelPicker.lockDaysFilter;
        const comoFecha = (iso: string) => ({ format: () => iso });
        expect(bloquear(comoFecha(diaRelativo(1)))).toBe(true);
        expect(bloquear(comoFecha(diaRelativo(2)))).toBe(false);
    });

    it('muestra el aviso de agenda vacía cuando no queda ningún día futuro', async () => {
        simularHorarios([{ fecha: diaRelativo(-3), horas: ['10:00'] }]);

        initBookingCalendar();
        await asentar();

        const contenedor = document.getElementById('calendar-container')!;
        expect(contenedor.textContent).toContain('Agenda en actualización');
        // Y deja una salida: el visitante no se queda sin forma de contactar.
        expect(contenedor.querySelector('a[href*="wa.me"]')).not.toBeNull();
    });

    it('al elegir un día pinta un enlace de WhatsApp por cada hora libre', async () => {
        const dia = diaRelativo(3);
        simularHorarios([{ fecha: dia, horas: ['10:00', '11:00', '12:00'] }]);

        initBookingCalendar();
        await asentar();

        manejadores['selected']({ format: () => dia });

        const enlaces = document.querySelectorAll('#available-times a[href*="wa.me"]');
        expect(enlaces).toHaveLength(3);

        // El mensaje prerrellenado lleva la fecha y la hora concretas: si esto
        // se rompe, Angie recibe "hola" sin saber a que cita se refiere.
        const primero = enlaces[0].getAttribute('href')!;
        expect(decodeURIComponent(primero)).toContain(dia);
        expect(decodeURIComponent(primero)).toContain('10:00');
    });

    it('el subtítulo refleja cuántos huecos hay y para qué día', async () => {
        const dia = diaRelativo(4);
        simularHorarios([{ fecha: dia, horas: ['16:00', '17:00'] }]);

        initBookingCalendar();
        await asentar();
        manejadores['selected']({ format: () => dia });

        const subtitulo = document.getElementById('available-times-subtitle')!;
        expect(subtitulo.textContent).toContain('2 huecos');
        expect(subtitulo.dataset.estado).toBe('lleno');
    });

    it('avisa de que la cita no está confirmada hasta que haya respuesta', async () => {
        const dia = diaRelativo(2);
        simularHorarios([{ fecha: dia, horas: ['10:00'] }]);

        initBookingCalendar();
        await asentar();
        manejadores['selected']({ format: () => dia });

        // Sin este aviso se podia creer que la reserva estaba hecha por haber
        // pulsado una hora, cuando solo se ha abierto WhatsApp.
        expect(document.getElementById('available-times')!.textContent)
            .toContain('La cita queda confirmada cuando te respondo');
    });
});
