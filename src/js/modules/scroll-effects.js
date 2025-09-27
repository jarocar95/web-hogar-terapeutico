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
        const showThreshold = 300;

        if (currentScrollY > showThreshold) {
            // Past threshold, show floating button
            mobileCtaBar.classList.remove('hidden');
            mobileCtaBar.offsetHeight; // Trigger reflow
            mobileCtaBar.classList.remove('opacity-0');
            mobileCtaBar.classList.remove('scale-95');
            mobileCtaBar.classList.add('scale-100');
        } else {
            // Near top, hide floating button
            mobileCtaBar.classList.add('opacity-0');
            mobileCtaBar.classList.remove('scale-100');
            mobileCtaBar.classList.add('scale-95');
            setTimeout(() => {
                mobileCtaBar.classList.add('hidden');
            }, 300);
        }
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