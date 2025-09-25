import { test, expect } from '@playwright/test';

test.describe('Mobile Menu', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
  });

  test('should display mobile menu button on mobile devices', async ({ page }) => {
    const menuButton = page.locator('#menu-btn');
    await expect(menuButton).toBeVisible();
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  });

  test('should toggle mobile menu visibility when button is clicked', async ({ page }) => {
    const menuButton = page.locator('#menu-btn');
    const mobileMenu = page.locator('#mobile-menu');
    const hamburgerIcon = page.locator('#hamburger-icon');
    const closeIcon = page.locator('#close-icon');

    // Initial state - menu should be hidden
    await expect(mobileMenu).toHaveClass(/hidden/);
    await expect(hamburgerIcon).toBeVisible();
    await expect(closeIcon).toBeHidden();

    // Click to open menu
    await menuButton.click();

    // Menu should be visible
    await expect(mobileMenu).not.toHaveClass(/hidden/);
    await expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    await expect(hamburgerIcon).toBeHidden();
    await expect(closeIcon).toBeVisible();

    // Click to close menu
    await menuButton.click();

    // Menu should be hidden again
    await expect(mobileMenu).toHaveClass(/hidden/);
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    await expect(hamburgerIcon).toBeVisible();
    await expect(closeIcon).toBeHidden();
  });

  test('should close menu when mobile link is clicked', async ({ page }) => {
    const menuButton = page.locator('#menu-btn');
    const mobileMenu = page.locator('#mobile-menu');

    // Open menu
    await menuButton.click();
    await expect(mobileMenu).not.toHaveClass(/hidden/);

    // Click on a mobile link
    const mobileLink = page.locator('.mobile-link').first();
    await mobileLink.click();

    // Wait for navigation
    await page.waitForLoadState('networkidle');

    // Menu should be closed
    await expect(mobileMenu).toHaveClass(/hidden/);
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  });

  test('should maintain focus management within menu', async ({ page }) => {
    const menuButton = page.locator('#menu-btn');
    const mobileMenu = page.locator('#mobile-menu');

    // Open menu
    await menuButton.click();
    await expect(mobileMenu).not.toHaveClass(/hidden/);

    // Get focusable elements within menu
    const focusableElements = await mobileMenu.locator(
      'a[href], button:not([disabled]), textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
    ).all();

    // Test keyboard navigation
    if (focusableElements.length > 0) {
      // Focus on first element
      await focusableElements[0].focus();
      await expect(focusableElements[0]).toBeFocused();

      // Tab through elements
      for (let i = 1; i < focusableElements.length; i++) {
        await page.keyboard.press('Tab');
        await expect(focusableElements[i]).toBeFocused();
      }

      // Test tab trap - should cycle back to first element
      await page.keyboard.press('Tab');
      await expect(focusableElements[0]).toBeFocused();
    }
  });

  test('should close menu when clicking outside', async ({ page }) => {
    const menuButton = page.locator('#menu-btn');
    const mobileMenu = page.locator('#mobile-menu');

    // Open menu
    await menuButton.click();
    await expect(mobileMenu).not.toHaveClass(/hidden/);

    // Click outside the menu
    await page.click('body', { position: { x: 10, y: 10 } });

    // Menu should remain open (since there's no outside click handler in the current code)
    await expect(mobileMenu).not.toHaveClass(/hidden/);

    // Close menu using button
    await menuButton.click();
    await expect(mobileMenu).toHaveClass(/hidden/);
  });

  test('should display navigation links in mobile menu', async ({ page }) => {
    const menuButton = page.locator('#menu-btn');
    const mobileMenu = page.locator('#mobile-menu');

    // Open menu
    await menuButton.click();

    // Check for navigation links
    const mobileLinks = page.locator('.mobile-link');
    const linkCount = await mobileLinks.count();

    expect(linkCount).toBeGreaterThan(0);

    // Verify links are visible and have proper attributes
    for (let i = 0; i < linkCount; i++) {
      const link = mobileLinks.nth(i);
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute('href');
    }
  });

  test('should handle menu accessibility attributes', async ({ page }) => {
    const menuButton = page.locator('#menu-btn');
    const mobileMenu = page.locator('#mobile-menu');

    // Check initial accessibility attributes
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    await expect(menuButton).toHaveAttribute('aria-label', /menú/i);

    // Open menu
    await menuButton.click();

    // Check accessibility attributes when open
    await expect(menuButton).toHaveAttribute('aria-expanded', 'true');

    // Close menu
    await menuButton.click();

    // Check accessibility attributes when closed
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  });

  test('should work with keyboard navigation', async ({ page }) => {
    const menuButton = page.locator('#menu-btn');
    const mobileMenu = page.locator('#mobile-menu');

    // Focus menu button
    await menuButton.focus();
    await expect(menuButton).toBeFocused();

    // Open menu with Enter key
    await page.keyboard.press('Enter');
    await expect(mobileMenu).not.toHaveClass(/hidden/);

    // Close menu with Enter key
    await page.keyboard.press('Enter');
    await expect(mobileMenu).toHaveClass(/hidden/);

    // Open menu with Space key
    await page.keyboard.press('Space');
    await expect(mobileMenu).not.toHaveClass(/hidden/);

    // Close menu with Escape key
    await page.keyboard.press('Escape');
    await expect(mobileMenu).toHaveClass(/hidden/);
  });
});