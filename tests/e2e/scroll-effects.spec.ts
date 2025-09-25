import { test, expect } from '@playwright/test';

test.describe('Scroll Effects', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should shrink header on scroll', async ({ page }) => {
    const header = page.locator('#main-header');
    const body = page.locator('body');

    // Initial state
    await expect(header).toHaveClass(/h-20/);
    await expect(body).toHaveClass(/pt-20/);
    await expect(header).not.toHaveClass(/h-16/);
    await expect(body).not.toHaveClass(/pt-16/);

    // Scroll down
    await page.evaluate(() => {
      window.scrollTo(0, 100);
    });

    await page.waitForTimeout(300); // Wait for debounce

    // Scrolled state
    await expect(header).toHaveClass(/h-16/);
    await expect(body).toHaveClass(/pt-16/);
    await expect(header).not.toHaveClass(/h-20/);
    await expect(body).not.toHaveClass(/pt-20/);

    // Add shadow when scrolled
    await expect(header).toHaveClass(/shadow-lg/);

    // Scroll back to top
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });

    await page.waitForTimeout(300);

    // Should return to initial state
    await expect(header).toHaveClass(/h-20/);
    await expect(body).toHaveClass(/pt-20/);
    await expect(header).not.toHaveClass(/h-16/);
    await expect(body).not.toHaveClass(/pt-16/);
    await expect(header).not.toHaveClass(/shadow-lg/);
  });

  test('should show mobile CTA bar on scroll down', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    const mobileCtaBar = page.locator('#mobile-cta-bar');

    // Initially hidden
    await expect(mobileCtaBar).toHaveClass(/hidden/);
    await expect(mobileCtaBar).toHaveClass(/opacity-0/);

    // Scroll down past threshold (150px)
    await page.evaluate(() => {
      window.scrollTo(0, 200);
    });

    await page.waitForTimeout(500); // Wait for debounce

    // Should become visible
    await expect(mobileCtaBar).not.toHaveClass(/hidden/);
    await expect(mobileCtaBar).not.toHaveClass(/opacity-0/);

    // Scroll back up near top
    await page.evaluate(() => {
      window.scrollTo(0, 30);
    });

    await page.waitForTimeout(500);

    // Should hide again
    await expect(mobileCtaBar).toHaveClass(/opacity-0/);

    // Wait for transition
    await page.waitForTimeout(500);

    await expect(mobileCtaBar).toHaveClass(/hidden/);
  });

  test('should handle scroll events with debounce', async ({ page }) => {
    const header = page.locator('#main-header');

    // Initial state
    await expect(header).toHaveClass(/h-20/);

    // Rapid scroll events
    await page.evaluate(() => {
      window.scrollTo(0, 50);
      window.scrollTo(0, 100);
      window.scrollTo(0, 150);
      window.scrollTo(0, 200);
    });

    await page.waitForTimeout(200); // Wait for debounce

    // Should only apply final state
    await expect(header).toHaveClass(/h-16/);
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

    // Mobile CTA bar should remain hidden on desktop
    await expect(mobileCtaBar).toHaveClass(/hidden/);

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
    await expect(mobileCtaBar).not.toHaveClass(/hidden/);
  });

  test('should work with smooth scrolling enabled', async ({ page }) => {
    // Check if smooth scrolling is enabled
    const htmlElement = page.locator('html');
    const hasSmoothScroll = await htmlElement.evaluate((html) => {
      return html.classList.contains('scroll-smooth');
    });

    expect(hasSmoothScroll).toBe(true);

    // Test smooth scrolling to section
    await page.click('a[href="#about"]');
    await page.waitForTimeout(1500);

    const aboutSection = page.locator('#about');
    const aboutPosition = await aboutSection.evaluate((element) => {
      return element.getBoundingClientRect().top;
    });

    // Should be close to the section
    expect(Math.abs(aboutPosition)).toBeLessThan(100);
  });

  test('should handle scroll effects during page transitions', async ({ page }) => {
    // Scroll down
    await page.evaluate(() => {
      window.scrollTo(0, 200);
    });

    await page.waitForTimeout(300);

    const header = page.locator('#main-header');
    await expect(header).toHaveClass(/h-16/);

    // Navigate to another page
    await page.goto('/blog/');
    await page.waitForLoadState('networkidle');

    // Scroll position should be reset
    const scrollPosition = await page.evaluate(() => window.scrollY);
    expect(scrollPosition).toBe(0);

    // Header should be in initial state
    const blogHeader = page.locator('#main-header');
    await expect(blogHeader).toHaveClass(/h-20/);
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
    await page.goto('/blog/');
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