/**
 * Enhanced contact form with real-time validation and improved UX
 */
export declare class EnhancedContactForm {
    private form;
    private formStatus;
    private submitButton;
    private submitText;
    private submitSpinner;
    private progressBar;
    private progressText;
    private fields;
    private charCount;
    constructor();
    init(): void;
    /**
     * Setup real-time validation with visual feedback
     */
    setupRealTimeValidation(): void;
    /**
     * Validate individual field and show feedback
     */
    validateField(fieldName: string, validator: (value: any) => string | null): boolean;
    /**
     * Setup progress bar for form completion
     */
    setupProgressBar(): void;
    /**
     * Setup character counter for message field
     */
    setupCharacterCounter(): void;
    /**
     * Setup enhanced form submission
     */
    setupEnhancedSubmission(): void;
    /**
     * Setup field animations and interactions
     */
    setupFieldAnimations(): void;
    /**
     * Set loading state for form submission
     */
    setLoadingState(loading: boolean): void;
    /**
     * Show enhanced status messages
     */
    showStatus(message: string, type: 'error' | 'success'): void;
    /**
     * Show success message with additional actions
     */
    showSuccessMessage(): void;
    /**
     * Update progress bar
     */
    updateProgress(): void;
}
