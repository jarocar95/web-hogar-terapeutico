/**
 * Formulario de peticion de guia: el script de envio es el mismo para todos
 * los articulos, asi que el formulario tiene que decirle cual quiere.
 */
import { initGuiaForm } from '../../src/ts/modules/guia-form';

describe('Peticion de guia', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <form data-guia-form data-guia="ventana-tolerancia" data-token="t" data-endpoint="https://ejemplo.test/exec">
        <input type="email" value="alguien@ejemplo.com">
        <input type="checkbox" checked>
        <button type="submit">Enviádmela</button>
        <p data-guia-aviso hidden></p>
      </form>`;
    (global as any).fetch = jest.fn().mockResolvedValue({ json: async () => ({ ok: true, mensaje: 'Enviada.' }) });
  });

  test('envía la clave de la guía que se pide', async () => {
    initGuiaForm();
    document.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    await new Promise((r) => setTimeout(r, 0));
    const cuerpo = new URLSearchParams((global as any).fetch.mock.calls[0][1].body);
    expect(cuerpo.get('guia')).toBe('ventana-tolerancia');
    expect(cuerpo.get('email')).toBe('alguien@ejemplo.com');
    expect(cuerpo.get('consentimiento')).toBe('si');
  });
});
