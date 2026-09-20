# -*- coding: utf-8 -*-
"""Genera el Apps Script del cuestionario de seguimiento para Google Forms.

El .gs se escribe desde contenido/seguimiento.py, el mismo modulo del que salen
el PDF y el Excel: los enunciados tienen una sola fuente y no pueden divergir.

Separacion que exige el encargo: el formulario que ve el paciente lleva SOLO los
items. Puntuaciones, tramos y avisos viven en la hoja de Angie, a la que el
paciente no tiene acceso por diseno.
"""
import os, sys, json
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
AQUI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DESTINO = os.path.join(AQUI, 'google', 'seguimiento.gs')

from contenido.seguimiento import (PHQ9, GAD7, FRECUENCIA, FUNCIONAMIENTO,
                                   DIFICULTAD, ENCABEZADO, CORTES_PHQ, CORTES_GAD)

js = lambda v: json.dumps(v, ensure_ascii=False)

PLANTILLA = '''/**
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

var OPCIONES   = %(opciones)s;
var DIFICULTAD = %(dificultad)s;
var PHQ9       = %(phq9)s;
var GAD7       = %(gad7)s;
var FUNCION    = %(funcion)s;
var ENCABEZADO = %(encabezado)s;

var TITULO = 'Cuestionario de seguimiento';
var AYUDA  = 'Tus respuestas las ve únicamente tu psicóloga. No hay respuestas '
           + 'correctas ni incorrectas.';

// Cláusula del artículo 13 del RGPD. Va antes de la primera pregunta porque la
// información hay que darla EN EL MOMENTO de recoger el dato, no después.
// Las respuestas son datos de salud: categoría especial del artículo 9.
var AVISO_RGPD = [
  'Protección de datos',
  '',
  'Responsable: Angie Sánchez Gallego, psicóloga general sanitaria, colegiada '
  + 'M-42569. Contacto: info@hogarterapeutico.com',
  '',
  'Para qué: seguir la evolución de tu tratamiento. Tus respuestas son datos '
  + 'de salud y solo las consulta tu psicóloga.',
  '',
  'Por qué podemos tratarlos: porque tú lo consientes al responder, y porque '
  + 'son necesarios para tu asistencia sanitaria (artículo 9.2 del RGPD).',
  '',
  'No se te pide el nombre: el cuestionario se identifica con un código que solo '
  + 'tu psicóloga sabe a quién corresponde.',
  '',
  'Quién más interviene: las respuestas se guardan en Google Workspace, que '
  + 'actúa como encargado del tratamiento.',
  '',
  'Cuánto se conservan: mientras dure el tratamiento y después el plazo que exige '
  + 'la normativa sanitaria sobre historia clínica.',
  '',
  'Tus derechos: puedes acceder, rectificar, suprimir, oponerte o retirar el '
  + 'consentimiento escribiendo a info@hogarterapeutico.com. Responder es '
  + 'voluntario y no responder no afecta a tu atención.',
  '',
  'Más información: hogarterapeutico.com/politica-privacidad'
].join('\\n');

function crearTodo() {
  var form = FormApp.create(TITULO);
  form.setDescription(ENCABEZADO + '\\n\\n' + AYUDA);
  form.setCollectEmail(false);          // el correo identificaría; basta el código
  form.setRequireLogin(false);          // que no haga falta cuenta de Google
  form.setProgressBar(true);
  form.setConfirmationMessage('Recibido. Gracias.');

  // El código va prerrellenado en el enlace; se deja editable porque Forms no
  // permite bloquearlo, pero el paciente no tiene que tocarlo.
  form.addSectionHeaderItem()
      .setTitle('Antes de empezar')
      .setHelpText(AVISO_RGPD);

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
  var form = FormApp.openByUrl(%(editar)s);
  var item = form.getItems(FormApp.ItemType.TEXT)[0];
  codigos.forEach(function (c) {
    var r = form.createResponse();
    r.withItemResponse(item.asTextItem().createResponse(c));
    Logger.log(c + '\\t' + r.toPrefilledUrl());
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
      conv.push('=IF($A' + i + '="","",IFERROR(MATCH(\\'' + nombreResp + '\\'!'
              + colResp + i + ',' + (j === 16 ? '$AF$1:$AF$4' : '$AE$1:$AE$4')
              + ',0)-1,""))');
    }
    f.push({ fila: i, conv: conv });
  }

  // columnas visibles
  var vis = [];
  for (var i = 2; i <= FILAS; i++) {
    vis.push([
      '=IF(\\'' + nombreResp + '\\'!A' + i + '="","",\\'' + nombreResp + '\\'!A' + i + ')',
      '=IF($A' + i + '="","",\\'' + nombreResp + '\\'!B' + i + ')',
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
  while (n > 0) { var r = (n - 1) %% 26; s = String.fromCharCode(65 + r) + s; n = (n - 1 - r) / 26; }
  return s;
}
'''

texto = PLANTILLA % {
    'opciones': js(FRECUENCIA),
    'dificultad': js(DIFICULTAD),
    'phq9': js(PHQ9),
    'gad7': js(GAD7),
    'funcion': js(FUNCIONAMIENTO),
    'encabezado': js(ENCABEZADO),
    'editar': js('PEGAR_AQUI_LA_URL_DE_EDICION'),
}
os.makedirs(os.path.dirname(DESTINO), exist_ok=True)
open(DESTINO, 'w', encoding='utf-8').write(texto)
print(f'  {os.path.relpath(DESTINO, AQUI)} · {len(texto)} bytes')
