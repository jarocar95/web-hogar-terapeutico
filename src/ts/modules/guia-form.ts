/**
 * Peticion de una guia descargable.
 *
 * Envia a una aplicacion web de Apps Script en la cuenta de Angie, no a
 * Formspree. El motivo no es tecnico: MailApp envia desde la cuenta que ejecuta
 * el script, asi que la guia llega desde info@hogarterapeutico.com. Con un
 * servicio de formularios llegaria desde su infraestructura, y un PDF de una
 * psicologa que aparece con remite de un servicio ajeno parece spam.
 *
 * Se manda como application/x-www-form-urlencoded a proposito: es un tipo
 * "simple" y no dispara la peticion previa de CORS, que Apps Script no responde.
 */
import { Logger } from '../utils/logger.js';

interface Respuesta {
    ok: boolean;
    mensaje: string;
}

export function initGuiaForm(): void {
    const form = document.querySelector<HTMLFormElement>('[data-guia-form]');
    if (!form) return;

    const endpoint = form.dataset.endpoint;
    const token = form.dataset.token;
    const aviso = form.querySelector<HTMLElement>('[data-guia-aviso]');
    const boton = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    if (!endpoint || !token || !aviso || !boton) return;

    // El endpoint se pega despues de implementar la aplicacion web. Si sale a
    // produccion sin sustituir, mejor decirlo que dejar que el fetch falle con
    // un error generico que nadie sabe interpretar.
    if (endpoint.startsWith('PENDIENTE')) {
        boton.disabled = true;
        aviso.hidden = false;
        aviso.className = 'text-[14px] text-clay-700 mt-3';
        aviso.textContent =
            'El envío automático todavía no está activo. Escribe a info@hogarterapeutico.com '
            + 'y te la mando.';
        return;
    }

    const textoBoton = boton.textContent ?? '';

    const decir = (mensaje: string, error: boolean): void => {
        aviso.textContent = mensaje;
        aviso.hidden = false;
        aviso.className = error
            ? 'text-[14px] text-clay-700 mt-3'
            : 'text-[14px] text-sage-700 font-semibold mt-3';
    };

    form.addEventListener('submit', async (ev: Event) => {
        ev.preventDefault();
        const email = form.querySelector<HTMLInputElement>('input[type="email"]')?.value.trim();
        const acepta = form.querySelector<HTMLInputElement>('input[type="checkbox"]')?.checked;
        if (!email || !acepta) return;

        boton.disabled = true;
        boton.textContent = 'Enviando…';
        aviso.hidden = true;

        try {
            const cuerpo = new URLSearchParams({
                token,
                email,
                consentimiento: 'si',
            });
            const r = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: cuerpo.toString(),
            });
            const datos = (await r.json()) as Respuesta;
            decir(datos.mensaje, !datos.ok);
            if (datos.ok) {
                form.reset();
                Logger.getInstance().event(
                    'guia_solicitada', 'embudo', form.dataset.guia ?? 'guia',
                );
            }
        } catch {
            // Sin detalle del error: al usuario no le sirve y puede filtrar rutas.
            decir(
                'No se ha podido enviar. Prueba de nuevo o escribe a info@hogarterapeutico.com.',
                true,
            );
        } finally {
            boton.disabled = false;
            boton.textContent = textoBoton;
        }
    });
}
