/**
 * Tests del formulario de contacto.
 *
 * Antes este archivo probaba src/ts/modules/contact-form.ts, un modulo que ya
 * no importaba nadie: el que corre en produccion es enhanced-contact-form, y
 * hasta ahora solo tenia cobertura e2e. Al borrar el modulo muerto se reapunta
 * la suite al que de verdad se usa.
 */
import { EnhancedContactForm } from '../../src/ts/modules/enhanced-contact-form';

const montarFormulario = (): void => {
  document.body.innerHTML = `
    <form id="contactForm" action="https://formspree.io/f/test" method="post">
      <div class="fld">
        <label for="name">Nombre</label>
        <input type="text" id="name" name="name" required>
        <p class="field-error hidden"></p>
      </div>
      <div class="fld">
        <label for="email">Correo</label>
        <input type="email" id="email" name="email" required>
        <p class="field-error hidden"></p>
      </div>
      <div class="fld">
        <label for="message">Mensaje</label>
        <textarea id="message" name="message" required></textarea>
        <p class="field-error hidden"></p>
      </div>
      <div class="fld">
        <input type="checkbox" id="privacy" name="privacy" required>
        <p class="field-error hidden"></p>
      </div>
      <button type="submit" id="submit-button"><span id="submit-text">Enviar Mensaje</span></button>
    </form>
    <div id="form-status"></div>
  `;
};

const rellenarConDatosValidos = (): void => {
  (document.getElementById('name') as HTMLInputElement).value = 'Javier Romero';
  (document.getElementById('email') as HTMLInputElement).value = 'javier@ejemplo.com';
  (document.getElementById('message') as HTMLTextAreaElement).value =
    'Hola Angie, me gustaria reservar una primera sesion.';
  (document.getElementById('privacy') as HTMLInputElement).checked = true;
};

const enviar = (): void => {
  document.getElementById('contactForm')!
    .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
};

// El envoltorio de cada campo se llama .fld, igual que en src/index.html.
// Este fixture usaba .form-group, que era el nombre de una version anterior del
// marcado. Como el modulo tambien buscaba .form-group, las pruebas pasaban en
// verde mientras en produccion no encontraba nada y daba TODOS los campos por
// invalidos: el formulario no se podia enviar. Un fixture que no coincide con
// el HTML real no prueba nada, solo da confianza falsa.
describe('EnhancedContactForm', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
    montarFormulario();
  });

  test('no explota si el formulario no esta en la pagina', () => {
    document.body.innerHTML = '<div id="form-status"></div>';
    expect(() => new EnhancedContactForm()).not.toThrow();
  });

  describe('validacion', () => {
    test('rechaza el envio con el formulario vacio y no llama a fetch', () => {
      new EnhancedContactForm();
      enviar();

      expect(fetch).not.toHaveBeenCalled();
      expect(document.getElementById('form-status')!.textContent)
        .toContain('corrige los errores');
    });

    test.each([
      ['nombre demasiado corto', 'name', 'J', 'al menos 2 caracteres'],
      ['nombre con numeros', 'name', 'Javier 123', 'solo puede contener letras'],
      ['email sin arroba', 'email', 'javier.ejemplo.com', 'email válido'],
      ['mensaje demasiado corto', 'message', 'hola', 'al menos 10 caracteres'],
    ])('marca el error: %s', (_caso, campo, valor, mensajeEsperado) => {
      new EnhancedContactForm();
      rellenarConDatosValidos();
      const el = document.getElementById(campo) as HTMLInputElement;
      el.value = valor;
      enviar();

      expect(fetch).not.toHaveBeenCalled();
      const error = el.closest('.fld')!.querySelector('.field-error')!;
      expect(error.textContent).toContain(mensajeEsperado);
      expect(error.classList.contains('hidden')).toBe(false);
    });

    test('exige aceptar la politica de privacidad', () => {
      new EnhancedContactForm();
      rellenarConDatosValidos();
      (document.getElementById('privacy') as HTMLInputElement).checked = false;
      enviar();

      expect(fetch).not.toHaveBeenCalled();
      const error = document.getElementById('privacy')!
        .closest('.fld')!.querySelector('.field-error')!;
      expect(error.textContent).toContain('política de privacidad');
    });

    test('acepta nombres con tildes y enes', () => {
      new EnhancedContactForm();
      rellenarConDatosValidos();
      (document.getElementById('name') as HTMLInputElement).value = 'Begoña Muñoz Ibáñez';
      (fetch as jest.Mock).mockResolvedValueOnce({ ok: true });
      enviar();

      expect(fetch).toHaveBeenCalled();
    });
  });

  describe('envio', () => {
    test('envia al endpoint del formulario con Accept: application/json', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({ ok: true });
      new EnhancedContactForm();
      rellenarConDatosValidos();
      enviar();
      await Promise.resolve();

      expect(fetch).toHaveBeenCalledWith(
        'https://formspree.io/f/test',
        expect.objectContaining({
          method: 'post',
          headers: { Accept: 'application/json' },
        })
      );
    });

    test('marca el boton como ocupado mientras envia', () => {
      (fetch as jest.Mock).mockReturnValueOnce(new Promise(() => {})); // nunca resuelve
      new EnhancedContactForm();
      rellenarConDatosValidos();
      enviar();

      expect((document.getElementById('submit-button') as HTMLButtonElement).disabled).toBe(true);
      expect(document.getElementById('submit-text')!.textContent).toBe('Enviando...');
    });

    test('vacia el formulario tras un envio correcto', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({ ok: true });
      new EnhancedContactForm();
      rellenarConDatosValidos();
      enviar();
      await new Promise(process.nextTick);

      expect((document.getElementById('name') as HTMLInputElement).value).toBe('');
      expect((document.getElementById('email') as HTMLInputElement).value).toBe('');
      expect((document.getElementById('message') as HTMLTextAreaElement).value).toBe('');
    });

    test('avisa al usuario si el servidor responde mal', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({ ok: false });
      new EnhancedContactForm();
      rellenarConDatosValidos();
      enviar();
      await new Promise(process.nextTick);

      expect(document.getElementById('form-status')!.textContent).toContain('problema');
    });

    test('avisa al usuario si falla la red', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
      new EnhancedContactForm();
      rellenarConDatosValidos();
      enviar();
      await new Promise(process.nextTick);

      expect(document.getElementById('form-status')!.textContent).toContain('problema');
    });

    test('vuelve a habilitar el boton pase lo que pase', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
      new EnhancedContactForm();
      rellenarConDatosValidos();
      enviar();
      await new Promise(process.nextTick);

      expect((document.getElementById('submit-button') as HTMLButtonElement).disabled).toBe(false);
      expect(document.getElementById('submit-text')!.textContent).toBe('Enviar Mensaje');
    });
  });
});
