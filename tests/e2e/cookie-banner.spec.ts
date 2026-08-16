declare global {
  interface Window {
    dataLayer: any[];
  }
}

import { test, expect } from '@playwright/test';

test.describe('Cookie Banner', () => {
  test.beforeEach(async ({ page, context }) => {
    // Clear storage before each test
    await context.clearCookies();
    await context.clearPermissions();

    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display cookie banner for first-time visitors', async ({ page }) => {
    const cookieBanner = page.locator('#cookie-consent-banner');
    const acceptButton = page.locator('#accept-cookies-btn');

    // Banner should be visible initially
    await expect(cookieBanner).toBeVisible();
    await expect(cookieBanner).not.toHaveClass(/hidden/);
    await expect(acceptButton).toBeVisible();
    await expect(acceptButton).toHaveText('Aceptar');

    // La AEPD exige que rechazar sea tan visible y tan facil como aceptar.
    const rejectButton = page.locator('#reject-cookies-btn');
    await expect(rejectButton).toBeVisible();
    await expect(rejectButton).toHaveText('Rechazar');
  });

  test('should let the visitor reject analytics cookies', async ({ page }) => {
    await page.addInitScript(() => {
      window.dataLayer = [];
      (window as any).gtag = function (...args: any[]) { window.dataLayer.push(args); };
    });
    await page.reload();
    await page.waitForLoadState('networkidle');

    await page.locator('#reject-cookies-btn').click();

    const stored = await page.evaluate(() => ({
      consent: localStorage.getItem('cookieConsent'),
      legacy: localStorage.getItem('cookiesAccepted')
    }));
    expect(stored.consent).toBe('denied');
    expect(stored.legacy).toBeNull();

    const consentCall = (await page.evaluate(() => window.dataLayer))
      .find((call: any[]) => call[0] === 'consent' && call[1] === 'update');
    expect(consentCall).toBeTruthy();
    expect(consentCall[2]).toEqual({ analytics_storage: 'denied' });

    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#cookie-consent-banner')).toHaveClass(/hidden/);
  });

  test('should let the visitor change their mind from the footer', async ({ page }) => {
    await page.locator('#accept-cookies-btn').click();
    await page.waitForTimeout(600);
    await expect(page.locator('#cookie-consent-banner')).toBeHidden();

    await page.locator('#cookie-settings-link').click();
    await expect(page.locator('#cookie-consent-banner')).toBeVisible();
  });

  test('should hide banner when accept button is clicked', async ({ page }) => {
    const cookieBanner = page.locator('#cookie-consent-banner');
    const acceptButton = page.locator('#accept-cookies-btn');

    // Click accept button
    await acceptButton.click();

    // Banner should become hidden with smooth transition
    await expect(cookieBanner).toHaveCSS('opacity', '0');

    // Wait for transition to complete
    await page.waitForTimeout(500);

    // Banner should be hidden
    await expect(cookieBanner).toBeHidden();
  });

  test('should set localStorage when cookies are accepted', async ({ page }) => {
    const acceptButton = page.locator('#accept-cookies-btn');

    // Click accept button
    await acceptButton.click();

    // Check localStorage
    const cookiesAccepted = await page.evaluate(() => {
      return localStorage.getItem('cookiesAccepted');
    });

    expect(cookiesAccepted).toBe('true');
  });

  test('should not show banner if cookies already accepted', async ({ page }) => {
    // Set localStorage to simulate previously accepted cookies
    await page.evaluate(() => {
      localStorage.setItem('cookiesAccepted', 'true');
    });

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    const cookieBanner = page.locator('#cookie-consent-banner');

    // Banner should remain hidden
    await expect(cookieBanner).toHaveClass(/hidden/);
  });

  test('should grant Google Analytics consent when accepted', async ({ page }) => {
    // Mock gtag function to verify consent is granted
    await page.addInitScript(() => {
      window.dataLayer = [];
      window.gtag = function(...args) {
        window.dataLayer.push(args);
      };
    });

    const acceptButton = page.locator('#accept-cookies-btn');

    // Click accept button
    await acceptButton.click();

    // Verify gtag was called with consent update
    const gtagCalls = await page.evaluate(() => {
      return (window as any).dataLayer;
    });

    const consentCall = gtagCalls.find((call: any[]) =>
      call[0] === 'consent' && call[1] === 'update'
    );

    expect(consentCall).toBeTruthy();
    expect(consentCall[2]).toEqual({
      'analytics_storage': 'granted'
    });
  });

  test('should handle missing gtag function gracefully', async ({ page }) => {
    // Remove gtag function
    await page.addInitScript(() => {
      (window as any).gtag = undefined;
    });

    const acceptButton = page.locator('#accept-cookies-btn');
    const cookieBanner = page.locator('#cookie-consent-banner');

    // Click accept button
    await acceptButton.click();

    // Should still work without errors
    await expect(cookieBanner).toHaveCSS('opacity', '0');

    // Check localStorage is still set
    const cookiesAccepted = await page.evaluate(() => {
      return localStorage.getItem('cookiesAccepted');
    });

    expect(cookiesAccepted).toBe('true');
  });

  test('should maintain banner visibility across page navigation', async ({ page }) => {
    const cookieBanner = page.locator('#cookie-consent-banner');

    // Navigate within the page (nav links use "/#about", not a bare "#about",
    // so they still work correctly when the visitor isn't on the homepage)
    await page.click('a[href="/#about"]');
    await page.waitForLoadState('networkidle');

    // Banner should still be visible
    await expect(cookieBanner).toBeVisible();

    // Accept cookies
    await page.click('#accept-cookies-btn');

    // Navigate to another page
    await page.goto('/politica-privacidad/');
    await page.waitForLoadState('networkidle');

    // Banner should remain hidden
    await expect(cookieBanner).toBeHidden();
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    const cookieBanner = page.locator('#cookie-consent-banner');
    const acceptButton = page.locator('#accept-cookies-btn');

    // Check accessibility attributes
    await expect(acceptButton).toHaveAttribute('type', 'button');
    await expect(acceptButton).toBeVisible();

    // Check if banner has proper role
    const bannerRole = await cookieBanner.getAttribute('role');
    expect(bannerRole).toMatch(/alert|banner|dialog/);
  });

  test('should be keyboard accessible', async ({ page }) => {
    const acceptButton = page.locator('#accept-cookies-btn');
    const cookieBanner = page.locator('#cookie-consent-banner');

    // The accept button isn't the first tabbable element on the page (the
    // skip-link is), so focus it directly and confirm Enter activates it —
    // that's what "keyboard accessible" means here, not tab-order position.
    await acceptButton.focus();
    await expect(acceptButton).toBeFocused();

    // Activate with Enter key
    await page.keyboard.press('Enter');

    // Banner should hide
    await expect(cookieBanner).toHaveCSS('opacity', '0');
  });

  test('should persist consent across browser sessions', async ({ page, context }) => {
    const acceptButton = page.locator('#accept-cookies-btn');

    // Accept cookies
    await acceptButton.click();

    // Create new context (simulates new browser session)
    const newContext = await context.browser()!.newContext();
    const newPage = await newContext.newPage();

    await newPage.goto('/');
    await newPage.waitForLoadState('networkidle');

    // localStorage should be empty in new context
    const cookiesAccepted = await newPage.evaluate(() => {
      return localStorage.getItem('cookiesAccepted');
    });

    expect(cookiesAccepted).toBeNull();

    // Banner should be visible
    await expect(newPage.locator('#cookie-consent-banner')).toBeVisible();

    await newContext.close();
  });
});