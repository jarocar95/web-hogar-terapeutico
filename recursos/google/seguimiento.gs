/**
 * Cuestionario de seguimiento · Hogar Terapéutico
 * PHQ-9 + GAD-7 + pregunta de funcionamiento.
 *
 * GENERADO. No editar a mano: sale de recursos/generadores/google_seguimiento.py,
 * que lee los enunciados de recursos/contenido/seguimiento.py. Si se tocan aquí,
 * dejan de coincidir con el PDF y el Excel.
 *
 * Cómo se usa: pegar en script.google.com desde la cuenta de Angie y ejecutar
 * crearTodo() una vez. Deja el formulario, la hoja de respuestas y la de
 * corrección, y escribe en el registro el enlace base para prerrellenar.
 */

var OPCIONES   = ["Ningún día", "Varios días", "Más de la mitad de los días", "Casi todos los días"];
var DIFICULTAD = ["No ha sido difícil", "Un poco difícil", "Muy difícil", "Extremadamente difícil"];
var PHQ9       = ["Poco interés o placer en hacer las cosas", "Se ha sentido decaído/a, deprimido/a o sin esperanzas", "Ha tenido dificultad para quedarse o permanecer dormido/a, o ha dormido demasiado", "Se ha sentido cansado/a o con poca energía", "Sin apetito o ha comido en exceso", "Se ha sentido mal con usted mismo/a, o que es un fracaso o que ha quedado mal con usted mismo/a o con su familia", "Ha tenido dificultad para concentrarse en ciertas actividades, tales como leer el periódico o ver la televisión", "Se ha movido o hablado tan lento que otras personas podrían haberlo notado, o lo contrario: ha estado tan inquieto/a o agitado/a que se ha movido mucho más de lo normal", "Pensamientos de que estaría mejor muerto/a o de lastimarse de alguna manera"];
var GAD7       = ["Se ha sentido nervioso/a, ansioso/a o con los nervios de punta", "No ha podido dejar de preocuparse o controlar la preocupación", "Se ha preocupado demasiado por diferentes cosas", "Ha tenido dificultad para relajarse", "Se ha sentido tan inquieto/a que no ha podido quedarse quieto/a", "Se ha molestado o irritado fácilmente", "Ha tenido miedo de que algo terrible pudiera pasar"];
var FUNCION    = "Si marcó cualquiera de los problemas anteriores, ¿qué tanta dificultad le han dado estos problemas para hacer su trabajo, encargarse de las tareas del hogar o llevarse bien con otras personas?";
var ENCABEZADO = "Durante las últimas 2 semanas, ¿con qué frecuencia le han molestado los siguientes problemas?";

var TITULO = 'Cuestionario de seguimiento';
var AYUDA  = 'Tus respuestas las ve únicamente tu psicóloga. No hay respuestas '
           + 'correctas ni incorrectas.';

function crearTodo() {
  var form = FormApp.create(TITULO);
  form.setDescription(ENCABEZADO + '\n\n' + AYUDA);
  form.setCollectEmail(false);          // el correo identificaría; basta el código
  form.setRequireLogin(false);          // que no haga falta cuenta de Google
  form.setProgressBar(true);
  form.setConfirmationMessage('Recibido. Gracias.');

  // El código va prerrellenado en el enlace; se deja editable porque Forms no
  // permite bloquearlo, pero el paciente no tiene que tocarlo.
  var codigo = form.addTextItem()
      .setTitle('Código')
      .setHelpText('Ya viene puesto. Déjalo como está.')
      .setRequired(true);

  var seccionPHQ = form.addSectionHeaderItem()
      .setTitle('Bloque 1')
      .setHelpText('Durante las últimas 2 semanas, ¿con qué frecuencia le han '
                 + 'molestado los siguientes problemas?');
  PHQ9.forEach(function (texto, i) {
    form.addMultipleChoiceItem()
        .setTitle((i + 1) + '. ' + texto)
        .setChoiceValues(OPCIONES)
        .setRequired(true);
  });

  form.addSectionHeaderItem()
      .setTitle('Bloque 2')
      .setHelpText('Durante las últimas 2 semanas, ¿con qué frecuencia le han '
                 + 'molestado los siguientes problemas?');
  GAD7.forEach(function (texto, i) {
    form.addMultipleChoiceItem()
        .setTitle((i + 1) + '. ' + texto)
        .setChoiceValues(OPCIONES)
        .setRequired(true);
  });

  form.addSectionHeaderItem().setTitle('Para terminar');
  form.addMultipleChoiceItem()
      .setTitle(FUNCION)
      .setChoiceValues(DIFICULTAD)
      .setRequired(false);

  var hoja = SpreadsheetApp.create(TITULO + ' · respuestas');
  var antes = hoja.getSheets().map(function (h) { return h.getName(); });
  form.setDestination(FormApp.DestinationType.SPREADSHEET, hoja.getId());
  SpreadsheetApp.flush();

  // setDestination AÑADE la hoja de respuestas: getSheets()[0] seguiría siendo
  // la hoja por defecto y la corrección apuntaría a celdas vacías.
  hoja = SpreadsheetApp.openById(hoja.getId());
  var resp = hoja.getSheets().filter(function (h) {
    return antes.indexOf(h.getName()) === -1;
  })[0];
  if (!resp) throw new Error('No encuentro la hoja de respuestas que crea el formulario.');

  // fuera la hoja por defecto, que solo confunde
  hoja.getSheets().forEach(function (h) {
    if (h.getName() !== resp.getName() && h.getLastRow() === 0 && hoja.getSheets().length > 1) {
      hoja.deleteSheet(h);
    }
  });

  prepararCorreccion(hoja, resp);
  var base = urlPrerrellenado(form, codigo);

  Logger.log('FORMULARIO : ' + form.getPublishedUrl());
  Logger.log('EDITAR     : ' + form.getEditUrl());
  Logger.log('HOJA       : ' + hoja.getUrl());
  Logger.log('PRERRELLENO: ' + base);
  Logger.log('Para cada paciente, sustituir CODIGO_AQUI por su código.');
  return { formulario: form.getPublishedUrl(), hoja: hoja.getUrl(), base: base };
}

/** Enlace con el campo Código ya escrito. Se sustituye el testigo por el real. */
function urlPrerrellenado(form, itemCodigo) {
  var r = form.createResponse();
  r.withItemResponse(itemCodigo.asTextItem().createResponse('CODIGO_AQUI'));
  return r.toPrefilledUrl();
}

/** Tabla de enlaces, uno por código. enlaces(['AB-07','CD-12']) */
function enlaces(codigos) {
  var form = FormApp.openByUrl("PEGAR_AQUI_LA_URL_DE_EDICION");
  var item = form.getItems(FormApp.ItemType.TEXT)[0];
  codigos.forEach(function (c) {
    var r = form.createResponse();
    r.withItemResponse(item.asTextItem().createResponse(c));
    Logger.log(c + '\t' + r.toPrefilledUrl());
  });
}

/**
 * Hoja de corrección. Las columnas de trabajo (conversión de cada respuesta a
 * 0-3) van a la derecha, fuera de la vista pero consultables: si algún día una
 * puntuación no cuadra, se ve de dónde sale.
 */
function prepararCorreccion(hoja, resp) {
  var nombreResp = resp.getName();
  var c = hoja.insertSheet('Corrección', 0);

  c.getRange('A1:I1')
   .setValues([['Fecha', 'Código', 'PHQ-9', 'Nivel', 'GAD-7', 'Nivel',
                'Funcion.', 'Ítem 9', 'Aviso']])
   .setFontWeight('bold').setBackground('#F4E3DF').setFontColor('#6B4340');
  c.setFrozenRows(1);

  // AE: las cuatro etiquetas, para convertir texto a puntuación con MATCH
  c.getRange('AE1:AE4').setValues(OPCIONES.map(function (o) { return [o]; }));
  c.getRange('AF1:AF4').setValues(DIFICULTAD.map(function (o) { return [o]; }));
  c.getRange('AE1:AF4').setFontColor('#9C9C9C').setFontSize(8);
  c.getRange('AD1').setValue('etiquetas ↓').setFontColor('#9C9C9C').setFontSize(8);

  var FILAS = 300;
  var f = [];
  for (var i = 2; i <= FILAS; i++) {
    var conv = [];                                   // K..AA: 17 conversiones
    for (var j = 0; j < 17; j++) {
      var colResp = columna(3 + j);                  // C.. en la hoja de respuestas
      conv.push('=IF($A' + i + '="","",IFERROR(MATCH(\'' + nombreResp + '\'!'
              + colResp + i + ',' + (j === 16 ? '$AF$1:$AF$4' : '$AE$1:$AE$4')
              + ',0)-1,""))');
    }
    f.push({ fila: i, conv: conv });
  }

  // columnas visibles
  var vis = [];
  for (var i = 2; i <= FILAS; i++) {
    vis.push([
      '=IF(\'' + nombreResp + '\'!A' + i + '="","",\'' + nombreResp + '\'!A' + i + ')',
      '=IF($A' + i + '="","",\'' + nombreResp + '\'!B' + i + ')',
      '=IF($A' + i + '="","",SUM(K' + i + ':S' + i + '))',
      '=IF($C' + i + '="","",' + tramos(CORTES_PHQ, 'C' + i) + ')',
      '=IF($A' + i + '="","",SUM(T' + i + ':Z' + i + '))',
      '=IF($E' + i + '="","",' + tramos(CORTES_GAD, 'E' + i) + ')',
      '=IF($A' + i + '="","",AA' + i + ')',
      '=IF($A' + i + '="","",S' + i + ')',
      '=IF($A' + i + '="","",IF(S' + i + '>0,"⚠ Ítem 9 positivo: valorar riesgo",'
        + 'IF(C' + i + '>=15,"PHQ-9 alto",IF(E' + i + '>=15,"GAD-7 alto",""))))'
    ]);
  }
  c.getRange(2, 1, vis.length, 9).setFormulas(vis);
  var conv = f.map(function (x) { return x.conv; });
  c.getRange(2, 11, conv.length, 17).setFormulas(conv);
  c.getRange(1, 11, FILAS, 17).setFontColor('#BBBBBB').setFontSize(8);
  c.getRange('K1:AA1').setValues([[
    'phq1','phq2','phq3','phq4','phq5','phq6','phq7','phq8','phq9',
    'gad1','gad2','gad3','gad4','gad5','gad6','gad7','func']]);

  // el aviso del ítem 9 es lo que se escapa al mirar solo el total
  var regla = SpreadsheetApp.newConditionalFormatRule()
      .whenTextContains('Ítem 9')
      .setBackground('#F6E3DF').setFontColor('#6B4340').setBold(true)
      .setRanges([c.getRange('I2:I' + FILAS)]).build();
  c.setConditionalFormatRules([regla]);

  c.setColumnWidth(1, 140); c.setColumnWidth(2, 90);
  c.setColumnWidth(4, 130); c.setColumnWidth(6, 110); c.setColumnWidth(9, 230);
  c.hideColumns(11, 20);
}

function tramos(cortes, ref) {
  var s = '';
  var cierres = '';
  for (var i = 0; i < cortes.length - 1; i++) {
    s += 'IF(' + ref + '<=' + cortes[i][1] + ',"' + cortes[i][2] + '",';
    cierres += ')';
  }
  return s + '"' + cortes[cortes.length - 1][2] + '"' + cierres;
}

function columna(n) {
  var s = '';
  while (n > 0) { var r = (n - 1) % 26; s = String.fromCharCode(65 + r) + s; n = (n - 1 - r) / 26; }
  return s;
}
