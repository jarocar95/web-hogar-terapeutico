/**
 * Datos de la carpeta del blog.
 *
 * Un articulo con fecha futura no debe existir todavia. Eleventy ya lo excluye
 * de las colecciones (asi no sale en /blog/ ni en el sitemap), pero seguia
 * escribiendo el HTML: los borradores quedaban accesibles en su URL para
 * cualquiera que la adivinase, y para Google si llegaba por otra via.
 *
 * Con permalink: false directamente no se genera el archivo.
 *
 * Publicar = poner la fecha y esperar al siguiente build. Netlify no construye
 * por que pase el tiempo, pero el bot de horarios empuja cada 6 horas y eso
 * dispara un deploy, asi que en la practica el retraso es de horas, no de dias.
 * Si hace falta antes, vale con lanzar un deploy a mano desde Netlify.
 */

const esFutura = (data) => {
    if (!(data.date instanceof Date)) return false;
    return data.date.getTime() > Date.now();
};

module.exports = {
    eleventyComputed: {
        // false = no se escribe el archivo. undefined = permalink por defecto.
        permalink: (data) => (esFutura(data) ? false : data.permalink),
        // Fuera de colecciones tambien, para que no aparezca en /blog/ ni en el
        // sitemap ni como "articulo destacado".
        eleventyExcludeFromCollections: (data) =>
            esFutura(data) ? true : data.eleventyExcludeFromCollections,
    },
};
