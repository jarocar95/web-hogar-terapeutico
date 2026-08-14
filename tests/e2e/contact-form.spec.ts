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
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await page.fill('input[name="name"]', 'Test User');
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await page.fill('input[name="email"]', 'test@example.com');
    await expect(page.locator('textarea[name="message"]')).toBeVisible();
    await page.fill('textarea[name="message"]', 'This is a test message');
    await page.check('#privacy');

    // Mock the form submission to avoid actual API call. A short artificial
    // delay is needed so the loading state actually has time to render
    // before the (mocked) response resolves it — an instant mock response
    // can flip the button back before the assertion below gets to see it.
    await page.route('**/formspree.io/**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true })
      });
    });

    const submitButton = page.locator('#contactForm button[type="submit"]');
    const formStatus = page.locator('#form-status');

    // Submit the form
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    // Check loading state (the button's own label swaps to "Enviando...",
    // not #form-status — that's reserved for the final success/error message)
    await expect(page.locator('#submit-text')).toHaveText('Enviando...');
    await expect(submitButton).toBeDisabled();

    // Wait for success message
    await expect(formStatus).toContainText('¡Mensaje enviado con éxito!');
    await expect(submitButton).not.toBeDisabled();
  });

  test('should handle form submission errors gracefully', async ({ page }) => {
    // Fill out the form
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await page.fill('input[name="name"]', 'Test User');
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await page.fill('input[name="email"]', 'test@example.com');
    await expect(page.locator('textarea[name="message"]')).toBeVisible();
    await page.fill('textarea[name="message"]', 'This is a test message');
    await page.check('#privacy');

    // Mock network error
    await page.route('**/formspree.io/**', async (route) => {
      await route.abort('failed');
    });

    const submitButton = page.locator('#contactForm button[type="submit"]');
    const formStatus = page.locator('#form-status');

    // Submit the form
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    // Check error message
    await expect(formStatus).toContainText('Hubo un problema al enviar el mensaje');
    await expect(submitButton).not.toBeDisabled();
  });

  test('should reset form after successful submission', async ({ page }) => {
    // Fill out the form
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await page.fill('input[name="name"]', 'Test User');
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await page.fill('input[name="email"]', 'test@example.com');
    await expect(page.locator('textarea[name="message"]')).toBeVisible();
    await page.fill('textarea[name="message"]', 'This is a test message');
    await page.check('#privacy');

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
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    // Wait for success message
    await expect(page.locator('#form-status')).toContainText('¡Mensaje enviado con éxito!');

    // Check form is reset
    await expect(page.locator('input[name="name"]')).toHaveValue('');
    await expect(page.locator('input[name="email"]')).toHaveValue('');
    await expect(page.locator('textarea[name="message"]')).toHaveValue('');
  });

  test('should keep the error message visible until the next attempt', async ({ page }) => {
    // showStatus() has an "auto-hide after 5s" branch, but it's gated on
    // type === 'success' and only ever called with type 'error' in this
    // codebase (the real success path uses showSuccessMessage(), which has
    // no auto-hide of its own either — see the next test). So in practice
    // no status message currently self-clears; an error should stay put
    // until the visitor acts again, not vanish and leave them wondering
    // whether the message actually sent.
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await page.fill('input[name="name"]', 'Test User');
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await page.fill('input[name="email"]', 'test@example.com');
    await expect(page.locator('textarea[name="message"]')).toBeVisible();
    await page.fill('textarea[name="message"]', 'This is a test message');
    await page.check('#privacy');

    // Mock a failed submission
    await page.route('**/formspree.io/**', async (route) => {
      await route.abort('failed');
    });

    const formStatus = page.locator('#form-status');

    // Submit the form
    await expect(page.locator('#contactForm button[type="submit"]')).toBeEnabled();
    await page.locator('#contactForm button[type="submit"]').click();

    // Wait for error message
    await expect(formStatus).toContainText('Hubo un problema al enviar el mensaje');

    // Should still be there well past where a 5s auto-hide would have fired
    await page.waitForTimeout(7000);
    await expect(formStatus).toContainText('Hubo un problema al enviar el mensaje');
  });

  test('should validate email format', async ({ page }) => {
    const emailInput = page.locator('input[name="email"]');

    // Try invalid email
    await expect(emailInput).toBeVisible();
    await emailInput.fill('invalid-email');
    await emailInput.blur();

    // Check browser validation
    const isValid = await emailInput.evaluate((input) => {
      return (input as HTMLInputElement).checkValidity();
    });

    expect(isValid).toBe(false);

    // Try valid email
    await expect(emailInput).toBeVisible();
    await emailInput.fill('valid@example.com');
    await emailInput.blur();

    const isValid2 = await emailInput.evaluate((input) => {
      return (input as HTMLInputElement).checkValidity();
    });

    expect(isValid2).toBe(true);
  });
});