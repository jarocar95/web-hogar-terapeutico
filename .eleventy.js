const { DateTime } = require("luxon");

module.exports = function(eleventyConfig) {

    // Copiar archivos estáticos (CSS, JS, imágenes) a la carpeta de salida
    eleventyConfig.addPassthroughCopy("./src/dist");
    eleventyConfig.addPassthroughCopy("./src/images");
    eleventyConfig.addPassthroughCopy("./src/scripts.js");

    // Formateador de fechas legible
    eleventyConfig.addFilter("readableDate", (dateObj) => {
        return DateTime.fromJSDate(dateObj, {zone: 'utc'}).setLocale('es').toLocaleString(DateTime.DATE_FULL);
    });

    return {
        dir: {
            input: "src",
            output: "public" // La carpeta donde se generará el sitio final
        }
    };
};


