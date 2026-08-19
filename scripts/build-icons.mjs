/**
 * Genera src/icons.css a partir del paquete remixicon.
 *
 * Antes se cargaba la hoja completa de Remixicon desde jsdelivr, y con ella su
 * tipografia de iconos: una conexion a un tercero y ~100 KB de fuente para usar
 * 31 iconos de los mas de 3000 que trae.
 *
 * Aqui se extraen solo los que aparecen en el codigo y se incrustan como
 * mask-image en data URL. Ventajas:
 *
 * - Cero peticiones: el CSS acaba dentro de output.css.
 * - Se mantiene el marcado tal cual (<i class="ri-loquesea">), asi que no hay
 *   que tocar ni una plantilla ni las cadenas HTML que generan los modulos TS.
 * - background-color: currentColor hace que el icono herede el color del texto,
 *   igual que hacia la fuente.
 * - Se dimensionan con font-size (1em), igual que antes.
 *
 * Se ejecuta a mano, como el de las fuentes. El resultado se versiona.
 *
 *     npm i -D remixicon
 *     node scripts/build-icons.mjs
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, basename, extname } from 'node:path';

const RAIZ = new URL('..', import.meta.url).pathname;
const ORIGEN = join(RAIZ, 'node_modules', 'remixicon', 'icons');
const FUENTES = join(RAIZ, 'src');
const SALIDA = join(FUENTES, 'icons.css');

if (!existsSync(ORIGEN)) {
    console.error(`No encuentro ${ORIGEN}.\nInstala el paquete con:  npm i -D remixicon`);
    process.exit(1);
}

/** Todos los .svg del paquete, indexados por nombre de archivo. */
async function indexar(dir, indice = new Map()) {
    for (const entrada of await readdir(dir, { withFileTypes: true })) {
        const ruta = join(dir, entrada.name);
        if (entrada.isDirectory()) await indexar(ruta, indice);
        else if (extname(entrada.name) === '.svg') indice.set(basename(entrada.name, '.svg'), ruta);
    }
    return indice;
}

/** Nombres ri-* que aparecen de verdad en el codigo fuente. */
async function usados(dir, encontrados = new Set()) {
    for (const entrada of await readdir(dir, { withFileTypes: true })) {
        if (entrada.name === 'icons.css' || entrada.name === 'fonts') continue;
        const ruta = join(dir, entrada.name);
        if (entrada.isDirectory()) await usados(ruta, encontrados);
        else if (/\.(html|njk|ts|js|md)$/.test(entrada.name)) {
            const texto = await readFile(ruta, 'utf8');
            for (const m of texto.matchAll(/\bri-[a-z0-9-]+/g)) encontrados.add(m[0]);
        }
    }
    return encontrados;
}

/** Compacta el SVG y lo deja apto para meter en url("..."). */
function aDataUrl(svg) {
    const limpio = svg
        .replace(/<\?xml[^>]*\?>/g, '')
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/\s+/g, ' ')
        .replace(/> </g, '><')
        .replace(/fill="(currentColor|none)"/g, 'fill="#000"')
        .trim();
    const escapado = limpio
        .replace(/"/g, "'")
        .replace(/%/g, '%25')
        .replace(/#/g, '%23')
        .replace(/</g, '%3C')
        .replace(/>/g, '%3E');
    return `data:image/svg+xml,${escapado}`;
}

const indice = await indexar(ORIGEN);
const nombres = [...await usados(FUENTES)].sort();

const reglas = [];
const faltan = [];
for (const clase of nombres) {
    const archivo = indice.get(clase.slice(3)); // quitar "ri-"
    if (!archivo) { faltan.push(clase); continue; }
    const url = aDataUrl(await readFile(archivo, 'utf8'));
    reglas.push(`.${clase}{-webkit-mask-image:url("${url}");mask-image:url("${url}")}`);
}

const css = `/* Generado por scripts/build-icons.mjs. No editar a mano. */
[class^="ri-"],[class*=" ri-"]{
  display:inline-block;
  width:1em;
  height:1em;
  background-color:currentColor;
  vertical-align:-.125em;
  -webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;
  -webkit-mask-position:center;mask-position:center;
  -webkit-mask-size:contain;mask-size:contain;
}
${reglas.join('\n')}
`;

await writeFile(SALIDA, css);
const kb = (Buffer.byteLength(css) / 1024).toFixed(1);
console.log(`  ${reglas.length} iconos -> src/icons.css (${kb} KB sin comprimir)`);
if (faltan.length) console.log(`  aviso: no encontrados en el paquete: ${faltan.join(', ')}`);
