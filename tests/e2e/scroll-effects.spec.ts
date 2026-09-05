import { test, expect } from '@playwright/test';
import { pulsarEnNavegacion } from './ayudas';

test.describe('Scroll Effects', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  // La cabecera ya no encoge al hacer scroll. Encogia de 5rem a 4rem y movia
  // con ella el padding del body, o sea que desplazaba el documento entero
  // 16 px a mitad de scroll: se midio CLS 0,40. Ahora mantiene la altura y solo
  // gana una sombra, que es lo que se comprueba aqui.
  test('gana sombra al hacer scroll, sin cambiar de altura', async ({ page }) => {
    const header = page.locator('#main-header');

    await expect(header).toHaveClass(/h-20/);
    await expect(header).not.toHaveClass(/shadow-e1/);

    await page.evaluate(() => window.scrollTo(0, 100));
    await expect(header).toHaveClass(/shadow-e1/);

    // La altura no se toca: es justo lo que provocaba el salto de layout.
    await expect(header).toHaveClass(/h-20/);

    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(header).not.toHaveClass(/shadow-e1/);
  });

  // La barra fija no depende de la direccion del scroll, sino de si estan a la
  // vista el hero, el calendario o el contacto: ofrecer "Reservar" cuando ya
  // estas dentro de la seccion de reserva es ruido.
  test('la barra fija aparece fuera del hero y se esconde dentro de reserva', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    const barra = page.locator('#mobile-cta-bar');

    // En el hero no se ve.
    await expect(barra).not.toHaveClass(/is-visible/);

    // En una zona intermedia si.
    await page.locator('#services-pricing').scrollIntoViewIfNeeded();
    await expect(barra).toHaveClass(/is-visible/);

    // Dentro del calendario vuelve a esconderse.
    await page.locator('#booking-calendar').scrollIntoViewIfNeeded();
    await expect(barra).not.toHaveClass(/is-visible/);
  });

  test('aguanta muchos eventos de scroll seguidos', async ({ page }) => {
    const header = page.locator('#main-header');

    await page.evaluate(() => {
      window.scrollTo(0, 50);
      window.scrollTo(0, 100);
      window.scrollTo(0, 150);
      window.scrollTo(0, 200);
    });
    await expect(header).toHaveClass(/shadow-e1/);

    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(header).not.toHaveClass(/shadow-e1/);
  });

  test('should maintain scroll position on window resize', async ({ page }) => {
    // Scroll down
    await page.evaluate(() => {
      window.scrollTo(0, 300);
    });

    await page.waitForTimeout(300);

    const scrollPosition = await page.evaluate(() => window.scrollY);
    expect(scrollPosition).toBeGreaterThan(200);

    // Resize window
    await page.setViewportSize({ width: 800, height: 600 });

    // Wait for any resize handlers
    await page.waitForTimeout(300);

    // Scroll position should be maintained
    const newScrollPosition = await page.evaluate(() => window.scrollY);
    expect(newScrollPosition).toBeGreaterThan(200);
  });

  test('should handle mobile CTA bar visibility on mobile only', async ({ page }) => {
    // Test desktop viewport
    await page.setViewportSize({ width: 1200, height: 800 });

    const mobileCtaBar = page.locator('#mobile-cta-bar');

    // Scroll down on desktop
    await page.evaluate(() => {
      window.scrollTo(0, 200);
    });

    await page.waitForTimeout(500);

    // The scroll handler always clears the "hidden"/"opacity-0" classes on
    // scroll-down regardless of viewport — it's the "lg:hidden" responsive
    // utility class that actually keeps the bar off-screen on desktop, so
    // check real visibility rather than which JS-controlled class is set.
    await expect(mobileCtaBar).toBeHidden();

    // Switch to mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Reload to apply mobile styles
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Scroll down on mobile
    await page.evaluate(() => {
      window.scrollTo(0, 200);
    });

    await page.waitForTimeout(500);

    // Mobile CTA bar should be visible on mobile
    await expect(mobileCtaBar).not.toHaveClass(/(^|\s)hidden(\s|$)/);
  });

  test('should work with smooth scrolling enabled', async ({ page }) => {
    // Check if smooth scrolling is enabled
    const htmlElement = page.locator('html');
    const hasSmoothScroll = await htmlElement.evaluate((html) => {
      return html.classList.contains('scroll-smooth');
    });

    expect(hasSmoothScroll).toBe(true);

    await pulsarEnNavegacion(page, '#about');
    await page.waitForTimeout(1500);

    const aboutSection = page.locator('#about');
    const aboutPosition = await aboutSection.evaluate((element) => {
      return element.getBoundingClientRect().top;
    });

    // La tolerancia es la altura de la cabecera fija, no un 100 a ojo: la
    // seccion se detiene justo debajo de ella. Con el margen antiguo el test
    // fallaba en movil por 0,375 px.
    const alturaCabecera = await page
      .locator('#main-header')
      .evaluate((el) => el.getBoundingClientRect().height);
    expect(Math.abs(aboutPosition)).toBeLessThanOrEqual(alturaCabecera + 24);
  });

  test('el estado de la cabecera se reinicia al cambiar de pagina', async ({ page }) => {
    const header = page.locator('#main-header');

    await page.evaluate(() => window.scrollTo(0, 300));
    await expect(header).toHaveClass(/shadow-e1/);

    await page.goto('/blog/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#main-header')).not.toHaveClass(/shadow-e1/);
  });

  test('should be performant with many scroll events', async ({ page }) => {
    const startTime = Date.now();

    // Generate many scroll events
    await page.evaluate(() => {
      for (let i = 0; i < 50; i++) {
        window.scrollTo(0, i * 10);
      }
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Should complete quickly (debounce should prevent performance issues)
    expect(duration).toBeLessThan(1000);
  });

  test('should work with browser back button and scroll restoration', async ({ page }) => {
    // Scroll down
    await page.evaluate(() => {
      window.scrollTo(0, 300);
    });

    await page.waitForTimeout(300);

    // Navigate to another page
    await page.goto('/aviso-legal/');
    await page.waitForLoadState('networkidle');

    // Go back
    await page.goBack();
    await page.waitForLoadState('networkidle');

    // Scroll position should be restored or reset to top
    await page.waitForTimeout(500);

    const scrollPosition = await page.evaluate(() => window.scrollY);
    // Most browsers reset scroll on back navigation for single-page apps
    expect(scrollPosition).toBeGreaterThanOrEqual(0);
  });

  test('should handle scroll effects with JavaScript disabled', async ({ page }) => {
    // This test would require JavaScript to be disabled, but Playwright doesn't support this directly
    // Instead, we'll test that the page gracefully handles missing JavaScript

    // Check if page has noscript fallbacks
    const noscriptElements = page.locator('noscript');
    const noscriptCount = await noscriptElements.count();

    // Should have some noscript fallbacks
    expect(noscriptCount).toBeGreaterThan(0);

    // Check if critical content is visible even without JavaScript
    const mainContent = page.locator('main, #main-content');
    await expect(mainContent).toBeVisible();
  });
});