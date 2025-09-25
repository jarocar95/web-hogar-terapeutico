/**
 * Tests for contact form functionality
 */
import { initContactForm } from '../../src/ts/modules/contact-form';

describe('Contact Form', () => {
  let contactForm: HTMLFormElement;
  let formStatus: HTMLElement;
  let submitButton: HTMLButtonElement;

  beforeEach(() => {
    // Clear fetch mock
    (fetch as jest.Mock).mockClear();

    // Setup DOM elements
    document.body.innerHTML = `
      <form id="contactForm" action="https://formspree.io/f/test" method="POST">
        <input type="text" name="name" required>
        <input type="email" name="email" required>
        <textarea name="message" required></textarea>
        <button type="submit">Enviar</button>
      </form>
      <div id="form-status"></div>
    `;

    contactForm = document.getElementById('contactForm') as HTMLFormElement;
    formStatus = document.getElementById('form-status') as HTMLElement;
    submitButton = contactForm.querySelector('button[type="submit"]') as HTMLButtonElement;
  });

  test('should initialize contact form when elements exist', () => {
    initContactForm();

    expect(contactForm).not.toBeNull();
    expect(formStatus).not.toBeNull();
  });

  test('should return early if form is missing', () => {
    document.body.innerHTML = '<div id="form-status"></div>';

    initContactForm();

    // Should not throw error
    expect(true).toBe(true);
  });

  test('should show loading state on form submission', async () => {
    // Mock successful response
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
    });

    initContactForm();

    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    contactForm.dispatchEvent(submitEvent);

    expect(formStatus.innerHTML).toContain('Enviando...');
    expect(submitButton.disabled).toBe(true);
  });

  test('should handle successful form submission', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
    });

    initContactForm();

    // Mock console.error to avoid noise in tests
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    contactForm.dispatchEvent(submitEvent);

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(fetch).toHaveBeenCalledWith(
      'https://formspree.io/f/test',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Accept': 'application/json' }
      })
    );

    expect(formStatus.innerHTML).toContain('¡Gracias por tu mensaje!');
    expect(contactForm.querySelectorAll('input[value=""]').length).toBe(2); // Form should be reset

    consoleSpy.mockRestore();
  });

  test('should handle form submission error', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
    });

    initContactForm();

    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    contactForm.dispatchEvent(submitEvent);

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(formStatus.innerHTML).toContain('Oops! Hubo un problema');
  });

  test('should handle network error', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    initContactForm();

    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    contactForm.dispatchEvent(submitEvent);

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(formStatus.innerHTML).toContain('Oops! Hubo un problema');
  });

  test('should re-enable submit button and clear message after timeout', async () => {
    jest.useFakeTimers();

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
    });

    initContactForm();

    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    contactForm.dispatchEvent(submitEvent);

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(submitButton.disabled).toBe(true);

    // Fast-forward timeout
    jest.advanceTimersByTime(6000);

    expect(submitButton.disabled).toBe(false);
    expect(formStatus.innerHTML).toBe('');

    jest.useRealTimers();
  });
});