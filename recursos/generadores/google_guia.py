# -*- coding: utf-8 -*-
"""Apps Script que envia la guia del sistema nervioso.

Se despliega como APLICACION WEB. El formulario del articulo le hace un fetch y
el script responde mandando el correo con MailApp, que envia desde la cuenta que
ejecuta el script: sale de info@hogarterapeutico.com y no de un servicio de
formularios. Ese era el motivo de no usar Formspree aqui.
"""
import os, sys, json
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
AQUI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DESTINO = os.path.join(AQUI, 'google', 'guia.gs')
from ascii_seguro import a_ascii

# Un parrafo por linea, sin cortes a mano. El cliente de correo envuelve segun el
# ancho que tenga; si venimos ya cortados a 80, en el movil cada linea se parte
# otra vez y el texto queda desmigado.
CUERPO = """Hola:

Aquí tienes la guía que pediste, con las diecisiete técnicas:

%(enlace)s

Un consejo antes de empezar: no las practiques todas. Quédate con dos o tres que encajen contigo y conviértelas en costumbre. La constancia importa mucho más que la variedad.

Y practícalas cuando estés tranquilo, no solo cuando las necesites. Así tu cuerpo ya sabrá el camino cuando haga falta.

Si algo de lo que hay ahí te remueve, o te surge cualquier duda, puedes responder a este correo.

Un saludo,

Angie Sánchez Gallego
Psicóloga General Sanitaria · Col. M-42569
hogarterapeutico.com

---
Recibes este correo porque lo pediste en hogarterapeutico.com. Tu dirección se ha usado solo para este envío: no estás en ninguna lista y no recibirás nada más. Si quieres que la borremos, responde a este correo y se hace."""

PLANTILLA = '''/**
 * Envio de la guia del sistema nervioso · Hogar Terapeutico
 *
 * GENERADO. Sale de recursos/generadores/google_guia.py.
 * ASCII a proposito: el portapapeles de macOS rompe los acentos al pegar.
 *
 * DESPLIEGUE (una vez, desde la cuenta de Angie):
 *   1. Pegar en un proyecto nuevo de script.google.com
 *   2. Ejecutar preparar() para crear la hoja de registro
 *   3. Implementar > Nueva implementacion > Aplicacion web
 *      - Ejecutar como: Yo (info@hogarterapeutico.com)
 *      - Quien tiene acceso: Cualquier usuario
 *   4. Copiar la URL /exec y ponerla en el formulario del articulo
 *
 * "Cualquier usuario" es necesario porque quien pide la guia no tiene cuenta.
 * El endpoint queda publico, de ahi el token y el tope diario de abajo.
 */

var ENLACE = %(enlace)s;
var ASUNTO = %(asunto)s;
var CUERPO = %(cuerpo)s;
var REMITENTE = 'Angie S\\u00e1nchez · Hogar Terap\\u00e9utico';

// No es seguridad de verdad: el token viaja en el HTML de la pagina. Sirve para
// que nadie que tropiece con la URL la use sin querer, y para poder cambiarlo si
// alguien empieza a abusar.
var TOKEN = 'hogarterapeutico-guia-2026';

// Tope diario. Sin el, un script ajeno podria agotar la cuota de envio de la
// cuenta de Angie, que es la misma que usa para escribir a sus pacientes.
var TOPE_DIARIO = 60;

var HOJA = 'Peticiones de la gu\\u00eda';

function doPost(e) {
  try {
    var p = (e && e.parameter) || {};
    if (p.token !== TOKEN)          return responde(false, 'Token no v\\u00e1lido.');
    if (p.consentimiento !== 'si')  return responde(false, 'Falta el consentimiento.');

    var correo = String(p.email || '').trim();
    if (!/^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(correo)) {
      return responde(false, 'Ese correo no parece v\\u00e1lido.');
    }

    if (superaTope()) {
      return responde(false, 'Hoy no podemos enviar m\\u00e1s. Int\\u00e9ntalo ma\\u00f1ana.');
    }

    MailApp.sendEmail({
      to: correo,
      subject: ASUNTO,
      body: CUERPO,
      name: REMITENTE,
      replyTo: 'info@hogarterapeutico.com'
    });

    registrar(correo);
    return responde(true, 'Enviada. Revisa tu correo.');
  } catch (err) {
    return responde(false, 'No se ha podido enviar: ' + err.message);
  }
}

function doGet() {
  return responde(false, 'Este endpoint solo acepta envios del formulario.');
}

function responde(ok, mensaje) {
  return ContentService
      .createTextOutput(JSON.stringify({ ok: ok, mensaje: mensaje }))
      .setMimeType(ContentService.MimeType.JSON);
}

/** Registro de consentimientos: sin el no hay forma de probar que se dio. */
function registrar(correo) {
  var hoja = hojaRegistro();
  hoja.appendRow([new Date(), correo, 'S\\u00ed', 'Gu\\u00eda del sistema nervioso']);
}

function hojaRegistro() {
  var id = PropertiesService.getScriptProperties().getProperty('HOJA_ID');
  var libro = id ? SpreadsheetApp.openById(id) : null;
  if (!libro) throw new Error('Falta la hoja de registro: ejecuta preparar() una vez.');
  return libro.getSheetByName(HOJA) || libro.getSheets()[0];
}

function superaTope() {
  var props = PropertiesService.getScriptProperties();
  var hoy = Utilities.formatDate(new Date(), 'Europe/Madrid', 'yyyy-MM-dd');
  var clave = 'envios_' + hoy;
  var n = Number(props.getProperty(clave) || 0);
  if (n >= TOPE_DIARIO) return true;
  props.setProperty(clave, String(n + 1));
  return false;
}

/** Se ejecuta UNA vez, antes de implementar. */
function preparar() {
  var libro = SpreadsheetApp.create('Peticiones de la gu\\u00eda \\u00b7 Hogar Terap\\u00e9utico');
  var hoja = libro.getSheets()[0];
  hoja.setName(HOJA);
  hoja.getRange('A1:D1')
      .setValues([['Fecha', 'Correo', 'Consentimiento', 'Gu\\u00eda']])
      .setFontWeight('bold').setBackground('#F4E3DF').setFontColor('#6B4340');
  hoja.setFrozenRows(1);
  hoja.setColumnWidth(1, 160); hoja.setColumnWidth(2, 240); hoja.setColumnWidth(4, 220);
  PropertiesService.getScriptProperties().setProperty('HOJA_ID', libro.getId());
  Logger.log('HOJA DE REGISTRO: ' + libro.getUrl());
  Logger.log('Ahora: Implementar > Nueva implementacion > Aplicacion web.');
}

/** Comprobacion sin pasar por la web. envioDePrueba('tu@correo.com') */
function envioDePrueba(correo) {
  MailApp.sendEmail({ to: correo, subject: ASUNTO, body: CUERPO,
                      name: REMITENTE, replyTo: 'info@hogarterapeutico.com' });
  Logger.log('Enviado a ' + correo + '. Comprueba desde que direccion llega.');
  Logger.log('Cuota de envio restante hoy: ' + MailApp.getRemainingDailyQuota());
}
'''

js = lambda v: json.dumps(v, ensure_ascii=False)
ENLACE = 'https://hogarterapeutico.com/guias/tecnicas-para-calmar-el-sistema-nervioso.pdf'
texto = a_ascii(PLANTILLA % {
    'enlace': js(ENLACE),
    'asunto': js('Tu guía para calmar el sistema nervioso'),
    'cuerpo': js(CUERPO % {'enlace': ENLACE}),
})
os.makedirs(os.path.dirname(DESTINO), exist_ok=True)
open(DESTINO, 'w', encoding='ascii').write(texto)
print(f'  google/guia.gs · {len(texto)} bytes')
