import { Page, expect } from '@playwright/test';

/**
 * Pulsa un enlace de la navegacion, este el visitante en escritorio o en movil.
 *
 * En movil la navegacion de la cabecera va oculta (`hidden lg:flex`) detras del
 * boton de menu, asi que un `click` directo sobre el enlace se queda esperando
 * a un elemento que nunca se muestra. Varias pruebas caducaban por esto y
 * parecian fallos del sitio cuando eran del selector.
 */
export async function pulsarEnNavegacion(page: Page, ancla: string): Promise<void> {
    const enEscritorio = page.locator(`#main-header nav a[href="${ancla}"]`).first();
    if (await enEscritorio.isVisible()) {
        await enEscritorio.click();
        return;
    }
    await page.locator('#menu-btn-fixed').click();
    const enMovil = page.locator(`#mobile-menu-fixed a[href="${ancla}"]`).first();
    await expect(enMovil).toBeVisible();
    await enMovil.click();
}

/** La navegacion esta disponible: o el menu de escritorio o el boton de movil. */
export async function navegacionDisponible(page: Page): Promise<boolean> {
    const escritorio = await page.locator('#main-header nav').first().isVisible();
    const movil = await page.locator('#menu-btn-fixed').isVisible();
    return escritorio || movil;
}
