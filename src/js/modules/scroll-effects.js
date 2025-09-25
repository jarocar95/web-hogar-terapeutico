/**
 * Scroll effects functionality
 * Handles header shrink and mobile CTA bar behavior
 */
export function initScrollEffects() {
    const header = document.getElementById('main-header');
    const body = document.body;
    const mobileCtaBar = document.getElementById('mobile-cta-bar');
    let lastScrollY = window.scrollY;

    if (!header || !body || !mobileCtaBar) {
        return;
    }

    // Debounce function to limit how often a function is called
    const debounce = (func, delay) => {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    };

    const debouncedCtaBarLogic = debounce((currentScrollY) => {
        const newScrollThreshold = 150;

        if (currentScrollY > lastScrollY && currentScrollY > newScrollThreshold) {
            // Scrolling down and past threshold, show bar
            mobileCtaBar.classList.remove('hidden');
            mobileCtaBar.offsetHeight; // Trigger reflow
            mobileCtaBar.classList.remove('opacity-0');
        } else if (currentScrollY < 50) {
            // Scrolling up or near top, hide bar
            mobileCtaBar.classList.add('opacity-0');
            setTimeout(() => {
                mobileCtaBar.classList.add('hidden');
            }, 500);
        }
        lastScrollY = currentScrollY;
    }, 100);

    window.addEventListener('scroll', () => {
        debouncedCtaBarLogic(window.scrollY);
        const isScrolled = window.scrollY > 50;
        header.classList.toggle('h-16', isScrolled);
        header.classList.toggle('h-20', !isScrolled);
        header.classList.toggle('shadow-lg', isScrolled);
        body.classList.toggle('pt-16', isScrolled);
        body.classList.toggle('pt-20', !isScrolled);
    }, { passive: true });
}