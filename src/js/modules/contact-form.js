/**
 * Contact form functionality
 * Handles form submission without page reload
 */
export function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('form-status');
    const submitButton = document.getElementById('submit-button');
    const submitText = document.getElementById('submit-text');
    const submitSpinner = document.getElementById('submit-spinner');

    if (!contactForm || !formStatus) {
        return;
    }

    contactForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const form = event.target;
        const data = new FormData(form);

        // Show loading state
        if (submitText) submitText.textContent = 'Enviando...';
        if (submitSpinner) submitSpinner.classList.remove('hidden');
        if (submitButton) submitButton.disabled = true;

        formStatus.innerHTML = '<p class="text-center text-gray-500 flex items-center justify-center gap-2"><div class="loading-spinner"></div> Enviando mensaje...</p>';

        try {
            const response = await fetch(form.action, {
                method: form.method,
                body: data,
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                formStatus.innerHTML = '<p class="p-4 rounded-lg bg-green-100 text-green-800 text-center flex items-center justify-center gap-2"><i class="ri-checkbox-circle-line text-xl"></i> ¡Gracias por tu mensaje! Te responderé lo antes posible.</p>';
                form.reset();
            } else {
                throw new Error('Error en el envío del formulario');
            }
        } catch (error) {
            formStatus.innerHTML = '<p class="p-4 rounded-lg bg-red-100 text-red-800 text-center flex items-center justify-center gap-2"><i class="ri-error-warning-line text-xl"></i> Oops! Hubo un problema. Por favor, inténtalo de nuevo o contáctame directamente.</p>';
        } finally {
            // Reset button state
            if (submitText) submitText.textContent = 'Enviar Mensaje';
            if (submitSpinner) submitSpinner.classList.add('hidden');
            if (submitButton) submitButton.disabled = false;

            setTimeout(() => {
                formStatus.innerHTML = '';
            }, 6000);
        }
    });
}