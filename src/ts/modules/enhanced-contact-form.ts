/**
 * Enhanced contact form with real-time validation and improved UX
 */
export class EnhancedContactForm {
    private form: HTMLFormElement | null;
    private formStatus: HTMLElement | null;
    private submitButton: HTMLButtonElement | null;
    private submitText: HTMLElement | null;
    private submitSpinner: HTMLElement | null;
    private progressBar: HTMLElement | null;
    private progressText: HTMLElement | null;
    private fields: { [key: string]: HTMLInputElement | HTMLTextAreaElement | null } = {
        name: null,
        email: null,
        message: null,
        privacy: null
    };
    private charCount: HTMLElement | null;

    constructor() {
        this.form = document.getElementById('contactForm') as HTMLFormElement;
        this.formStatus = document.getElementById('form-status');
        this.submitButton = document.getElementById('submit-button') as HTMLButtonElement;
        this.submitText = document.getElementById('submit-text');
        this.submitSpinner = document.getElementById('submit-spinner');

        this.progressBar = document.getElementById('form-progress-bar');
        this.progressText = document.getElementById('form-progress-text');

        this.fields.name = document.getElementById('name') as HTMLInputElement;
        this.fields.email = document.getElementById('email') as HTMLInputElement;
        this.fields.message = document.getElementById('message') as HTMLTextAreaElement;
        this.fields.privacy = document.getElementById('privacy') as HTMLInputElement;

        this.charCount = document.getElementById('char-count');

        if (this.form) {
            this.init();
        }
    }

    init() {
        this.setupRealTimeValidation();
        this.setupProgressBar();
        this.setupCharacterCounter();
        this.setupEnhancedSubmission();
        this.setupFieldAnimations();
    }

    /**
     * Setup real-time validation with visual feedback
     */
    setupRealTimeValidation() {
        const validators: { [key: string]: (value: any) => string | null } = {
            name: (value: string): string | null => {
                if (!value.trim()) return 'El nombre es obligatorio';
                if (value.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres';
                if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/.test(value)) return 'El nombre solo puede contener letras y espacios';
                return null;
            },
            email: (value: string): string | null => {
                if (!value.trim()) return 'El email es obligatorio';
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) return 'Por favor, introduce un email válido';
                return null;
            },
            message: (value: string): string | null => {
                if (!value.trim()) return 'El mensaje es obligatorio';
                if (value.trim().length < 10) return 'El mensaje debe tener al menos 10 caracteres';
                if (value.length > 500) return 'El mensaje no puede superar los 500 caracteres';
                return null;
            },
            privacy: (checked: boolean): string | null => {
                if (!checked) return 'Debes aceptar la política de privacidad';
                return null;
            }
        };

        Object.keys(this.fields).forEach((fieldName: string) => {
            const field = this.fields[fieldName];

            if (field) {
                // Real-time validation on input
                field.addEventListener('input', () => {
                    this.validateField(fieldName, validators[fieldName]);
                    this.updateProgress();
                });

                field.addEventListener('blur', () => {
                    this.validateField(fieldName, validators[fieldName]);
                });

                // Show validation on focus
                field.addEventListener('focus', () => {
                    const formGroup = field.closest('.form-group');
                    if (formGroup) {
                        formGroup.classList.add('focused');
                    }
                });

                field.addEventListener('blur', () => {
                    const formGroup = field.closest('.form-group');
                    if (formGroup) {
                        formGroup.classList.remove('focused');
                    }
                });
            }
        });
    }

    /**
     * Validate individual field and show feedback
     */
    validateField(fieldName: string, validator: (value: any) => string | null) {
        const field = this.fields[fieldName];
        if (!field) return false;

        const formGroup = field.closest('.form-group');
        if (!formGroup) return false;

        const errorElement = formGroup.querySelector('.field-error');
        if (!errorElement) return false;

        let value: string | boolean = field.value;
        if (field.type === 'checkbox' && 'checked' in field) {
            value = (field as HTMLInputElement).checked;
        }

        const error = validator(value);

        if (error) {
            field.classList.add('border-red-500', 'focus:border-red-500', 'focus:ring-red-500/20');
            field.classList.remove('border-green-500', 'focus:border-green-500', 'focus:ring-green-500/20');
            errorElement.textContent = error;
            errorElement.classList.remove('hidden');
            formGroup.classList.add('has-error');
            return false;
        } else {
            field.classList.remove('border-red-500', 'focus:border-red-500', 'focus:ring-red-500/20');
            field.classList.add('border-green-500', 'focus:border-green-500', 'focus:ring-green-500/20');
            errorElement.classList.add('hidden');
            formGroup.classList.remove('has-error');
            formGroup.classList.add('is-valid');
            return true;
        }
    }

    /**
     * Setup progress bar for form completion
     */
    setupProgressBar() {
        if (!this.progressBar || !this.progressText) return;

        const updateProgress = () => {
            const totalFields = Object.keys(this.fields).length;
            let completedFields = 0;

            Object.values(this.fields).forEach(field => {
                if (field) {
                    if (field.type === 'checkbox' && 'checked' in field) {
                        const checkboxField = field as HTMLInputElement;
                        if (checkboxField.checked) completedFields++;
                    } else {
                        if (field.value.trim()) completedFields++;
                    }
                }
            });

            const progress = Math.round((completedFields / totalFields) * 100);
            if (this.progressBar) this.progressBar.style.width = `${progress}%`;
            if (this.progressText) this.progressText.textContent = `${progress}%`;

            // Change color based on progress
            if (this.progressBar) {
                if (progress === 100) {
                    this.progressBar.classList.remove('bg-primary');
                    this.progressBar.classList.add('bg-green-500');
                } else {
                    this.progressBar.classList.add('bg-primary');
                    this.progressBar.classList.remove('bg-green-500');
                }
            }
        };

        // Listen to all field changes
        Object.values(this.fields).forEach(field => {
            if (field) {
                field.addEventListener('input', updateProgress);
                field.addEventListener('change', updateProgress);
            }
        });
    }

    /**
     * Setup character counter for message field
     */
    setupCharacterCounter() {
        if (!this.charCount || !this.fields.message) return;

        const updateCharCount = () => {
            const length = this.fields.message!.value.length;
            if (this.charCount) this.charCount.textContent = length.toString();

            // Change color based on character count
            const charCountElement = this.charCount?.parentElement;
            if (charCountElement) {
                if (length > 450) {
                    charCountElement.classList.add('text-red-500');
                    charCountElement.classList.remove('text-gray-500', 'text-yellow-500');
                } else if (length > 400) {
                    charCountElement.classList.add('text-yellow-500');
                    charCountElement.classList.remove('text-gray-500', 'text-red-500');
                } else {
                    charCountElement.classList.add('text-gray-500');
                    charCountElement.classList.remove('text-yellow-500', 'text-red-500');
                }
            }
        };

        this.fields.message!.addEventListener('input', updateCharCount);
    }

    /**
     * Setup enhanced form submission
     */
    setupEnhancedSubmission() {
        this.form?.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Validate all fields
            const validators: { [key: string]: (value: any) => string | null } = {
                name: (value: string): string | null => {
                    if (!value.trim()) return 'El nombre es obligatorio';
                    if (value.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres';
                    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/.test(value)) return 'El nombre solo puede contener letras y espacios';
                    return null;
                },
                email: (value: string): string | null => {
                    if (!value.trim()) return 'El email es obligatorio';
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(value)) return 'Por favor, introduce un email válido';
                    return null;
                },
                message: (value: string): string | null => {
                    if (!value.trim()) return 'El mensaje es obligatorio';
                    if (value.trim().length < 10) return 'El mensaje debe tener al menos 10 caracteres';
                    if (value.length > 500) return 'El mensaje no puede superar los 500 caracteres';
                    return null;
                },
                privacy: (checked: boolean): string | null => {
                    if (!checked) return 'Debes aceptar la política de privacidad';
                    return null;
                }
            };

            let isValid = true;
            Object.keys(this.fields).forEach((fieldName: string) => {
                if (!this.validateField(fieldName, validators[fieldName])) {
                    isValid = false;
                }
            });

            if (!isValid) {
                this.showStatus('Por favor, corrige los errores del formulario', 'error');
                return;
            }

            // Show loading state
            this.setLoadingState(true);

            try {
                const formData = new FormData(this.form!);
                const response = await fetch(this.form!.action, {
                    method: this.form!.method,
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    this.showSuccessMessage();
                    this.form!.reset();
                    this.updateProgress();
                    if (this.charCount) {
                        this.charCount.textContent = '0';
                    }
                } else {
                    throw new Error('Error en el envío del formulario');
                }
            } catch (error) {
                this.showStatus('Hubo un problema al enviar el mensaje. Por favor, inténtalo de nuevo.', 'error');
            } finally {
                this.setLoadingState(false);
            }
        });
    }

    /**
     * Setup field animations and interactions
     */
    setupFieldAnimations() {
        Object.values(this.fields).forEach(field => {
            if (field && field.type !== 'checkbox') {
                // Add floating label effect
                field.addEventListener('focus', () => {
                    const label = field.previousElementSibling;
                    if (label && label.tagName === 'LABEL') {
                        label.classList.add('text-primary', 'text-sm');
                        label.classList.remove('text-gray-600');
                    }
                });

                field.addEventListener('blur', () => {
                    const label = field.previousElementSibling;
                    if (label && label.tagName === 'LABEL' && !field.value) {
                        label.classList.remove('text-primary', 'text-sm');
                        label.classList.add('text-gray-600');
                    }
                });
            }
        });
    }

    /**
     * Set loading state for form submission
     */
    setLoadingState(loading: boolean) {
        if (loading) {
            if (this.submitText) this.submitText.textContent = 'Enviando...';
            if (this.submitSpinner) this.submitSpinner.classList.remove('hidden');
            if (this.submitButton) {
                this.submitButton.disabled = true;
                this.submitButton.classList.add('opacity-75', 'cursor-not-allowed');
            }
        } else {
            if (this.submitText) this.submitText.textContent = 'Enviar Mensaje';
            if (this.submitSpinner) this.submitSpinner.classList.add('hidden');
            if (this.submitButton) {
                this.submitButton.disabled = false;
                this.submitButton.classList.remove('opacity-75', 'cursor-not-allowed');
            }
        }
    }

    /**
     * Show enhanced status messages
     */
    showStatus(message: string, type: 'error' | 'success') {
        const statusClass = type === 'error'
            ? 'bg-red-100 border-red-400 text-red-700'
            : 'bg-green-100 border-green-400 text-green-700';

        const icon = type === 'error'
            ? '<i class="ri-error-warning-line text-xl mr-2"></i>'
            : '<i class="ri-checkbox-circle-line text-xl mr-2"></i>';

        if (this.formStatus) {
            this.formStatus.innerHTML = `
                <div class="p-4 rounded-lg border ${statusClass} flex items-center">
                    ${icon}
                    <span>${message}</span>
                </div>
            `;

            // Auto-hide after 5 seconds for success messages
            if (type === 'success') {
                setTimeout(() => {
                    if (this.formStatus) this.formStatus.innerHTML = '';
                }, 5000);
            }
        }
    }

    /**
     * Show success message with additional actions
     */
    showSuccessMessage() {
        if (this.formStatus) {
            this.formStatus.innerHTML = `
                <div class="p-6 rounded-lg bg-green-100 border border-green-400 text-green-700">
                    <div class="flex items-center mb-3">
                        <i class="ri-checkbox-circle-line text-2xl mr-3"></i>
                        <div class="text-left">
                            <h4 class="font-semibold text-lg">¡Mensaje enviado con éxito!</h4>
                            <p class="text-sm">Gracias por contactar conmigo. Te responderé lo antes posible.</p>
                        </div>
                    </div>
                    <div class="mt-4 pt-4 border-t border-green-300">
                        <p class="text-sm mb-2">¿Qué te gustaría hacer ahora?</p>
                        <div class="flex gap-2 flex-wrap">
                            <a href="#booking-calendar" class="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                                <i class="ri-calendar-line mr-1"></i>
                                Agendar sesión
                            </a>
                            <a href="#areas-of-intervention" class="inline-flex items-center px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors text-sm">
                                <i class="ri-psychotherapy-line mr-1"></i>
                                Ver terapia
                            </a>
                            <button onclick="this.closest('#form-status').innerHTML = ''" class="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                                <i class="ri-close-line mr-1"></i>
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    /**
     * Update progress bar
     */
    updateProgress() {
        if (!this.progressBar || !this.progressText) return;

        const totalFields = Object.keys(this.fields).length;
        let completedFields = 0;

        Object.values(this.fields).forEach(field => {
            if (field) {
                if (field.type === 'checkbox' && 'checked' in field) {
                    const checkboxField = field as HTMLInputElement;
                    if (checkboxField.checked) completedFields++;
                } else {
                    if (field.value.trim()) completedFields++;
                }
            }
        });

        const progress = Math.round((completedFields / totalFields) * 100);
        this.progressBar.style.width = `${progress}%`;
        this.progressText.textContent = `${progress}%`;
    }
}