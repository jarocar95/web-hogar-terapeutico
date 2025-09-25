import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should navigate to different sections using anchor links', async ({ page }) => {
    const sections = [
      { name: 'About', selector: '#about' },
      { name: 'Services', selector: '#services-pricing' },
      { name: 'Contact', selector: '#contact' }
    ];

    for (const section of sections) {
      // Find and click navigation link
      const navLink = page.locator(`a[href="${section.selector}"]`).first();
      if (await navLink.isVisible()) {
        await navLink.click();
        await page.waitForTimeout(500); // Wait for smooth scroll

        // Check if URL contains the hash
        expect(page.url()).toContain(section.selector);

        // Check if section is visible in viewport
        const sectionElement = page.locator(section.selector);
        await expect(sectionElement).toBeVisible();

        // Check if section is in viewport
        const isInViewport = await sectionElement.evaluate((element) => {
          const rect = element.getBoundingClientRect();
          return rect.top >= 0 && rect.left >= 0;
        });
        expect(isInViewport).toBe(true);
      }
    }
  });

  test('should navigate between different pages', async ({ page }) => {
    const pages = [
      { name: 'Home', path: '/' },
      { name: 'Blog', path: '/blog/' },
      { name: 'Privacy Policy', path: '/politica-privacidad/' },
      { name: 'Legal Notice', path: '/aviso-legal/' },
      { name: 'Cookie Policy', path: '/politica-cookies/' }
    ];

    for (const pageInfo of pages) {
      await page.goto(pageInfo.path);
      await page.waitForLoadState('networkidle');

      // Check if page loaded successfully
      await expect(page).toHaveURL(new RegExp(pageInfo.path.replace('/', '\\/')));

      // Check if main content is visible
      const mainContent = page.locator('main, #main-content');
      await expect(mainContent).toBeVisible();

      // Check if page has proper title
      const title = await page.title();
      expect(title).toContain('Hogar Terapéutico');
    }
  });

  test('should maintain consistent navigation across pages', async ({ page }) => {
    const pages = ['/', '/blog/', '/politica-privacidad/'];

    for (const pagePath of pages) {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');

      // Check if header is present
      const header = page.locator('header');
      await expect(header).toBeVisible();

      // Check if main navigation is present
      const mainNav = page.locator('nav').first();
      await expect(mainNav).toBeVisible();

      // Check if navigation links are working
      const navLinks = mainNav.locator('a[href]');
      const linkCount = await navLinks.count();
      expect(linkCount).toBeGreaterThan(0);

      // Check if footer is present
      const footer = page.locator('footer');
      await expect(footer).toBeVisible();
    }
  });

  test('should handle browser navigation buttons', async ({ page }) => {
    // Navigate to blog page
    await page.click('a[href="/blog/"]');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/blog/');

    // Navigate to privacy policy
    await page.click('a[href="/politica-privacidad/"]');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/politica-privacidad/');

    // Use browser back button
    await page.goBack();
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/blog/');

    // Use browser forward button
    await page.goForward();
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/politica-privacidad/');
  });

  test('should work with smooth scrolling', async ({ page }) => {
    // Test smooth scrolling to sections
    await page.click('a[href="#about"]');
    await page.waitForTimeout(1000);

    const aboutSection = page.locator('#about');
    const aboutPosition = await aboutSection.evaluate((element) => {
      return element.getBoundingClientRect().top;
    });

    // Should be scrolled close to the section (within 100px)
    expect(Math.abs(aboutPosition)).toBeLessThan(100);
  });

  test('should maintain scroll position on navigation', async ({ page }) => {
    // Scroll down the page
    await page.evaluate(() => {
      window.scrollTo(0, 500);
    });

    // Wait for scroll to complete
    await page.waitForTimeout(500);

    const scrollPosition = await page.evaluate(() => window.scrollY);
    expect(scrollPosition).toBeGreaterThan(400);

    // Navigate to another page and back
    await page.goto('/blog/');
    await page.waitForLoadState('networkidle');
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Scroll position should be reset to top
    const newScrollPosition = await page.evaluate(() => window.scrollY);
    expect(newScrollPosition).toBe(0);
  });

  test('should handle mobile navigation correctly', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Mobile navigation menu should be visible
    const mobileMenuButton = page.locator('#menu-btn');
    await expect(mobileMenuButton).toBeVisible();

    // Desktop navigation might be hidden
    const desktopNav = page.locator('nav').first();
    const isDesktopNavVisible = await desktopNav.isVisible();

    // Open mobile menu
    await mobileMenuButton.click();
    await page.waitForTimeout(500);

    // Mobile menu should be open
    const mobileMenu = page.locator('#mobile-menu');
    await expect(mobileMenu).toBeVisible();
    await expect(mobileMenu).not.toHaveClass(/hidden/);

    // Test mobile navigation links
    const mobileLinks = mobileMenu.locator('a[href]');
    const mobileLinkCount = await mobileLinks.count();
    expect(mobileLinkCount).toBeGreaterThan(0);

    // Test clicking a mobile link
    if (mobileLinkCount > 0) {
      const firstLink = mobileLinks.first();
      const href = await firstLink.getAttribute('href');

      await firstLink.click();
      await page.waitForLoadState('networkidle');

      // Should navigate to the correct page
      if (href && href.startsWith('/')) {
        expect(page.url()).toContain(href);
      }
    }
  });

  test('should have proper navigation accessibility', async ({ page }) => {
    const navLinks = page.locator('nav a[href]');
    const linkCount = await navLinks.count();

    for (let i = 0; i < linkCount; i++) {
      const link = navLinks.nth(i);

      // Check if link has proper text
      const linkText = await link.textContent();
      expect(linkText?.trim()).toBeTruthy();

      // Check if link has proper href
      const href = await link.getAttribute('href');
      expect(href).toBeTruthy();

      // Check if link is keyboard accessible
      await link.focus();
      await expect(link).toBeFocused();

      // Test Enter key
      if (href && !href.startsWith('#')) {
        const originalUrl = page.url();
        await page.keyboard.press('Enter');
        await page.waitForLoadState('networkidle');

        // Should navigate to new page
        expect(page.url()).not.toBe(originalUrl);

        // Go back for next test
        await page.goBack();
        await page.waitForLoadState('networkidle');
      }
    }
  });

  test('should handle broken navigation links gracefully', async ({ page }) => {
    // Test navigation to non-existent page
    await page.goto('/non-existent-page/');

    // Should still show some content (404 page or redirect)
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should have working skip links for accessibility', async ({ page }) => {
    // Look for skip links
    const skipLinks = page.locator('a[href^="#"]:not([href="#"])');
    const skipLinkCount = await skipLinks.count();

    if (skipLinkCount > 0) {
      const skipLink = skipLinks.first();

      // Skip link should be visible when focused
      await skipLink.focus();
      await expect(skipLink).toBeVisible();

      // Test skip link functionality
      const href = await skipLink.getAttribute('href');
      if (href) {
        await skipLink.click();

        // Should scroll to target
        await page.waitForTimeout(500);

        const target = page.locator(href);
        if (await target.count() > 0) {
          await expect(target.first()).toBeVisible();
        }
      }
    }
  });
});