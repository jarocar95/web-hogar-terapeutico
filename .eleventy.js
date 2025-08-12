const { DateTime } = require("luxon");

module.exports = function(eleventyConfig) {

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

    return {
        dir: {
            input: "src",
            output: "public" // La carpeta donde se generará el sitio final
        }
    };
};

