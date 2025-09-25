/**
 * Loading states and skeleton screens module
 * Provides elegant loading indicators for various components
 */
export declare class LoadingStates {
    private loadingOverlay;
    private skeletonTemplates;
    constructor();
    init(): void;
    /**
     * Setup global loading overlay
     */
    setupGlobalLoadingOverlay(): void;
    /**
     * Setup skeleton templates for different content types
     */
    setupSkeletonTemplates(): void;
    /**
     * Setup image lazy loading with skeleton placeholders
     */
    setupImageLazyLoading(): void;
    /**
     * Load image with skeleton effect
     */
    loadImageWithSkeleton(img: HTMLImageElement): void;
    /**
     * Setup form loading states
     */
    setupFormLoadingStates(): void;
    /**
     * Show/hide global loading overlay
     */
    showGlobalLoading(show?: boolean, message?: string): void;
    /**
     * Create skeleton container for dynamic content
     */
    createSkeleton(type: string, count?: number): string;
    /**
     * Show skeleton in a container
     */
    showSkeleton(container: HTMLElement, type: string, count?: number): void;
    /**
     * Hide skeleton and show content
     */
    hideSkeleton(container: HTMLElement, content: string): void;
    /**
     * Set button loading state
     */
    setButtonLoading(button: HTMLButtonElement, loading: boolean): void;
    /**
     * Create progress indicator
     */
    createProgress(container: HTMLElement, total: number): void;
    /**
     * Update progress indicator
     */
    updateProgress(container: HTMLElement, current: number, total: number): void;
    /**
     * Create skeleton for calendar loading
     */
    createCalendarSkeleton(): string;
}
