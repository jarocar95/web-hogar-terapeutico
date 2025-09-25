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

    // Navigate to another page
    await page.click('a[href="#about"]');
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

    // Tab to accept button
    await page.keyboard.press('Tab');
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
    const newContext = await context.browser().newContext();
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