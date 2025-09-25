/**
 * Animation functionality
 * Handles intersection observer for fade-in animations
 */

export function initAnimations(): void {
    const observer = new IntersectionObserver(
        (entries: IntersectionObserverEntry[], obs: IntersectionObserver) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const target = entry.target as HTMLElement;
                    target.style.animationPlayState = 'running';
                    obs.unobserve(target);
                }
            });
        },
        { threshold: 0.1 }
    );

    document.querySelectorAll('.animate-fade-in-up, .card').forEach((el) => {
        if (el.id !== 'cookie-consent-banner') {
            observer.observe(el);
        }
    });
}