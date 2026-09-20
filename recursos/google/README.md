# Herramientas en Google Workspace

Versión de los cuestionarios para que el paciente responda desde el móvil, sin
instalar nada y sin cuenta de Google.

## Por qué Apps Script y no un conector

El script se ejecuta **dentro de la cuenta de Angie, con sus permisos**. Nadie
más toca sus credenciales y las respuestas de los pacientes no quedan al alcance
de herramientas externas. El conector de Google Drive que existe solo maneja
ficheros: no crea formularios ni escribe fórmulas, así que no servía.

## La regla que ordena todo esto

**El formulario que ve el paciente lleva solo los ítems.** Ni puntuaciones, ni
puntos de corte, ni avisos clínicos. Todo eso vive en la hoja de Angie, a la que
el paciente no tiene acceso por diseño, no por acuerdo.

## Desplegar

1. Entrar en [script.google.com](https://script.google.com) **con la cuenta de
   Angie**, no con otra.
2. Proyecto nuevo, pegar el contenido de `seguimiento.gs`.
3. Ejecutar `crearTodo()`. La primera vez pide autorización: es normal, el script
   necesita permiso para crear el formulario y la hoja.
4. En el registro de ejecución aparecen cuatro enlaces: el formulario, su edición,
   la hoja y la plantilla de prerrelleno.

## Enlaces por paciente

En la plantilla de prerrelleno, sustituir `CODIGO_AQUI` por el código de cada
persona. Para hacerlo en lote: pegar la URL de edición en la constante que hay al
principio de `enlaces()` y ejecutar `enlaces(['AB-07', 'CD-12'])`. Escribe la
tabla en el registro.

El código va prerrellenado para que nadie lo teclee: un código mal escrito deja
la respuesta huérfana en la hoja y no se detecta hasta semanas después. Forms no
permite bloquear el campo, así que el paciente podría cambiarlo; el daño máximo
es una fila espuria, porque el código no identifica a nadie sin la equivalencia
que guarda Angie.

## La hoja de corrección

- **A-I**: fecha, código, PHQ-9 con su tramo, GAD-7 con el suyo, funcionamiento,
  ítem 9 y aviso.
- **K-AA**: las 17 conversiones de texto a puntuación, ocultas. Si un día una
  puntuación no cuadra, ahí se ve de dónde sale.
- El aviso del **ítem 9** se resalta solo. Es lo que se escapa mirando el total:
  se puede tener un PHQ-9 de 8 con ideación.

Preparada para 300 respuestas. Pasadas esas, hay que arrastrar las fórmulas.

## Antes de usarlo con pacientes

Las respuestas son **datos de salud, categoría especial del artículo 9 del
RGPD**. Hace falta:

- Aceptar el anexo de tratamiento de datos de Google Workspace y comprobar qué
  dice el plan contratado sobre ubicación de los datos.
- Añadir a Google como encargado del tratamiento en el registro de actividades.
- Actualizar la política de privacidad de la web, que hoy dice que no se pide
  ningún dato de salud.

## No editar el .gs a mano

Sale de `recursos/generadores/google_seguimiento.py`, que lee los enunciados de
`recursos/contenido/seguimiento.py`, el mismo módulo del que salen el PDF y el
Excel. Si se tocan aquí, las tres versiones dejan de coincidir.
