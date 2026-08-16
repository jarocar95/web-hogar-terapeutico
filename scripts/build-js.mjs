/**
 * Empaquetado del JavaScript del sitio.
 *
 * Antes el build era solo `tsc`: publicaba la salida cruda de TypeScript en
 * public/js, sin minificar, un archivo por modulo (30 peticiones contando los
 * .d.ts, que en el navegador no sirven para nada). Eran 188 KB.
 *
 * Ahora esbuild empaqueta desde main.ts. Se mantiene `splitting`, que es lo que
 * conserva la carga diferida que ya hacia main.ts con imports dinamicos: el
 * calendario, el formulario y el banner de cookies siguen siendo trozos aparte
 * que solo se descargan cuando hacen falta.
 *
 * esbuild NO comprueba tipos. De eso se encarga `npm run typecheck` (tsc
 * --noEmit), que corre antes en el script de build.
 *
 *   node scripts/build-js.mjs            construye una vez
 *   node scripts/build-js.mjs --watch    reconstruye al guardar
 */
import * as esbuild from 'esbuild';
import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';

const SALIDA = './public/js';
const watch = process.argv.includes('--watch');

/** @type {import('esbuild').BuildOptions} */
const opciones = {
    entryPoints: ['src/ts/main.ts'],
    bundle: true,
    splitting: true,
    format: 'esm',
    target: 'es2020',
    minify: !watch,
    sourcemap: watch ? 'inline' : false,
    outdir: SALIDA,
    entryNames: '[name]',
    // Hash de contenido en los trozos: cambian de nombre solo si cambia su
    // contenido, asi que se pueden cachear indefinidamente sin cache-busting.
    chunkNames: 'chunks/[name]-[hash]',
    legalComments: 'none',
    logLevel: 'info',
};

async function pesoTotal(dir) {
    let total = 0;
    for (const entrada of await readdir(dir, { withFileTypes: true })) {
        const ruta = join(dir, entrada.name);
        total += entrada.isDirectory() ? await pesoTotal(ruta) : (await stat(ruta)).size;
    }
    return total;
}

if (watch) {
    const ctx = await esbuild.context(opciones);
    await ctx.watch();
    console.log('esbuild en modo watch. Ctrl+C para salir.');
} else {
    await esbuild.build(opciones);
    const kb = (await pesoTotal(SALIDA) / 1024).toFixed(1);
    console.log(`\nJS publicado: ${kb} KB en total (main.js + trozos diferidos).`);
}
