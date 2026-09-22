/**
 * Las opiniones de Doctoralia, en un solo sitio.
 *
 * El numero y la nota salen de src/_data/opiniones.json, que escribe
 * scraper.py cada 6 horas desde el JSON-LD de la propia ficha. Antes estaban
 * a mano en cuatro sitios de la portada y pasaba lo que tenia que pasar: el
 * 22 de septiembre de 2026 la web decia 23 opiniones cuando eran 25.
 *
 * Los valores de abajo son solo la red de seguridad para el caso en que el
 * archivo no exista todavia o venga incompleto, no la fuente de la verdad.
 */
const RESPALDO = {
    opiniones: 25,
    valoracion: "5,0",
    valoracionSchema: "5.0",
    comprobado: "2026-09-22",
};

module.exports = () => {
    let datos = {};
    try {
        // require cachea, pero a Eleventy le da igual: el archivo solo cambia
        // entre builds, nunca durante uno.
        datos = require("./opiniones.json");
    } catch (err) {
        console.warn("[doctoralia] Sin opiniones.json, se usan los valores de respaldo.");
    }

    return {
        opiniones: datos.total || RESPALDO.opiniones,
        valoracion: datos.media_texto || RESPALDO.valoracion,
        valoracionSchema: datos.media_schema || RESPALDO.valoracionSchema,
        comprobado: datos.actualizado || RESPALDO.comprobado,
        perfil: "https://www.doctoralia.es/angie-sanchez-gallego/psicologo/madrid",
    };
};
