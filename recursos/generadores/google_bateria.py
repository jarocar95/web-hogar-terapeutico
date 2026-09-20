# -*- coding: utf-8 -*-
"""Apps Script del formulario de evaluacion completo: los nueve instrumentos.

Sale de contenido/bateria.py, que a su vez se extrajo del libro de evaluacion.
Los enunciados tienen una sola fuente.

Como en el de seguimiento: el formulario lleva SOLO los items. La correccion no
existe aqui; vive en la hoja de Angie.
"""
import os, sys, json
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
AQUI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DESTINO = os.path.join(AQUI, 'google', 'bateria.gs')

from ascii_seguro import a_ascii
from contenido.bateria import BATERIA, ESCALAS

js = lambda v: json.dumps(v, ensure_ascii=False)
ORDEN = ['stai_e', 'stai_r', 'bdi', '5big', 'af5', 'hipno', 'apego', 'aron',
         'creencias', 'iatp']
TROZO = 25          # adjetivos por pregunta de casillas; 146 en una sola no se maneja

PLANTILLA = '''/**
 * Evaluacion psicologica · Hogar Terapeutico
 * %(resumen)s
 *
 * GENERADO. No editar a mano: sale de recursos/generadores/google_bateria.py,
 * que lee recursos/contenido/bateria.py. Si se toca aqui, deja de coincidir con
 * el libro de evaluacion del que se extrajo.
 *
 * El .gs va en ASCII con los acentos escapados a \\uXXXX a proposito: el
 * portapapeles de macOS los rompe al pegar. No "arreglarlos".
 *
 * Uso: pegar en script.google.com desde la cuenta de Angie y ejecutar crearTodo().
 */

// Con false el paciente responde sin cuenta de Google y sin quedar identificado,
// pero Forms NO le guarda el progreso: si cierra, pierde lo respondido. Con true
// puede continuar otro dia, a costa de que su cuenta de Google quede asociada.
// En un formulario de %(total)d items esta eleccion pesa. Es una sola palabra.
var EXIGIR_CUENTA = false;

var ESCALAS   = %(escalas)s;
var SECCIONES = %(secciones)s;
var TROZO     = %(trozo)d;

var TITULO = 'Evaluaci\\u00f3n psicol\\u00f3gica';
var AVISO_RGPD = %(aviso)s;

function crearTodo() {
  var form = FormApp.create(TITULO);
  form.setDescription(
      'Este cuestionario re\\u00fane varias escalas. Es largo: cont\\u00e9stalo con calma '
    + 'y sin pensar demasiado cada frase, que suele acertarse m\\u00e1s a la primera.'
    + (EXIGIR_CUENTA ? '' : '\\n\\nIMPORTANTE: no se guarda el progreso. Res\\u00e9rvate un rato seguido.'));
  form.setCollectEmail(false);
  form.setRequireLogin(EXIGIR_CUENTA);
  form.setProgressBar(true);
  form.setConfirmationMessage('Recibido. Gracias por el tiempo que le has dedicado.');

  form.addSectionHeaderItem().setTitle('Antes de empezar').setHelpText(AVISO_RGPD);
  var codigo = form.addTextItem()
      .setTitle('C\\u00f3digo')
      .setHelpText('Ya viene puesto. D\\u00e9jalo como est\\u00e1.')
      .setRequired(true);

  SECCIONES.forEach(function (s) {
    form.addPageBreakItem().setTitle(s.rotulo).setHelpText(s.enunciado);
    if (s.tipo === 'escala')    seccionEscala(form, s);
    else if (s.tipo === 'numero')    seccionNumero(form, s);
    else if (s.tipo === 'grupos')    seccionGrupos(form, s);
    else if (s.tipo === 'lista')     seccionLista(form, s, null);
    else if (s.tipo === 'lista_cat') seccionListaCat(form, s);
  });

  var hoja = SpreadsheetApp.create(TITULO + ' \\u00b7 respuestas');
  var antes = hoja.getSheets().map(function (h) { return h.getName(); });
  form.setDestination(FormApp.DestinationType.SPREADSHEET, hoja.getId());
  SpreadsheetApp.flush();
  hoja = SpreadsheetApp.openById(hoja.getId());
  // setDestination ANIADE la hoja: getSheets()[0] seria la de por defecto
  var resp = hoja.getSheets().filter(function (h) {
    return antes.indexOf(h.getName()) === -1;
  })[0];
  if (!resp) throw new Error('No encuentro la hoja de respuestas.');
  hoja.getSheets().forEach(function (h) {
    if (h.getName() !== resp.getName() && h.getLastRow() === 0 && hoja.getSheets().length > 1) {
      hoja.deleteSheet(h);
    }
  });

  var r = form.createResponse();
  r.withItemResponse(codigo.createResponse('CODIGO_AQUI'));

  Logger.log('FORMULARIO : ' + form.getPublishedUrl());
  Logger.log('EDITAR     : ' + form.getEditUrl());
  Logger.log('HOJA       : ' + hoja.getUrl());
  Logger.log('PRERRELLENO: ' + r.toPrefilledUrl());
  Logger.log('Preguntas creadas: ' + form.getItems().length);
}

function seccionEscala(form, s) {
  var opciones = ESCALAS[s.escala];
  s.items.forEach(function (texto, i) {
    form.addMultipleChoiceItem()
        .setTitle((i + 1) + '. ' + texto)
        .setChoiceValues(opciones)
        .setRequired(true);
  });
}

function seccionNumero(form, s) {
  var val = FormApp.createTextValidation()
      .setHelpText('Escribe un n\\u00famero entre ' + s.minimo + ' y ' + s.maximo + '.')
      .requireNumberBetween(s.minimo, s.maximo).build();
  s.items.forEach(function (texto, i) {
    form.addTextItem()
        .setTitle((i + 1) + '. ' + texto)
        .setValidation(val)
        .setRequired(true);
  });
}

function seccionGrupos(form, s) {
  s.items.forEach(function (g, i) {
    form.addMultipleChoiceItem()
        .setTitle((i + 1) + '. ' + g.titulo)
        .setChoiceValues(g.opciones)
        .setRequired(true);
  });
}

/** Las listas van como casillas: es una seleccion multiple, no una escala. */
function seccionLista(form, s, etiqueta) {
  var items = s.items, n = Math.ceil(items.length / TROZO);
  for (var t = 0; t < n; t++) {
    var trozo = items.slice(t * TROZO, (t + 1) * TROZO);
    var titulo = etiqueta || s.rotulo;
    if (n > 1) titulo += ' (' + (t + 1) + ' de ' + n + ')';
    form.addCheckboxItem()
        .setTitle(titulo)
        .setChoiceValues(trozo)
        .setRequired(false);
  }
}

function seccionListaCat(form, s) {
  var cats = [];
  s.items.forEach(function (x) {
    if (cats.indexOf(x.categoria) === -1) cats.push(x.categoria);
  });
  cats.forEach(function (c) {
    var textos = s.items.filter(function (x) { return x.categoria === c; })
                        .map(function (x) { return x.texto; });
    form.addCheckboxItem().setTitle(c).setChoiceValues(textos).setRequired(false);
  });
}

/** Enlaces prerrellenados, uno por codigo. enlaces(['AB-07','CD-12']) */
function enlaces(codigos) {
  var form = FormApp.openByUrl('PEGAR_AQUI_LA_URL_DE_EDICION');
  var item = form.getItems(FormApp.ItemType.TEXT)[0];
  codigos.forEach(function (c) {
    var r = form.createResponse();
    r.withItemResponse(item.asTextItem().createResponse(c));
    Logger.log(c + '\\t' + r.toPrefilledUrl());
  });
}
'''

AVISO = '\n'.join([
    'Protección de datos',
    '',
    'Responsable: Angie Sánchez Gallego, psicóloga general sanitaria, colegiada '
    'M-42569. Contacto: info@hogarterapeutico.com',
    '',
    'Para qué: evaluación psicológica dentro de tu proceso. Tus respuestas son '
    'datos de salud y solo las consulta tu psicóloga.',
    '',
    'Por qué podemos tratarlos: porque tú lo consientes al responder, y porque son '
    'necesarios para tu asistencia sanitaria (artículo 9.2 del RGPD).',
    '',
    'No se te pide el nombre: el cuestionario se identifica con un código que solo '
    'tu psicóloga sabe a quién corresponde.',
    '',
    'Quién más interviene: las respuestas se guardan en Google Workspace, que actúa '
    'como encargado del tratamiento.',
    '',
    'Cuánto se conservan: mientras dure el tratamiento y después el plazo que exige '
    'la normativa sanitaria sobre historia clínica.',
    '',
    'Tus derechos: puedes acceder, rectificar, suprimir, oponerte o retirar el '
    'consentimiento escribiendo a info@hogarterapeutico.com. Responder es voluntario '
    'y no responder no afecta a tu atención.',
    '',
    'Más información: hogarterapeutico.com/politica-privacidad',
])

secciones = [dict(BATERIA[k], clave=k) for k in ORDEN]
total = sum(len(s['items']) for s in secciones)
resumen = ' · '.join(f"{s['rotulo'].split(' (')[0]} ({len(s['items'])})" for s in secciones)

texto = a_ascii(PLANTILLA % {
    'escalas': js(ESCALAS),
    'secciones': js(secciones),
    'trozo': TROZO,
    'aviso': js(AVISO),
    'total': total,
    'resumen': resumen,
})
os.makedirs(os.path.dirname(DESTINO), exist_ok=True)
open(DESTINO, 'w', encoding='ascii').write(texto)
print(f"  google/bateria.gs · {len(texto)} bytes · {total} ítems en {len(secciones)} secciones")
for s in secciones:
    print(f"    {s['rotulo'][:44]:46} {s['tipo']:10} {len(s['items']):>4}")
