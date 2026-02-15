export class TestimonialsCarousel {
    constructor() {
        this.init();
    }

    init() {
        const carousel = document.getElementById('testimonials-carousel');
        const prevBtn = document.getElementById('prev-testimonial');
        const nextBtn = document.getElementById('next-testimonial');
        const dotsContainer = document.getElementById('carousel-dots'); // Assuming a container for dots

        if (!carousel) {
            console.warn('Testimonials carousel element not found.');
            return;
        }

        let currentSlide = 0;
        const totalSlides = carousel.children.length;

        const updateCarousel = () => {
            carousel.style.transition = 'transform 0.7s ease-in-out';
            carousel.style.transform = `translateX(-${currentSlide * 100}%)`;
            updateDots();
        };

        const nextSlide = () => {
            currentSlide = (currentSlide + 1) % totalSlides;
            updateCarousel();
        };

        const prevSlide = () => {
            currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
            updateCarousel();
        };

        if (prevBtn) prevBtn.addEventListener('click', prevSlide);
        if (nextBtn) nextBtn.addEventListener('click', nextSlide);

        // Auto-play every 5 seconds
        setInterval(nextSlide, 5000);

        // Create dots if a container exists
        if (dotsContainer) {
            for (let i = 0; i < totalSlides; i++) {
                const dot = document.createElement('button');
                dot.classList.add('carousel-dot', 'w-3', 'h-3', 'rounded-full', 'bg-gray-300', 'transition-colors', 'duration-300');
                dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
                dot.addEventListener('click', () => {
                    currentSlide = i;
                    updateCarousel();
                });
                dotsContainer.appendChild(dot);
            }
        }

        const updateDots = () => {
            if (dotsContainer) {
                const dots = dotsContainer.querySelectorAll('.carousel-dot');
                dots.forEach((dot, index) => {
                    if (index === currentSlide) {
                        dot.classList.remove('bg-gray-300');
                        dot.classList.add('bg-accent');
                    } else {
                        dot.classList.remove('bg-accent');
                        dot.classList.add('bg-gray-300');
                    }
                });
            }
        };

        // Initial update
        updateCarousel();
    }
}
