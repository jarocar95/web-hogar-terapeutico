import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should have proper HTML structure and semantic elements', async ({ page }) => {
    // Check for proper document structure
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    await expect(page.locator('head')).toBeVisible();
    await expect(page.locator('body')).toBeVisible();

    // Check for semantic elements
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();

    // Check for navigation
    const navElements = page.locator('nav');
    const navCount = await navElements.count();
    expect(navCount).toBeGreaterThan(0);
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    // Get all headings
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();

    expect(headingCount).toBeGreaterThan(0);

    // Check heading levels
    let lastLevel = 0;
    for (let i = 0; i < headingCount; i++) {
      const heading = headings.nth(i);
      const tagName = await heading.evaluate((element) => element.tagName);
      const level = parseInt(tagName.substring(1));

      // Heading levels should not skip levels (e.g., h1 to h3)
      if (lastLevel > 0) {
        expect(level).toBeLessThanOrEqual(lastLevel + 1);
      }

      lastLevel = level;

      // Check that headings have text content
      const text = await heading.textContent();
      expect(text?.trim()).toBeTruthy();
    }
  });

  test('should have proper ARIA labels and roles', async ({ page }) => {
    // Check for ARIA labels
    const ariaElements = page.locator('[aria-label], [aria-labelledby]');
    const ariaCount = await ariaElements.count();

    // Should have some ARIA labels
    expect(ariaCount).toBeGreaterThan(0);

    // Check specific interactive elements
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();

    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const buttonText = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');

      // Button should have text or aria-label
      expect(buttonText?.trim() || ariaLabel).toBeTruthy();
    }

    // Check mobile menu accessibility
    const menuButton = page.locator('#menu-btn');
    if (await menuButton.isVisible()) {
      await expect(menuButton).toHaveAttribute('aria-expanded');
      await expect(menuButton).toHaveAttribute('aria-controls');
    }
  });

  test('should have proper alt text for images', async ({ page }) => {
    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const image = images.nth(i);
      const alt = await image.getAttribute('alt');
      const role = await image.getAttribute('role');

      // Images should have alt text unless they're decorative
      if (role !== 'presentation' && role !== 'none') {
        expect(alt).toBeTruthy();
      }
    }
  });

  test('should be keyboard navigable', async ({ page }) => {
    // Test Tab navigation
    const focusableElements = page.locator(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    const elementCount = await focusableElements.count();
    expect(elementCount).toBeGreaterThan(0);

    // Test keyboard navigation through first few elements
    for (let i = 0; i < Math.min(elementCount, 10); i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);

      const activeElement = page.locator(':focus');
      await expect(activeElement).toBeVisible();
    }

    // Test Shift+Tab navigation
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Shift+Tab');
      await page.waitForTimeout(100);

      const activeElement = page.locator(':focus');
      await expect(activeElement).toBeVisible();
    }
  });

  test('should have proper focus management', async ({ page }) => {
    // Test focus styles
    const focusableElements = page.locator(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])'
    );

    const elementCount = await focusableElements.count();
    expect(elementCount).toBeGreaterThan(0);

    // Test focus on first few elements
    for (let i = 0; i < Math.min(elementCount, 5); i++) {
      const element = focusableElements.nth(i);
      await element.focus();

      const activeElement = page.locator(':focus');
      await expect(activeElement).toBe(element);

      // Check if element has visible focus styles
      const computedStyle = await element.evaluate((element) => {
        return window.getComputedStyle(element);
      });

      // Element should have some focus indication
      const hasFocusStyle = computedStyle.outline !== 'none' ||
                           computedStyle.boxShadow !== 'none' ||
                           computedStyle.border !== 'none';

      expect(hasFocusStyle).toBe(true);
    }
  });

  test('should have proper form accessibility', async ({ page }) => {
    const forms = page.locator('form');
    const formCount = await forms.count();

    if (formCount > 0) {
      const form = forms.first();

      // Check form labels
      const labels = form.locator('label');
      const labelCount = await labels.count();

      for (let i = 0; i < labelCount; i++) {
        const label = labels.nth(i);
        const labelText = await label.textContent();
        expect(labelText?.trim()).toBeTruthy();

        // Check if label is associated with form control
        const forAttribute = await label.getAttribute('for');
        if (forAttribute) {
          const formControl = form.locator(`#${forAttribute}`);
          await expect(formControl).toBeVisible();
        }
      }

      // Check form controls have proper attributes
      const inputs = form.locator('input, textarea, select');
      const inputCount = await inputs.count();

      for (let i = 0; i < inputCount; i++) {
        const input = inputs.nth(i);
        const inputType = await input.getAttribute('type');

        // Required fields should be marked
        const isRequired = await input.getAttribute('required');
        if (isRequired === '' || isRequired === 'required') {
          const ariaRequired = await input.getAttribute('aria-required');
          expect(ariaRequired === 'true' || isRequired).toBeTruthy();
        }
      }
    }
  });

  test('should have proper color contrast', async ({ page }) => {
    // This is a basic contrast test - in production, you'd use axe-core or similar
    const textElements = page.locator('p, span, h1, h2, h3, h4, h5, h6, a, button');
    const elementCount = await textElements.count();

    expect(elementCount).toBeGreaterThan(0);

    // Test a few elements for basic contrast
    for (let i = 0; i < Math.min(elementCount, 5); i++) {
      const element = textElements.nth(i);
      await expect(element).toBeVisible();

      // Check if element has text content
      const text = await element.textContent();
      if (text && text.trim()) {
        const computedStyle = await element.evaluate((element) => {
          return window.getComputedStyle(element);
        });

        const color = computedStyle.color;
        const backgroundColor = computedStyle.backgroundColor;

        // Basic check that colors are defined
        expect(color).not.toBe('rgba(0, 0, 0, 0)');
        expect(color).not.toBe('transparent');
      }
    }
  });

  test('should have proper skip links', async ({ page }) => {
    // Look for skip links
    const skipLinks = page.locator('a[href^="#"]:not([href="#"])');
    const skipLinkCount = await skipLinks.count();

    if (skipLinkCount > 0) {
      const skipLink = skipLinks.first();

      // Skip link should be properly structured
      await expect(skipLink).toBeVisible();
      const href = await skipLink.getAttribute('href');
      expect(href).toBeTruthy();

      // Target should exist
      if (href && href.startsWith('#')) {
        const target = page.locator(href);
        if (await target.count() > 0) {
          await expect(target.first()).toBeVisible();
        }
      }
    }
  });

  test('should have proper table accessibility if tables exist', async ({ page }) => {
    const tables = page.locator('table');
    const tableCount = await tables.count();

    if (tableCount > 0) {
      const table = tables.first();

      // Check for table caption
      const caption = table.locator('caption');
      const captionText = await caption.textContent();
      expect(captionText?.trim()).toBeTruthy();

      // Check for table headers
      const headers = table.locator('th');
      const headerCount = await headers.count();
      expect(headerCount).toBeGreaterThan(0);

      // Check for scope attributes
      for (let i = 0; i < headerCount; i++) {
        const header = headers.nth(i);
        const scope = await header.getAttribute('scope');
        expect(scope).toMatch(/row|col|rowgroup|colgroup/);
      }
    }
  });

  test('should handle screen reader announcements', async ({ page }) => {
    // Check for aria-live regions
    const liveRegions = page.locator('[aria-live], [role="alert"], [role="status"]');
    const liveRegionCount = await liveRegions.count();

    // Should have live regions for dynamic content
    expect(liveRegionCount).toBeGreaterThan(0);

    // Test form status announcements
    const formStatus = page.locator('#form-status');
    if (await formStatus.isVisible()) {
      await expect(formStatus).toHaveAttribute('role', 'status');
      await expect(formStatus).toHaveAttribute('aria-live', 'polite');
    }
  });

  test('should be responsive and accessible on mobile', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667 },   // Mobile
      { width: 768, height: 1024 },   // Tablet
      { width: 1200, height: 800 }    // Desktop
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Check that main content is accessible
      const mainContent = page.locator('main, #main-content');
      await expect(mainContent).toBeVisible();

      // Check that navigation is accessible
      const nav = page.locator('nav').first();
      await expect(nav).toBeVisible();

      // Test keyboard navigation on mobile
      const focusableElements = page.locator(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])'
      );

      const elementCount = await focusableElements.count();
      expect(elementCount).toBeGreaterThan(0);

      // Test keyboard navigation
      for (let i = 0; i < Math.min(elementCount, 3); i++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(100);

        const activeElement = page.locator(':focus');
        await expect(activeElement).toBeVisible();
      }
    }
  });

  test('should have proper language attributes', async ({ page }) => {
    // Check HTML lang attribute
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');

    // Check for language changes if any
    const langElements = page.locator('[lang]');
    const langCount = await langElements.count();

    for (let i = 0; i < langCount; i++) {
      const element = langElements.nth(i);
      const lang = await element.getAttribute('lang');
      expect(lang).toBeTruthy();
      expect(lang?.length).toBeGreaterThan(1);
    }
  });
});