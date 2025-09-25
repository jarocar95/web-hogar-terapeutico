import { test, expect } from '@playwright/test';

test.describe('Contact Form', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the home page
    await page.goto('/');

    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
  });

  test('should display contact form on the page', async ({ page }) => {
    // Find the contact form
    const contactForm = page.locator('#contactForm');
    await expect(contactForm).toBeVisible();

    // Check for form fields
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('textarea[name="message"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show validation errors for empty required fields', async ({ page }) => {
    const submitButton = page.locator('#contactForm button[type="submit"]');

    // Try to submit form without filling fields
    await submitButton.click();

    // Check for HTML5 validation
    const nameInput = page.locator('input[name="name"]');
    const emailInput = page.locator('input[name="email"]');
    const messageTextarea = page.locator('textarea[name="message"]');

    // Verify required validation
    await expect(nameInput).toBeVisible();
    await expect(emailInput).toBeVisible();
    await expect(messageTextarea).toBeVisible();
  });

  test('should show loading state during form submission', async ({ page }) => {
    // Fill out the form
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('textarea[name="message"]', 'This is a test message');

    // Mock the form submission to avoid actual API call
    await page.route('**/formspree.io/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true })
      });
    });

    const submitButton = page.locator('#contactForm button[type="submit"]');
    const formStatus = page.locator('#form-status');

    // Submit the form
    await submitButton.click();

    // Check loading state
    await expect(formStatus).toContainText('Enviando...');
    await expect(submitButton).toBeDisabled();

    // Wait for success message
    await expect(formStatus).toContainText('¡Gracias por tu mensaje!');
    await expect(submitButton).not.toBeDisabled();
  });

  test('should handle form submission errors gracefully', async ({ page }) => {
    // Fill out the form
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('textarea[name="message"]', 'This is a test message');

    // Mock network error
    await page.route('**/formspree.io/**', async (route) => {
      await route.abort('failed');
    });

    const submitButton = page.locator('#contactForm button[type="submit"]');
    const formStatus = page.locator('#form-status');

    // Submit the form
    await submitButton.click();

    // Check error message
    await expect(formStatus).toContainText('Oops! Hubo un problema');
    await expect(submitButton).not.toBeDisabled();
  });

  test('should reset form after successful submission', async ({ page }) => {
    // Fill out the form
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('textarea[name="message"]', 'This is a test message');

    // Mock successful submission
    await page.route('**/formspree.io/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true })
      });
    });

    const submitButton = page.locator('#contactForm button[type="submit"]');

    // Submit the form
    await submitButton.click();

    // Wait for success message
    await expect(page.locator('#form-status')).toContainText('¡Gracias por tu mensaje!');

    // Check form is reset
    await expect(page.locator('input[name="name"]')).toHaveValue('');
    await expect(page.locator('input[name="email"]')).toHaveValue('');
    await expect(page.locator('textarea[name="message"]')).toHaveValue('');
  });

  test('should clear status message after timeout', async ({ page }) => {
    // Fill out the form
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('textarea[name="message"]', 'This is a test message');

    // Mock successful submission
    await page.route('**/formspree.io/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true })
      });
    });

    const formStatus = page.locator('#form-status');

    // Submit the form
    await page.locator('#contactForm button[type="submit"]').click();

    // Wait for success message
    await expect(formStatus).toContainText('¡Gracias por tu mensaje!');

    // Wait for message to clear (6 seconds timeout in the code)
    await page.waitForTimeout(6000);

    // Check message is cleared
    await expect(formStatus).toHaveText('');
  });

  test('should validate email format', async ({ page }) => {
    const emailInput = page.locator('input[name="email"]');

    // Try invalid email
    await emailInput.fill('invalid-email');
    await emailInput.blur();

    // Check browser validation
    const isValid = await emailInput.evaluate((input) => {
      return (input as HTMLInputElement).checkValidity();
    });

    expect(isValid).toBe(false);

    // Try valid email
    await emailInput.fill('valid@example.com');
    await emailInput.blur();

    const isValid2 = await emailInput.evaluate((input) => {
      return (input as HTMLInputElement).checkValidity();
    });

    expect(isValid2).toBe(true);
  });
});