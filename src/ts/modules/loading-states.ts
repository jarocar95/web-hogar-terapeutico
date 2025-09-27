/**
 * Loading states and skeleton screens module
 * Provides elegant loading indicators for various components
 */

export class LoadingStates {
    private loadingOverlay: HTMLElement | null = null;
    private skeletonTemplates: Map<string, string> = new Map();

    constructor() {
        this.init();
    }

    init() {
        this.setupGlobalLoadingOverlay();
        this.setupSkeletonTemplates();
        this.setupImageLazyLoading();
        this.setupFormLoadingStates();
    }

    /**
     * Setup global loading overlay
     */
    setupGlobalLoadingOverlay() {
        this.loadingOverlay = document.createElement('div');
        this.loadingOverlay.className = 'fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center hidden';
        this.loadingOverlay.innerHTML = `
            <div class="bg-white rounded-lg p-6 shadow-xl flex flex-col items-center">
                <div class="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
                <p class="text-text font-medium">Cargando...</p>
            </div>
        `;
        document.body.appendChild(this.loadingOverlay);
    }

    /**
     * Setup skeleton templates for different content types
     */
    setupSkeletonTemplates() {
        // Blog post skeleton
        this.skeletonTemplates.set('blog-post', `
            <div class="skeleton-blog-post">
                <div class="skeleton skeleton-h-48 skeleton-rounded-lg mb-4"></div>
                <div class="skeleton skeleton-h-6 skeleton-rounded skeleton-w-3/4 mb-2"></div>
                <div class="skeleton skeleton-h-4 skeleton-rounded skeleton-w-full mb-2"></div>
                <div class="skeleton skeleton-h-4 skeleton-rounded skeleton-w-5/6 mb-4"></div>
                <div class="flex items-center gap-2">
                    <div class="skeleton skeleton-h-8 skeleton-w-8 skeleton-rounded-full"></div>
                    <div class="skeleton skeleton-h-4 skeleton-rounded skeleton-w-24"></div>
                </div>
            </div>
        `);

        // Service card skeleton
        this.skeletonTemplates.set('service-card', `
            <div class="skeleton-service-card">
                <div class="skeleton skeleton-h-12 skeleton-w-12 skeleton-rounded-lg mb-4"></div>
                <div class="skeleton skeleton-h-6 skeleton-rounded skeleton-w-3/4 mb-3"></div>
                <div class="skeleton skeleton-h-4 skeleton-rounded skeleton-w-full mb-2"></div>
                <div class="skeleton skeleton-h-4 skeleton-rounded skeleton-w-5/6"></div>
            </div>
        `);

        // Calendar skeleton
        this.skeletonTemplates.set('calendar', `
            <div class="skeleton-calendar">
                <div class="skeleton skeleton-h-8 skeleton-rounded mb-4"></div>
                <div class="grid grid-cols-7 gap-2 mb-4">
                    ${Array.from({ length: 7 }, () => '<div class="skeleton skeleton-h-8 skeleton-rounded"></div>').join('')}
                </div>
                <div class="grid grid-cols-7 gap-2">
                    ${Array.from({ length: 35 }, () => '<div class="skeleton skeleton-h-12 skeleton-rounded"></div>').join('')}
                </div>
            </div>
        `);

        // Testimonial skeleton
        this.skeletonTemplates.set('testimonial', `
            <div class="skeleton-testimonial">
                <div class="flex items-center gap-3 mb-4">
                    <div class="skeleton skeleton-h-12 skeleton-w-12 skeleton-rounded-full"></div>
                    <div>
                        <div class="skeleton skeleton-h-5 skeleton-rounded skeleton-w-32 mb-1"></div>
                        <div class="skeleton skeleton-h-4 skeleton-rounded skeleton-w-24"></div>
                    </div>
                </div>
                <div class="skeleton skeleton-h-4 skeleton-rounded skeleton-w-full mb-2"></div>
                <div class="skeleton skeleton-h-4 skeleton-rounded skeleton-w-full mb-2"></div>
                <div class="skeleton skeleton-h-4 skeleton-rounded skeleton-w-3/4"></div>
            </div>
        `);
    }

    /**
     * Setup image lazy loading with skeleton placeholders
     */
    setupImageLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');

        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target as HTMLImageElement;
                    this.loadImageWithSkeleton(img);
                    imageObserver.unobserve(img);
                }
            });
        }, { threshold: 0.1 });

        images.forEach(img => {
            // Create skeleton placeholder
            const skeleton = document.createElement('div');
            skeleton.className = 'skeleton skeleton-h-full skeleton-w-full skeleton-rounded';
            skeleton.style.position = 'absolute';
            skeleton.style.inset = '0';

            const wrapper = document.createElement('div');
            wrapper.className = 'relative overflow-hidden';
            wrapper.style.aspectRatio = img.getAttribute('data-aspect-ratio') || '16/9';

            // Replace img with wrapper
            img.parentNode?.replaceChild(wrapper, img);
            wrapper.appendChild(skeleton);
            wrapper.appendChild(img);

            (img as HTMLImageElement).style.opacity = '0';
            (img as HTMLImageElement).style.transition = 'opacity 0.3s ease-in-out';

            imageObserver.observe(img);
        });
    }

    /**
     * Load image with skeleton effect
     */
    loadImageWithSkeleton(img: HTMLImageElement) {
        const skeleton = img.previousElementSibling as HTMLElement;
        const src = img.getAttribute('data-src');

        if (!src) return;

        img.onload = () => {
            img.style.opacity = '1';
            setTimeout(() => {
                skeleton?.remove();
            }, 300);
        };

        img.onerror = () => {
            // Show error state
            if (skeleton) {
                skeleton.className = 'bg-gray-200 flex items-center justify-center';
                skeleton.innerHTML = '<i class="ri-image-line text-gray-400 text-2xl"></i>';
            }
        };

        img.src = src;
        img.removeAttribute('data-src');
    }

    /**
     * Setup form loading states
     */
    setupFormLoadingStates() {
        const forms = document.querySelectorAll('form[data-loading-state]');

        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                const formData = new FormData(form as HTMLFormElement);
                const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement;

                if (submitButton) {
                    this.setButtonLoading(submitButton, true);

                    // Simulate form submission (you would replace this with actual form submission)
                    setTimeout(() => {
                        this.setButtonLoading(submitButton, false);
                    }, 2000);
                }
            });
        });
    }

    /**
     * Show/hide global loading overlay
     */
    showGlobalLoading(show: boolean = true, message: string = 'Cargando...') {
        if (!this.loadingOverlay) return;

        if (show) {
            const messageElement = this.loadingOverlay.querySelector('p');
            if (messageElement) {
                messageElement.textContent = message;
            }
            this.loadingOverlay.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        } else {
            this.loadingOverlay.classList.add('hidden');
            document.body.style.overflow = '';
        }
    }

    /**
     * Create skeleton container for dynamic content
     */
    createSkeleton(type: string, count: number = 1): string {
        const template = this.skeletonTemplates.get(type) || '';
        return Array.from({ length: count }, () => template).join('');
    }

    /**
     * Show skeleton in a container
     */
    showSkeleton(container: HTMLElement, type: string, count: number = 1) {
        container.innerHTML = this.createSkeleton(type, count);
        container.classList.add('skeleton-loading');
    }

    /**
     * Hide skeleton and show content
     */
    hideSkeleton(container: HTMLElement, content: string) {
        container.classList.remove('skeleton-loading');
        container.innerHTML = content;

        // Trigger animations for new content
        const animatedElements = container.querySelectorAll('section, .card, .service-card');
        animatedElements.forEach(el => {
            ScrollAnimations.addRevealAnimation(el as HTMLElement, 'slide');
        });
    }

    /**
     * Set button loading state
     */
    setButtonLoading(button: HTMLButtonElement, loading: boolean) {
        if (loading) {
            const originalText = button.innerHTML;
            button.setAttribute('data-original-text', originalText);
            button.disabled = true;
            button.innerHTML = `
                <div class="flex items-center gap-2">
                    <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Procesando...</span>
                </div>
            `;
            button.classList.add('opacity-75', 'cursor-not-allowed');
        } else {
            const originalText = button.getAttribute('data-original-text');
            if (originalText) {
                button.innerHTML = originalText;
            }
            button.disabled = false;
            button.classList.remove('opacity-75', 'cursor-not-allowed');
        }
    }

    /**
     * Create progress indicator
     */
    createProgress(container: HTMLElement, total: number): void {
        container.innerHTML = `
            <div class="progress-container">
                <div class="flex justify-between items-center mb-2">
                    <span class="text-sm font-medium text-text">Progreso</span>
                    <span class="text-sm text-text-muted">0/${total}</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-primary h-2 rounded-full" style="width: 0%"></div>
                </div>
            </div>
        `;
    }

    /**
     * Update progress indicator
     */
    updateProgress(container: HTMLElement, current: number, total: number): void {
        const progressBar = container.querySelector('.bg-primary') as HTMLElement;
        const progressText = container.querySelector('.text-text-muted') as HTMLElement;

        if (progressBar && progressText) {
            const percentage = (current / total) * 100;
            progressBar.style.width = `${percentage}%`;
            progressText.textContent = `${current}/${total}`;
        }
    }

    /**
     * Create skeleton for calendar loading
     */
    createCalendarSkeleton(): string {
        return `
            <div class="calendar-skeleton">
                <div class="animate-pulse">
                    <div class="bg-gray-200 h-12 rounded-lg mb-4"></div>
                    <div class="grid grid-cols-7 gap-2 mb-4">
                        ${Array.from({ length: 7 }, () => '<div class="bg-gray-200 h-8 rounded"></div>').join('')}
                    </div>
                    <div class="grid grid-cols-7 gap-2">
                        ${Array.from({ length: 35 }, () => '<div class="bg-gray-200 h-12 rounded"></div>').join('')}
                    </div>
                </div>
            </div>
        `;
    }
}

// Import ScrollAnimations for type reference
declare const ScrollAnimations: any;