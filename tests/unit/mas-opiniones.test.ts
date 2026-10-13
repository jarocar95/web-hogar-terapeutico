/**
 * Boton "Ver mas opiniones" de la portada en movil
 */
import { initMasOpiniones } from '../../src/ts/modules/mas-opiniones';

describe('Ver mas opiniones', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="opiniones-lista">
        <article class="tst">1</article>
        <article class="tst">2</article>
        <article class="tst">3</article>
        <article class="tst tst-extra">4</article>
        <article class="tst tst-extra">5</article>
      </div>
      <button type="button" class="btn hidden" data-mas-opiniones aria-expanded="false">Ver más opiniones</button>
    `;
  });

  const boton = () => document.querySelector('[data-mas-opiniones]') as HTMLButtonElement;
  const extra = () => Array.from(document.querySelectorAll('.tst-extra'));

  test('el boton nace oculto y solo aparece con JavaScript, y solo en movil', () => {
    expect(boton().classList.contains('hidden')).toBe(true);
    initMasOpiniones();
    expect(boton().classList.contains('hidden')).toBe(false);
    expect(boton().classList.contains('sm:hidden')).toBe(true);
  });

  test('al pulsarlo se muestran las ocultas, desaparece y el foco va a la primera nueva', () => {
    initMasOpiniones();
    boton().click();
    expect(extra().every((el) => el.classList.contains('is-visible'))).toBe(true);
    expect(boton().getAttribute('aria-expanded')).toBe('true');
    expect(boton().classList.contains('hidden')).toBe(true);
    expect(document.activeElement).toBe(extra()[0]);
  });

  test('sin opiniones extra el boton sigue oculto', () => {
    extra().forEach((el) => el.remove());
    initMasOpiniones();
    expect(boton().classList.contains('hidden')).toBe(true);
  });
});
