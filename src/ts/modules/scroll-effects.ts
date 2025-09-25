/**
 * Scroll effects functionality
 * Handles header shrink and mobile CTA bar behavior
 */

export function initScrollEffects(): void {
    const header = document.getElementById('main-header') as HTMLElement | null;
    const body = document.body as HTMLBodyElement;
    const mobileCtaBar = document.getElementById('mobile-cta-bar') as HTMLElement | null;
    let lastScrollY = window.scrollY;

    if (!header || !body || !mobileCtaBar) {
        return;
    }

    // Debounce function to limit how often a function is called
    const debounce = <T extends (...args: any[]) => void>(
        func: T,
        delay: number
    ): ((...args: Parameters<T>) => void) => {
        let timeout: ReturnType<typeof setTimeout>;
        return function (this: any, ...args: Parameters<T>) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    };

    const debouncedCtaBarLogic = debounce((currentScrollY: number): void => {
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