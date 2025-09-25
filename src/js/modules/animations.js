/**
 * Animation functionality
 * Handles intersection observer for fade-in animations
 */
export function initAnimations() {
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.animate-fade-in-up, .card').forEach(el => {
        if (el.id !== 'cookie-consent-banner') {
            observer.observe(el);
        }
    });
}