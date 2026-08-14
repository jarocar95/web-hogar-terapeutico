const { DateTime } = require("luxon");
const Image = require("@11ty/eleventy-img");
const htmlmin = require("html-minifier-terser");
const sitemap = require("@quasibit/eleventy-plugin-sitemap");
const { execSync } = require('child_process');

// Función asíncrona para el shortcode de imágenes
async function imageShortcode(src, alt, sizes = "100vw", loading = "lazy", imgClass = "") {

    if (alt === undefined) {
	throw new Error(`Missing \`alt\` on responsiveimage from: ${src}`);
    }
    // Opciones para el procesamiento de imágenes
    let metadata = await Image(src, {
	widths: [24, 28, 40, 300, 600, 900, "auto"],
	formats: ["webp", "jpeg"],
	// La carpeta de salida debe coincidir con la de tu configuración
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

// Resuelve la URL final publicada (p.ej. /img/HASH-900.jpeg) de una imagen a
// partir de su ruta de origen en frontmatter (p.ej. "./src/images/blog/foo.webp").
// Necesario para JSON-LD (schemas.njk), donde no podemos usar el shortcode
// <picture> — solo hace falta la URL de la variante más grande en jpeg.
async function imageUrlFilter(src) {
    if (!src) return "";
    let metadata = await Image(src, {
	widths: [24, 28, 40, 300, 600, 900, "auto"],
	formats: ["webp", "jpeg"],
	outputDir: "./public/img/",
	urlPath: "/img/",
    });
    const jpegVariants = metadata.jpeg;
    return jpegVariants[jpegVariants.length - 1].url;
}

module.exports = function(eleventyConfig) {

    eleventyConfig.addPlugin(sitemap, {
        sitemap: {
            hostname: "https://www.hogarterapeutico.com",
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
    // También copiaremos los archivos de la raíz como robots.txt
    eleventyConfig.addPassthroughCopy("./src/robots.txt");
    // MINIMALISTA: Incluyendo imagen optimizada
    eleventyConfig.addPassthroughCopy({
        "./src/images/imagen-background.webp": "/images/imagen-background.webp",
        "./src/images/imagen-background.jpeg": "/images/imagen-background.jpeg",
        "./src/images/imagen-background-optimized.jpg": "/images/imagen-background-optimized.jpg",
        "./src/images/foto-perfil.jpg": "/images/foto-perfil.jpg",
        "./src/images/imagen-compartir.png": "/images/imagen-compartir.png",
        "./src/images/logo-hogarterapeutico-simplificado.svg": "/images/logo-hogarterapeutico-simplificado.svg",
        "./src/images/doctoralia-logo.webp": "/images/doctoralia-logo.webp",
        "./src/images/blog": "/images/blog",
        "./src/images/favicon": "/images/favicon"
    });
    eleventyConfig.addPassthroughCopy("./src/prose.css");
    eleventyConfig.addPassthroughCopy("./src/critical.css");
    eleventyConfig.addPassthroughCopy("./public/_headers");


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