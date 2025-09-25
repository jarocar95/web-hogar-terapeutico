/**
 * Tests for cookie banner functionality
 */
import { initCookieBanner } from '../../src/ts/modules/cookie-banner';

describe('Cookie Banner', () => {
  let cookieBanner: HTMLElement;
  let acceptCookiesBtn: HTMLButtonElement;

  beforeEach(() => {
    // Clear localStorage mock
    localStorage.clear();
    jest.clearAllMocks();

    // Setup DOM elements
    document.body.innerHTML = `
      <div id="cookie-consent-banner" class="hidden">
        <button id="accept-cookies-btn">Aceptar</button>
      </div>
    `;

    cookieBanner = document.getElementById('cookie-consent-banner') as HTMLElement;
    acceptCookiesBtn = document.getElementById('accept-cookies-btn') as HTMLButtonElement;
  });

  test('should initialize cookie banner when elements exist', () => {
    initCookieBanner();

    expect(cookieBanner).not.toBeNull();
    expect(acceptCookiesBtn).not.toBeNull();
  });

  test('should show banner if cookies not accepted', () => {
    (localStorage.getItem as jest.Mock).mockReturnValue(null);
    initCookieBanner();

    expect(cookieBanner.classList.contains('hidden')).toBe(false);
  });

  test('should grant consent if cookies already accepted', () => {
    (localStorage.getItem as jest.Mock).mockReturnValue('true');
    const gtagSpy = jest.fn();
    (window as any).gtag = gtagSpy;

    initCookieBanner();

    expect(gtagSpy).toHaveBeenCalledWith('consent', 'update', {
      'analytics_storage': 'granted'
    });
    expect(cookieBanner.classList.contains('hidden')).toBe(true);
  });

  test('should accept cookies when button is clicked', () => {
    initCookieBanner();

    // Mock gtag
    const gtagSpy = jest.fn();
    (window as any).gtag = gtagSpy;

    acceptCookiesBtn.click();

    expect(localStorage.setItem).toHaveBeenCalledWith('cookiesAccepted', 'true');
    expect(gtagSpy).toHaveBeenCalledWith('consent', 'update', {
      'analytics_storage': 'granted'
    });

    // Check banner is hidden with animation
    expect(cookieBanner.style.transition).toBe('opacity 0.5s ease');
    expect(cookieBanner.style.opacity).toBe('0');
  });

  test('should return early if elements are missing', () => {
    document.body.innerHTML = '';

    initCookieBanner();

    // Should not throw error
    expect(true).toBe(true);
  });

  test('should handle missing gtag function gracefully', () => {
    initCookieBanner();

    acceptCookiesBtn.click();

    // Should not throw error even without gtag
    expect(localStorage.setItem).toHaveBeenCalledWith('cookiesAccepted', 'true');
  });
});