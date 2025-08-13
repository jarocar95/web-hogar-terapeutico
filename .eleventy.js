const { DateTime } = require("luxon");

module.exports = function(eleventyConfig) {

    eleventyConfig.addPassthroughCopy("./src/dist");
    // Copiar archivos estáticos (imágenes y scripts) a la carpeta de salida.
    // Hemos eliminado la línea que copiaba la carpeta 'dist'.
    eleventyConfig.addPassthroughCopy("./src/images");
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

