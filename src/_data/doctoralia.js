/**
 * Las opiniones de Doctoralia, en un solo sitio.
 *
 * Estaban escritas a mano en tres: dos veces en la portada y una en el
 * reviewCount de schemas.njk. Actualizar dos de las tres y olvidar la
 * otra es lo facil, y la que mas duele olvidar es la del schema: un
 * reviewCount que no cuadra con la pagina es justo lo que Google mira
 * para retirar las estrellas del resultado de busqueda.
 *
 * Se actualiza a mano porque Doctoralia no da API publica. El numero
 * sale de la ficha, que lo dice en texto: "Un total de N pacientes han
 * querido dejar una opinion...".
 */
module.exports = {
    opiniones: 25,
    valoracion: "5,0",        // como se escribe en la pagina, con coma
    valoracionSchema: "5.0",  // como lo exige schema.org, con punto
    perfil: "https://www.doctoralia.es/angie-sanchez-gallego/psicologo/madrid",
    comprobado: "2026-09-22",
};
