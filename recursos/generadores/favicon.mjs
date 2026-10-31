// Favicons de la web a partir del logo simplificado.
//
//   node recursos/generadores/favicon.mjs
//
// El logo entero, sin recortar (lo pidio asi Javier, aunque a 16 px se vea
// pequeno). Fondo claro siempre, sin variante oscura: el icono transparente de
// trazo fino desaparecia sobre las pestanas oscuras. El trazo va engrosado para
// que aguante a tamano de pestana.
//
// Escribe en src/images/favicon/. Rasteriza con el Chromium de Playwright,
// que ya esta en el proyecto, para no depender de cairo ni de ImageMagick.

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const RAIZ = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const LOGO = path.join(RAIZ, 'src/images/logo-hogarterapeutico-simplificado.svg');
const SALIDA = path.join(RAIZ, 'src/images/favicon');

const FONDO = '#f6eeee';
const TRAZO = '#9c6666';
const PUERTA = '#e6a6a1';

// Caja del logo, en sus propias coordenadas (el viewBox del SVG).
const CAJA = { x0: 0, x1: 905.49, y0: 0, y1: 303.3 };
const GROSOR = 12;

const caminos = [...fs.readFileSync(LOGO, 'utf8').matchAll(/<path class="(cls-\d)" d="([^"]+)"/g)];

/**
 * ocupa: fraccion del lado que llena el logo. Los iconos "maskable" de Android
 * necesitan mas margen porque el sistema los recorta en circulo.
 * radio: esquinas del fondo; 0 donde el sistema ya redondea (iOS, Android).
 */
function svg({ ocupa = 0.88, radio = 200 } = {}) {
  const { x0, x1, y0, y1 } = CAJA;
  const w = x1 - x0, h = y1 - y0;
  const s = (1000 * ocupa) / Math.max(w, h);
  const tx = (1000 - w * s) / 2 - x0 * s;
  const ty = (1000 - h * s) / 2 - y0 * s;
  const trazos = caminos.map(([, clase, d]) => clase === 'cls-2'
    ? `<path d="${d}" fill="${TRAZO}" stroke-width="${GROSOR}"/>`
    : `<path d="${d}" fill="${PUERTA}" stroke-width="${Math.max(11, GROSOR)}"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">`
    + `<rect width="1000" height="1000" rx="${radio}" fill="${FONDO}"/>`
    + `<g transform="translate(${tx.toFixed(1)} ${ty.toFixed(1)}) scale(${s.toFixed(4)})"`
    + ` stroke="${TRAZO}" stroke-linejoin="round" stroke-linecap="round">${trazos}</g></svg>\n`;
}

async function png(pagina, codigo, lado) {
  const uri = 'data:image/svg+xml;base64,' + Buffer.from(codigo).toString('base64');
  await pagina.setViewportSize({ width: lado, height: lado });
  await pagina.setContent(`<body style="margin:0"><img src="${uri}" width="${lado}" height="${lado}" style="display:block">`);
  await pagina.locator('img').evaluate((img) => img.decode());
  return pagina.screenshot({ omitBackground: true });
}

/** ICO con las imagenes en PNG dentro, que aceptan todos los navegadores actuales. */
function ico(pngs) {
  const cabecera = Buffer.alloc(6 + 16 * pngs.length);
  cabecera.writeUInt16LE(0, 0);
  cabecera.writeUInt16LE(1, 2);
  cabecera.writeUInt16LE(pngs.length, 4);
  let desplazamiento = cabecera.length;
  pngs.forEach(({ lado, datos }, i) => {
    const o = 6 + 16 * i;
    cabecera.writeUInt8(lado >= 256 ? 0 : lado, o);
    cabecera.writeUInt8(lado >= 256 ? 0 : lado, o + 1);
    cabecera.writeUInt16LE(1, o + 4);
    cabecera.writeUInt16LE(32, o + 6);
    cabecera.writeUInt32LE(datos.length, o + 8);
    cabecera.writeUInt32LE(desplazamiento, o + 12);
    desplazamiento += datos.length;
  });
  return Buffer.concat([cabecera, ...pngs.map((p) => p.datos)]);
}

const pestana = svg();
const cuadrado = svg({ radio: 0 });
// 0.74: con esa anchura las esquinas del logo caen dentro del circulo del 80 %
// que Android garantiza visible.
const enmascarable = svg({ ocupa: 0.74, radio: 0 });

const navegador = await chromium.launch();
const pagina = await navegador.newPage();
const escribe = (nombre, datos) => fs.writeFileSync(path.join(SALIDA, nombre), datos);

escribe('favicon.svg', pestana);
escribe('favicon-96x96.png', await png(pagina, pestana, 96));
escribe('apple-touch-icon.png', await png(pagina, cuadrado, 180));
escribe('web-app-manifest-192x192.png', await png(pagina, enmascarable, 192));
escribe('web-app-manifest-512x512.png', await png(pagina, enmascarable, 512));
// En serie: es una sola pagina y cada png() le cambia el tamano.
const capas = [];
for (const lado of [16, 32, 48]) capas.push({ lado, datos: await png(pagina, pestana, lado) });
escribe('favicon.ico', ico(capas));

await navegador.close();
console.log('Favicons escritos en', path.relative(RAIZ, SALIDA));
