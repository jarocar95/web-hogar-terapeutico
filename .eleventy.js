const { DateTime } = require("luxon");
const Image = require("@11ty/eleventy-img");
const htmlmin = require("html-minifier-terser");
const sitemap = require("@quasibit/eleventy-plugin-sitemap");
const { execSync } = require('child_process');
const path = require('path');

// Escala de anchos para las imagenes responsive.
//
// Antes era [24, 28, 40, 300, 600, 900, "auto"]. El "auto" genera una variante
// al tamano original del archivo: para el fondo del hero eso eran 6757 px
// (233 KB en WebP, 520 KB en JPEG). Como el sizes es "100vw" y entre 900 y 6757
// no habia ningun paso intermedio, cualquier pantalla retina de 1440 px pedia
// ~2880 px y se llevaba la de 6757. Y es el LCP de la home.
//
// Ahora la escala es explicita y con saltos razonables. eleventy-img nunca
// amplia, asi que para originales pequenos simplemente genera menos variantes.
const ESCALA_ANCHOS = [40, 320, 480, 640, 900, 1280, 1600, 2000];

// Nombre de archivo a partir del original, no un hash.
//
// eleventy-img nombra por defecto con un hash del contenido: tTFxn7XHkc-40.jpeg.
// Funciona, pero tira a la basura la unica señal que Google Imagenes puede leer
// del archivo en si. Con esto, la portada de EMDR se sirve como
// emdr-900.jpeg y la de terapia online como terapia-online-videollamada-900.jpeg.
//
// Se usa el nombre base del original, que ya es descriptivo y unico en
// src/images (comprobado: no hay basenames repetidos). Si algun dia se
// duplicara uno, dos imagenes distintas escribirian sobre el mismo archivo,
// asi que conviene mantener esa unicidad al añadir imagenes nuevas.
//
// IMPORTANTE: las tres llamadas a Image() de este fichero deben compartir esta
// funcion. El <link rel="preload"> del hero calcula la URL repitiendo la misma
// llamada; si los nombres divergieran, precargaria un archivo inexistente.
const nombreDescriptivo = (id, src, width, format) => {
    const base = path
	.basename(src, path.extname(src))
	.toLowerCase()
	.normalize("NFD")
	.replace(/[\u0300-\u036f]/g, "")
	.replace(/[^a-z0-9]+/g, "-")
	.replace(/^-+|-+$/g, "");
    return `${base}-${width}.${format}`;
};

// Función asíncrona para el shortcode de imágenes
async function imageShortcode(src, alt, sizes = "100vw", loading = "lazy", imgClass = "") {

    if (alt === undefined) {
	throw new Error(`Missing \`alt\` on responsiveimage from: ${src}`);
    }
    // Opciones para el procesamiento de imágenes
    let metadata = await Image(src, {
	widths: ESCALA_ANCHOS,
	formats: ["webp", "jpeg"],
	// Sin esto sharp usa calidad 80. En fotografia, 74 en webp es
	// indistinguible a simple vista y pesa un 20% menos; en la variante
	// grande del hero eso son 110 KB que no se pagan por nada, porque
	// buena parte de sus pixeles estan interpolados, no capturados.
	sharpWebpOptions: { quality: 74 },
	sharpJpegOptions: { quality: 78, mozjpeg: true },
	// La carpeta de salida debe coincidir con la de tu configuración
	filenameFormat: nombreDescriptivo,
	outputDir: "./public/img/",
	// La URL base para el atributo src
	urlPath: "/img/",
    });

    // Atributos para la etique <img>
    // loading="eager" se usa para imágenes críticas (ej. el hero), que nunca deben
    // retrasarse: son parte del LCP y siempre están en el viewport inicial.
    let imageAttributes = {
	alt,
	sizes,
	loading,
	decoding: "async",
	...(imgClass ? { class: imgClass } : {}),
	...(loading === "eager" ? { fetchpriority: "high" } : {}),
    };

    // Genera el HTML completo del elemento <picture>
    return Image.generateHTML(metadata, imageAttributes);
}

// Genera el <link rel="preload"> de una imagen que luego pintara el shortcode
// {% image %}. Sirve para el fondo del hero, que es el elemento LCP.
//
// Sin esto, el navegador no descubre la imagen hasta que el parser llega a
// ella, y para entonces ya ha lanzado las fuentes: PageSpeed medía 810 ms de
// espera entre el inicio de la navegacion y el comienzo de la descarga.
//
// Se emite solo el srcset webp, con su type: los navegadores que no lo
// soporten ignoran el preload y descargan el jpeg por la via normal. Reutiliza
// la misma llamada a Image() que el shortcode, asi que los anchos y los hashes
// no pueden desincronizarse.
async function imagePreloadShortcode(src, sizes = "100vw") {
    if (!src) return "";
    const metadata = await Image(src, {
	widths: ESCALA_ANCHOS,
	formats: ["webp", "jpeg"],
	// Sin esto sharp usa calidad 80. En fotografia, 74 en webp es
	// indistinguible a simple vista y pesa un 20% menos; en la variante
	// grande del hero eso son 110 KB que no se pagan por nada, porque
	// buena parte de sus pixeles estan interpolados, no capturados.
	sharpWebpOptions: { quality: 74 },
	sharpJpegOptions: { quality: 78, mozjpeg: true },
	filenameFormat: nombreDescriptivo,
	outputDir: "./public/img/",
	urlPath: "/img/",
    });
    const webp = metadata.webp;
    if (!webp || !webp.length) return "";
    const srcset = webp.map((v) => `${v.url} ${v.width}w`).join(", ");
    return `<link rel="preload" as="image" type="image/webp" imagesrcset="${srcset}" imagesizes="${sizes}" fetchpriority="high">`;
}

// Resuelve la URL final publicada (p.ej. /img/HASH-900.jpeg) de una imagen a
// partir de su ruta de origen en frontmatter (p.ej. "./src/images/blog/foo.webp").
// Necesario para JSON-LD (schemas.njk), donde no podemos usar el shortcode
// <picture> — solo hace falta la URL de la variante más grande en jpeg.
async function imageUrlFilter(src) {
    if (!src) return "";
    let metadata = await Image(src, {
	widths: ESCALA_ANCHOS,
	formats: ["webp", "jpeg"],
	// Sin esto sharp usa calidad 80. En fotografia, 74 en webp es
	// indistinguible a simple vista y pesa un 20% menos; en la variante
	// grande del hero eso son 110 KB que no se pagan por nada, porque
	// buena parte de sus pixeles estan interpolados, no capturados.
	sharpWebpOptions: { quality: 74 },
	sharpJpegOptions: { quality: 78, mozjpeg: true },
	filenameFormat: nombreDescriptivo,
	outputDir: "./public/img/",
	urlPath: "/img/",
    });
    // La mayor por ancho, sin depender de que el array venga ordenado.
    const jpegVariants = metadata.jpeg;
    return jpegVariants.reduce((a, b) => (b.width > a.width ? b : a)).url;
}

module.exports = function(eleventyConfig) {

    eleventyConfig.addPlugin(sitemap, {
        sitemap: {
            hostname: "https://hogarterapeutico.com",
        },
    });

    eleventyConfig.addTransform("htmlmin", function(content, outputPath) {
        if (outputPath && outputPath.endsWith(".html")) {
            let minified = htmlmin.minify(content, {
                useShortDoctype: true,
                removeComments: true,
                collapseWhitespace: true
            });
            return minified;
        }
        return content;
    });

    eleventyConfig.addAsyncShortcode("image", imageShortcode);
    eleventyConfig.addAsyncFilter("imageUrl", imageUrlFilter);
    eleventyConfig.addAsyncShortcode("imagePreload", imagePreloadShortcode);
    // También copiaremos los archivos de la raíz como robots.txt
    eleventyConfig.addPassthroughCopy("./src/robots.txt");
    // MINIMALISTA: Incluyendo imagen optimizada
    eleventyConfig.addPassthroughCopy({
        "./src/images/imagen-background.webp": "/images/imagen-background.webp",
        "./src/images/imagen-background.jpeg": "/images/imagen-background.jpeg",
        "./src/images/imagen-background-optimized.jpg": "/images/imagen-background-optimized.jpg",
        "./src/images/foto-perfil.jpg": "/images/foto-perfil.jpg",
        // El retrato nuevo necesita URL directa y estable porque lo referencia
        // el schema de Person: ahi no vale la imagen que genera el shortcode,
        // cuyo nombre lleva un hash y cambia con cada build.
        "./src/images/angie-retrato.jpg": "/images/angie-retrato.jpg",
        "./src/images/imagen-compartir.png": "/images/imagen-compartir.png",
        "./src/images/logo-hogarterapeutico-simplificado.svg": "/images/logo-hogarterapeutico-simplificado.svg",
        "./src/images/doctoralia-logo.webp": "/images/doctoralia-logo.webp",
        "./src/images/blog": "/images/blog",
        "./src/images/favicon": "/images/favicon",
        "./src/fonts": "/fonts"
    });
    // src/prose.css no existe y src/critical.css no lo carga ninguna plantilla
    // (el CSS critico va inline en base.njk), asi que dejamos de publicarlos.


    // Formateador de fechas legible
    eleventyConfig.addFilter("readableDate", (dateObj) => {
        // Corregido para manejar correctamente las fechas desde el frontmatter
        if (dateObj) {
            return DateTime.fromJSDate(dateObj, {zone: 'utc'}).setLocale('es').toLocaleString(DateTime.DATE_FULL);
        }
        return '';
    });

    // =========== INICIO DEL CAMBIO ===========
    // Nuevo filtro para formatear la fecha a formato ISO (YYYY-MM-DD) para Schema.org
    eleventyConfig.addFilter("isoDate", (dateObj) => {
        if (dateObj) {
            return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toISODate();
        }
        return '';
    });

    // Generate cache-busting version based on git commit or timestamp
    let version;
    try {
        version = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
    } catch (e) {
        version = Date.now().toString();
    }

    // Add version as a global data variable
    eleventyConfig.addGlobalData("version", version);

    // Cache-busting shortcode for CSS
    eleventyConfig.addShortcode("cssVersion", function() {
        return `?v=${version}`;
    });

    // Cache-busting shortcode for JS
    eleventyConfig.addShortcode("jsVersion", function() {
        return `?v=${version}`;
    });

    return {
        dir: {
            input: "src",
            output: "public" // La carpeta donde se generará el sitio final
        }
    };
};