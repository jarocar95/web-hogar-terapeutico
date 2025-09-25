/**
 * Contact form functionality
 * Handles form submission without page reload
 */
import { Logger } from '../utils/logger.js';
export function initContactForm() {
    const logger = Logger.getInstance();
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('form-status');
    if (!contactForm || !formStatus) {
        return;
    }
    contactForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const form = event.target;
        const data = new FormData(form);
        const submitButton = form.querySelector('button[type="submit"]');
        formStatus.innerHTML = '<p class="text-center text-gray-500">Enviando...</p>';
        submitButton.disabled = true;
        // Log form submission attempt
        logger.event('form_submit', 'contact_form', 'submission_attempt');
        try {
            const response = await fetch(form.action, {
                method: form.method,
                body: data,
                headers: { 'Accept': 'application/json' }
            });
            if (response.ok) {
                formStatus.innerHTML = '<p class="p-4 rounded-lg bg-green-100 text-green-800 text-center">¡Gracias por tu mensaje! Te responderé lo antes posible.</p>';
                form.reset();
                logger.event('form_submit', 'contact_form', 'success');
            }
            else {
                throw new Error('Error en el envío del formulario');
            }
        }
        catch (error) {
            logger.error('Error submitting form', { error: error instanceof Error ? error.message : String(error) });
            console.error('Error submitting form:', error);
            formStatus.innerHTML = '<p class="p-4 rounded-lg bg-red-100 text-red-800 text-center">Oops! Hubo un problema. Por favor, inténtalo de nuevo o contáctame directamente.</p>';
            logger.event('form_submit', 'contact_form', 'error');
        }
        finally {
            submitButton.disabled = false;
            setTimeout(() => {
                formStatus.innerHTML = '';
            }, 6000);
        }
    });
}
