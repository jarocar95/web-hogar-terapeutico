/**
 * Tests for cookie banner functionality
 */
import { initCookieBanner, esDominioDeProduccion } from '../../src/ts/modules/cookie-banner';

describe('Cookie Banner', () => {
  let cookieBanner: HTMLElement;
  let acceptCookiesBtn: HTMLButtonElement;
  let rejectCookiesBtn: HTMLButtonElement;

  beforeEach(() => {
    // Spy on localStorage methods and mock them
    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(null); // Default to no cookies accepted
    jest.spyOn(Storage.prototype, 'setItem');
    jest.spyOn(Storage.prototype, 'removeItem');

    // Clear mocks before each test
    jest.clearAllMocks();

    // Setup DOM elements
    document.body.innerHTML = `
      <div id="cookie-consent-banner" class="hidden">
        <button id="reject-cookies-btn">Rechazar</button>
        <button id="accept-cookies-btn">Aceptar</button>
      </div>
      <button id="cookie-settings-link">Preferencias de cookies</button>
    `;

    cookieBanner = document.getElementById('cookie-consent-banner') as HTMLElement;
    acceptCookiesBtn = document.getElementById('accept-cookies-btn') as HTMLButtonElement;
    rejectCookiesBtn = document.getElementById('reject-cookies-btn') as HTMLButtonElement;
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

  test('should reject cookies when reject button is clicked', () => {
    const gtagSpy = jest.fn();
    (window as any).gtag = gtagSpy;

    initCookieBanner();
    rejectCookiesBtn.click();

    expect(localStorage.setItem).toHaveBeenCalledWith('cookieConsent', 'denied');
    expect(localStorage.removeItem).toHaveBeenCalledWith('cookiesAccepted');
    expect(gtagSpy).toHaveBeenCalledWith('consent', 'update', {
      analytics_storage: 'denied'
    });
  });

  test('should not show the banner again after rejecting', () => {
    (localStorage.getItem as jest.Mock).mockImplementation((key: string) =>
      key === 'cookieConsent' ? 'denied' : null
    );

    initCookieBanner();

    expect(cookieBanner.classList.contains('hidden')).toBe(true);
  });

  test('should keep analytics denied for a returning visitor who rejected', () => {
    (localStorage.getItem as jest.Mock).mockImplementation((key: string) =>
      key === 'cookieConsent' ? 'denied' : null
    );
    const gtagSpy = jest.fn();
    (window as any).gtag = gtagSpy;

    initCookieBanner();

    expect(gtagSpy).toHaveBeenCalledWith('consent', 'update', {
      analytics_storage: 'denied'
    });
  });

  test('should reopen the banner from the footer preferences link', () => {
    (localStorage.getItem as jest.Mock).mockImplementation((key: string) =>
      key === 'cookieConsent' ? 'granted' : null
    );

    initCookieBanner();
    expect(cookieBanner.classList.contains('hidden')).toBe(true);

    (document.getElementById('cookie-settings-link') as HTMLElement).click();

    expect(cookieBanner.classList.contains('hidden')).toBe(false);
  });

  // Los tests de navegador aceptan las cookies contra localhost con el ID real
  // de la propiedad: si Analytics se cargase ahi, cada pasada contaria como
  // visitas en los datos de Angie.
  test('solo carga Analytics en el dominio real', () => {
    expect(esDominioDeProduccion('hogarterapeutico.com')).toBe(true);
    expect(esDominioDeProduccion('www.hogarterapeutico.com')).toBe(true);
    expect(esDominioDeProduccion('localhost')).toBe(false);
    expect(esDominioDeProduccion('127.0.0.1')).toBe(false);
    expect(esDominioDeProduccion('deploy-preview-12--hogarterapeutico.netlify.app')).toBe(false);
  });

  test('aceptar en localhost no pide gtag.js', () => {
    (window as any).__ANALYTICS_ID = 'G-TEST';
    (window as any).gtag = jest.fn();

    initCookieBanner();
    acceptCookiesBtn.click();

    expect(document.querySelector('script[data-analytics]')).toBeNull();
    // El consentimiento si se registra: lo unico que no ocurre es la carga.
    expect((window as any).gtag).toHaveBeenCalledWith('consent', 'update', {
      analytics_storage: 'granted'
    });
  });
});
