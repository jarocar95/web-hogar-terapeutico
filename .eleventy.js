const { DateTime } = require("luxon");
const Image = require("@11ty/eleventy-img");

// Función asíncrona para el shortcode de imágenes
async function imageShortcode(src, alt, sizes = "100vw") {
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

    eleventyConfig.addAsyncShortcode("image", imageShortcode);
    eleventyConfig.addPassthroughCopy("./src/dist");
    eleventyConfig.addPassthroughCopy("./src/scripts.js");
    // También copiaremos los archivos de la raíz como robots.txt y sitemap.xml
    eleventyConfig.addPassthroughCopy("./src/robots.txt");
    eleventyConfig.addPassthroughCopy("./src/sitemap.xml");


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

