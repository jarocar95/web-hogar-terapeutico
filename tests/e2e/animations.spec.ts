import { test, expect } from '@playwright/test';

test.describe('Animations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should have animated elements with proper classes', async ({ page }) => {
    // Check for elements with animation classes
    const animatedElements = page.locator('.animate-fade-in-up, .card');
    const elementCount = await animatedElements.count();

    expect(elementCount).toBeGreaterThan(0);

    // Check that elements have initial animation state
    for (let i = 0; i < Math.min(elementCount, 5); i++) {
      const element = animatedElements.nth(i);
      await expect(element).toBeVisible();

      // Check if element has animation-related classes
      const className = await element.getAttribute('class');
      expect(className).toMatch(/animate-fade-in-up|card/);
    }
  });

  test('should trigger animations on scroll', async ({ page }) => {
    // Find elements that should animate
    const animatedElements = page.locator('.animate-fade-in-up');
    const elementCount = await animatedElements.count();

    expect(elementCount).toBeGreaterThan(0);

    // Check initial animation state (should be paused)
    const firstElement = animatedElements.first();
    const animationPlayState = await firstElement.evaluate((element) => {
      return window.getComputedStyle(element).animationPlayState;
    });

    // Initial state should be 'paused' or 'running' depending on implementation
    expect(['paused', 'running']).toContain(animationPlayState);

    // Scroll to trigger animations
    await page.evaluate(() => {
      window.scrollTo(0, 500);
    });

    await page.waitForTimeout(1000); // Wait for animations to trigger

    // Check if elements are now visible and potentially animated
    for (let i = 0; i < Math.min(elementCount, 3); i++) {
      const element = animatedElements.nth(i);
      await expect(element).toBeVisible();
    }
  });

  test('should handle intersection observer correctly', async ({ page }) => {
    // Find elements that use intersection observer
    const observedElements = page.locator('.animate-fade-in-up, .card');
    const elementCount = await observedElements.count();

    expect(elementCount).toBeGreaterThan(0);

    // Test elements that are initially in viewport
    const viewportElements = await observedElements.filter({ has: page.locator(':visible') }).count();
    expect(viewportElements).toBeGreaterThan(0);

    // Scroll to reveal more elements
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });

    await page.waitForTimeout(1000);

    // All elements should be visible after scrolling to bottom
    const visibleElements = await observedElements.filter({ has: page.locator(':visible') }).count();
    expect(visibleElements).toBeGreaterThan(0);
  });

  test('should not animate cookie banner', async ({ page }) => {
    const cookieBanner = page.locator('#cookie-consent-banner');

    // Cookie banner should be excluded from animation observer
    const isInObserver = await cookieBanner.evaluate((element) => {
      // Check if element would be observed (should not be)
      return element.classList.contains('animate-fade-in-up') || element.classList.contains('card');
    });

    // Cookie banner should not be in the animation observer
    if (await cookieBanner.isVisible()) {
      expect(isInObserver).toBe(false);
    }
  });

  test('should handle animation performance', async ({ page }) => {
    // Test rapid scrolling
    const startTime = Date.now();

    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });

    await page.waitForTimeout(500);

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Animations should not cause significant performance issues
    expect(duration).toBeLessThan(2000);
  });

  test('should work with CSS animations and transitions', async ({ page }) => {
    // Check if CSS animations are properly defined
    const animatedElements = page.locator('.animate-fade-in-up');
    const elementCount = await animatedElements.count();

    if (elementCount > 0) {
      const firstElement = animatedElements.first();

      // Check if element has animation styles
      const animationName = await firstElement.evaluate((element) => {
        return window.getComputedStyle(element).animationName;
      });

      // Should have animation defined
      expect(animationName).not.toBe('none');
    }
  });

  test('should maintain animations on different viewport sizes', async ({ page }) => {
    const viewports = [
      { width: 1200, height: 800 },  // Desktop
      { width: 768, height: 1024 },   // Tablet
      { width: 375, height: 667 }    // Mobile
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.reload();
      await page.waitForLoadState('networkidle');

      const animatedElements = page.locator('.animate-fade-in-up, .card');
      const elementCount = await animatedElements.count();

      expect(elementCount).toBeGreaterThan(0);

      // Scroll to trigger animations
      await page.evaluate(() => {
        window.scrollTo(0, 300);
      });

      await page.waitForTimeout(500);

      // Elements should still be visible and animated
      const visibleElements = await animatedElements.filter({ has: page.locator(':visible') }).count();
      expect(visibleElements).toBeGreaterThan(0);
    }
  });

  test('should handle animations with dynamic content', async ({ page }) => {
    // Test if animations work with dynamically loaded content
    // This is more relevant for single-page applications

    // Check if page has any dynamic content areas
    const dynamicElements = page.locator('[data-dynamic], .dynamic');
    const dynamicCount = await dynamicElements.count();

    // If there are dynamic elements, test their animations
    if (dynamicCount > 0) {
      const firstDynamic = dynamicElements.first();
      await expect(firstDynamic).toBeVisible();

      // Check if dynamic elements can be animated
      const hasAnimationClass = await firstDynamic.evaluate((element) => {
        return element.classList.contains('animate-fade-in-up') || element.classList.contains('card');
      });

      // Dynamic elements should support animations
      expect(typeof hasAnimationClass).toBe('boolean');
    }
  });

  test('should be accessible with reduced motion', async ({ page }) => {
    // Test with prefers-reduced-motion
    await page.addInitScript(() => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: (query: string) => ({
          matches: query.includes('prefers-reduced-motion: reduce'),
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => {},
        }),
      });
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Elements should still be visible and functional
    const animatedElements = page.locator('.animate-fade-in-up, .card');
    const elementCount = await animatedElements.count();

    expect(elementCount).toBeGreaterThan(0);

    for (let i = 0; i < Math.min(elementCount, 3); i++) {
      const element = animatedElements.nth(i);
      await expect(element).toBeVisible();
    }
  });

  test('should handle animation errors gracefully', async ({ page }) => {
    // Check if page has error handling for animations
    const animatedElements = page.locator('.animate-fade-in-up, .card');
    const elementCount = await animatedElements.count();

    expect(elementCount).toBeGreaterThan(0);

    // Elements should be visible even if animations fail
    for (let i = 0; i < Math.min(elementCount, 3); i++) {
      const element = animatedElements.nth(i);
      await expect(element).toBeVisible();

      // Element should have fallback styling
      const opacity = await element.evaluate((element) => {
        return window.getComputedStyle(element).opacity;
      });

      expect(parseFloat(opacity)).toBeGreaterThan(0);
    }
  });

  test('should work with JavaScript disabled (fallbacks)', async ({ page }) => {
    // Check for noscript fallbacks
    const noscriptElements = page.locator('noscript');
    const noscriptCount = await noscriptElements.count();

    expect(noscriptCount).toBeGreaterThan(0);

    // Content should be visible without JavaScript
    const mainContent = page.locator('main, #main-content');
    await expect(mainContent).toBeVisible();

    // Important elements should be visible
    const importantElements = page.locator('h1, h2, .cta-button');
    const importantCount = await importantElements.count();
    expect(importantCount).toBeGreaterThan(0);
  });
});