const { DateTime } = require("luxon");
const Image = require("@11ty/eleventy-img");
const htmlmin = require("html-minifier-terser");
const sitemap = require("@quasibit/eleventy-plugin-sitemap");

// Función asíncrona para el shortcode de imágenes
async function imageShortcode(src, alt, sizes = "100vw") {

    if (alt === undefined) {
	throw new Error(`Missing \`alt\` on responsiveimage from: ${src}`);
    }
    // Opciones para el procesamiento de imágenes
    let metadata = await Image(src, {
	widths: [300, 600, 900, "auto"],
	formats: ["webp", "jpeg"],
	// La carpeta de salida debe coincidir con la de tu configuración
	outputDir: "./public/img/",
	// La URL base para el atributo src
	urlPath: "/img/",
    });
    
    // Atributos para la etique <img>
    let imageAttributes = {
	alt,
	sizes,
	loading: "lazy",
	decoding: "async",
    };

    // Genera el HTML completo del elemento <picture>
    return Image.generateHTML(metadata, imageAttributes);
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
    eleventyConfig.addPassthroughCopy("./src/scripts.js");
    // También copiaremos los archivos de la raíz como robots.txt
    eleventyConfig.addPassthroughCopy("./src/robots.txt");
    eleventyConfig.addPassthroughCopy("./src/images"); // Copy all images
    eleventyConfig.addPassthroughCopy("./src/prose.css");


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

    return {
        dir: {
            input: "src",
            output: "public" // La carpeta donde se generará el sitio final
        }
    };
};