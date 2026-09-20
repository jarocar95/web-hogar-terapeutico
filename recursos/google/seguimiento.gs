/**
 * Cuestionario de seguimiento - Hogar Terapeutico
 * PHQ-9 + GAD-7 + pregunta de funcionamiento.
 *
 * GENERADO. No editar a mano: sale de recursos/generadores/google_seguimiento.py,
 * que lee los enunciados de recursos/contenido/seguimiento.py. Si se tocan aqui,
 * dejan de coincidir con el PDF y el Excel.
 *
 * Como se usa: pegar en script.google.com desde la cuenta de Angie y ejecutar
 * crearTodo() una vez. Deja el formulario, la hoja de respuestas y la de
 * correccion, y escribe en el registro el enlace base para prerrellenar.
 */

var OPCIONES   = ["Ning\u00fan d\u00eda", "Varios d\u00edas", "M\u00e1s de la mitad de los d\u00edas", "Casi todos los d\u00edas"];
var DIFICULTAD = ["No ha sido dif\u00edcil", "Un poco dif\u00edcil", "Muy dif\u00edcil", "Extremadamente dif\u00edcil"];
var PHQ9       = ["Poco inter\u00e9s o placer en hacer las cosas", "Se ha sentido deca\u00eddo/a, deprimido/a o sin esperanzas", "Ha tenido dificultad para quedarse o permanecer dormido/a, o ha dormido demasiado", "Se ha sentido cansado/a o con poca energ\u00eda", "Sin apetito o ha comido en exceso", "Se ha sentido mal con usted mismo/a, o que es un fracaso o que ha quedado mal con usted mismo/a o con su familia", "Ha tenido dificultad para concentrarse en ciertas actividades, tales como leer el peri\u00f3dico o ver la televisi\u00f3n", "Se ha movido o hablado tan lento que otras personas podr\u00edan haberlo notado, o lo contrario: ha estado tan inquieto/a o agitado/a que se ha movido mucho m\u00e1s de lo normal", "Pensamientos de que estar\u00eda mejor muerto/a o de lastimarse de alguna manera"];
var GAD7       = ["Se ha sentido nervioso/a, ansioso/a o con los nervios de punta", "No ha podido dejar de preocuparse o controlar la preocupaci\u00f3n", "Se ha preocupado demasiado por diferentes cosas", "Ha tenido dificultad para relajarse", "Se ha sentido tan inquieto/a que no ha podido quedarse quieto/a", "Se ha molestado o irritado f\u00e1cilmente", "Ha tenido miedo de que algo terrible pudiera pasar"];
var FUNCION    = "Si marc\u00f3 cualquiera de los problemas anteriores, \u00bfqu\u00e9 tanta dificultad le han dado estos problemas para hacer su trabajo, encargarse de las tareas del hogar o llevarse bien con otras personas?";
var ENCABEZADO = "Durante las \u00faltimas 2 semanas, \u00bfcon qu\u00e9 frecuencia le han molestado los siguientes problemas?";
var CORTES_PHQ = [[0, 4, "M\u00ednima"], [5, 9, "Leve"], [10, 14, "Moderada"], [15, 19, "Moderadamente grave"], [20, 27, "Grave"]];
var CORTES_GAD = [[0, 4, "M\u00ednima"], [5, 9, "Leve"], [10, 14, "Moderada"], [15, 21, "Grave"]];

var TITULO = 'Cuestionario de seguimiento';
var AYUDA  = 'Tus respuestas las ve \u00fanicamente tu psic\u00f3loga. No hay respuestas '
           + 'correctas ni incorrectas.';

// Clausula del articulo 13 del RGPD. Va antes de la primera pregunta porque la
// informacion hay que darla EN EL MOMENTO de recoger el dato, no despues.
// Las respuestas son datos de salud: categoria especial del articulo 9.
var AVISO_RGPD = [
  'Protecci\u00f3n de datos',
  '',
  'Responsable: Angie S\u00e1nchez Gallego, psic\u00f3loga general sanitaria, colegiada '
  + 'M-42569. Contacto: info@hogarterapeutico.com',
  '',
  'Para qu\u00e9: seguir la evoluci\u00f3n de tu tratamiento. Tus respuestas son datos '
  + 'de salud y solo las consulta tu psic\u00f3loga.',
  '',
  'Por qu\u00e9 podemos tratarlos: porque t\u00fa lo consientes al responder, y porque '
  + 'son necesarios para tu asistencia sanitaria (art\u00edculo 9.2 del RGPD).',
  '',
  'No se te pide el nombre: el cuestionario se identifica con un c\u00f3digo que solo '
  + 'tu psic\u00f3loga sabe a qui\u00e9n corresponde.',
  '',
  'Qui\u00e9n m\u00e1s interviene: las respuestas se guardan en Google Workspace, que '
  + 'act\u00faa como encargado del tratamiento.',
  '',
  'Cu\u00e1nto se conservan: mientras dure el tratamiento y despu\u00e9s el plazo que exige '
  + 'la normativa sanitaria sobre historia cl\u00ednica.',
  '',
  'Tus derechos: puedes acceder, rectificar, suprimir, oponerte o retirar el '
  + 'consentimiento escribiendo a info@hogarterapeutico.com. Responder es '
  + 'voluntario y no responder no afecta a tu atenci\u00f3n.',
  '',
  'M\u00e1s informaci\u00f3n: hogarterapeutico.com/politica-privacidad'
].join('\n');

function crearTodo() {
  var form = FormApp.create(TITULO);
  form.setDescription(ENCABEZADO + '\n\n' + AYUDA);
  form.setCollectEmail(false);          // el correo identificaria; basta el codigo
  form.setRequireLogin(false);          // que no haga falta cuenta de Google
  form.setProgressBar(true);
  form.setConfirmationMessage('Recibido. Gracias.');

  // El codigo va prerrellenado en el enlace; se deja editable porque Forms no
  // permite bloquearlo, pero el paciente no tiene que tocarlo.
  form.addSectionHeaderItem()
      .setTitle('Antes de empezar')
      .setHelpText(AVISO_RGPD);

  var codigo = form.addTextItem()
      .setTitle('C\u00f3digo')
      .setHelpText('Ya viene puesto. D\u00e9jalo como est\u00e1.')
      .setRequired(true);

  var seccionPHQ = form.addSectionHeaderItem()
      .setTitle('Bloque 1')
      .setHelpText('Durante las \u00faltimas 2 semanas, \u00bfcon qu\u00e9 frecuencia le han '
                 + 'molestado los siguientes problemas?');
  PHQ9.forEach(function (texto, i) {
    form.addMultipleChoiceItem()
        .setTitle((i + 1) + '. ' + texto)
        .setChoiceValues(OPCIONES)
        .setRequired(true);
  });

  form.addSectionHeaderItem()
      .setTitle('Bloque 2')
      .setHelpText('Durante las \u00faltimas 2 semanas, \u00bfcon qu\u00e9 frecuencia le han '
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

  var hoja = SpreadsheetApp.create(TITULO + ' \u00b7 respuestas');
  var antes = hoja.getSheets().map(function (h) { return h.getName(); });
  form.setDestination(FormApp.DestinationType.SPREADSHEET, hoja.getId());
  SpreadsheetApp.flush();

  // setDestination ANADE la hoja de respuestas: getSheets()[0] seguiria siendo
  // la hoja por defecto y la correccion apuntaria a celdas vacias.
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
  Logger.log('Para cada paciente, sustituir CODIGO_AQUI por su c\u00f3digo.');
  return { formulario: form.getPublishedUrl(), hoja: hoja.getUrl(), base: base };
}

/** Enlace con el campo Codigo ya escrito. Se sustituye el testigo por el real. */
function urlPrerrellenado(form, itemCodigo) {
  var r = form.createResponse();
  r.withItemResponse(itemCodigo.createResponse('CODIGO_AQUI'));
  return r.toPrefilledUrl();
}

/** Tabla de enlaces, uno por codigo. enlaces(['AB-07','CD-12']) */
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
 * Hoja de correccion. Las columnas de trabajo (conversion de cada respuesta a
 * 0-3) van a la derecha, fuera de la vista pero consultables: si algun dia una
 * puntuacion no cuadra, se ve de donde sale.
 */
function prepararCorreccion(hoja, resp) {
  var nombreResp = resp.getName();
  var c = hoja.insertSheet('Correcci\u00f3n', 0);

  c.getRange('A1:I1')
   .setValues([['Fecha', 'C\u00f3digo', 'PHQ-9', 'Nivel', 'GAD-7', 'Nivel',
                'Funcion.', '\u00cdtem 9', 'Aviso']])
   .setFontWeight('bold').setBackground('#F4E3DF').setFontColor('#6B4340');
  c.setFrozenRows(1);

  // AE: las cuatro etiquetas, para convertir texto a puntuacion con MATCH
  c.getRange('AE1:AE4').setValues(OPCIONES.map(function (o) { return [o]; }));
  c.getRange('AF1:AF4').setValues(DIFICULTAD.map(function (o) { return [o]; }));
  c.getRange('AE1:AF4').setFontColor('#9C9C9C').setFontSize(8);
  c.getRange('AD1').setValue('etiquetas \u2193').setFontColor('#9C9C9C').setFontSize(8);

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
      '=IF($A' + i + '="","",IF(S' + i + '>0,"\u26a0 \u00cdtem 9 positivo: valorar riesgo",'
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

  // el aviso del item 9 es lo que se escapa al mirar solo el total
  var regla = SpreadsheetApp.newConditionalFormatRule()
      .whenTextContains('\u00cdtem 9')
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
