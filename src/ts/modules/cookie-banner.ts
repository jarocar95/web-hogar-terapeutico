/**
 * Cookie banner functionality
 * Handles GDPR compliant cookie consent banner
 */

export function initCookieBanner(): void {
    const cookieBanner = document.getElementById('cookie-consent-banner') as HTMLElement | null;
    const acceptCookiesBtn = document.getElementById('accept-cookies-btn') as HTMLButtonElement | null;

    if (!cookieBanner || !acceptCookiesBtn) {
        return;
    }

    // Function to grant consent to Google Analytics
    const grantConsent = (): void => {
        if (typeof window.gtag === 'function') {
            window.gtag('consent', 'update', {
                'analytics_storage': 'granted'
            });
            console.log('Consentimiento de Analytics otorgado.');
        }
    };

    // Check if cookies were already accepted
    if (localStorage.getItem('cookiesAccepted') === 'true') {
        grantConsent();
    } else {
        // Show banner for consent
        cookieBanner.classList.remove('hidden');
        cookieBanner.style.animationPlayState = 'running';
    }

    // Add event listener to accept button
    acceptCookiesBtn.addEventListener('click', () => {
        localStorage.setItem('cookiesAccepted', 'true');
        grantConsent();

        // Hide banner with smooth transition
        cookieBanner.style.transition = 'opacity 0.5s ease';
        cookieBanner.style.opacity = '0';
        setTimeout(() => {
            cookieBanner.style.display = 'none';
        }, 500);
    });
}