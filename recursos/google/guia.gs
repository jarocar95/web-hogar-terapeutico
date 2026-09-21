/**
 * Envio de la guia del sistema nervioso - Hogar Terapeutico
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

var ENLACE = "https://hogarterapeutico.com/guias/tecnicas-para-calmar-el-sistema-nervioso.pdf";
var ASUNTO = "Tu gu\u00eda para calmar el sistema nervioso";
var CUERPO = "Hola:\n\nAqu\u00ed tienes la gu\u00eda que pediste, con las diecisiete t\u00e9cnicas:\n\nhttps://hogarterapeutico.com/guias/tecnicas-para-calmar-el-sistema-nervioso.pdf\n\nUn consejo antes de empezar: no las practiques todas. Qu\u00e9date con dos o tres que encajen contigo y convi\u00e9rtelas en costumbre. La constancia importa mucho m\u00e1s que la variedad.\n\nY pract\u00edcalas cuando est\u00e9s tranquilo, no solo cuando las necesites. As\u00ed tu cuerpo ya sabr\u00e1 el camino cuando haga falta.\n\nSi algo de lo que hay ah\u00ed te remueve, o te surge cualquier duda, puedes responder a este correo.\n\nUn saludo,\n\nAngie S\u00e1nchez Gallego\nPsic\u00f3loga General Sanitaria \u00b7 Col. M-42569\nhogarterapeutico.com\n\n---\nRecibes este correo porque lo pediste en hogarterapeutico.com el __FECHA__. Tu direcci\u00f3n se ha usado solo para este env\u00edo: no est\u00e1s en ninguna lista y no recibir\u00e1s nada m\u00e1s. Si quieres que la borremos, responde a este correo y se hace.";
var REMITENTE = 'Angie S\u00e1nchez \u00b7 Hogar Terap\u00e9utico';

// No es seguridad de verdad: el token viaja en el HTML de la pagina. Sirve para
// que nadie que tropiece con la URL la use sin querer, y para poder cambiarlo si
// alguien empieza a abusar.
var TOKEN = 'hogarterapeutico-guia-2026';

// Tope diario. Sin el, un script ajeno podria agotar la cuota de envio de la
// cuenta de Angie, que es la misma que usa para escribir a sus pacientes.
var TOPE_DIARIO = 60;

var HOJA = 'Peticiones de la gu\u00eda';

function doPost(e) {
  try {
    var p = (e && e.parameter) || {};
    if (p.token !== TOKEN)          return responde(false, 'Token no v\u00e1lido.');
    if (p.consentimiento !== 'si')  return responde(false, 'Falta el consentimiento.');

    var correo = String(p.email || '').trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correo)) {
      return responde(false, 'Ese correo no parece v\u00e1lido.');
    }

    if (superaTope()) {
      return responde(false, 'Hoy no podemos enviar m\u00e1s. Int\u00e9ntalo ma\u00f1ana.');
    }

    MailApp.sendEmail({
      to: correo,
      subject: ASUNTO,
      body: cuerpoDeHoy(),
      htmlBody: htmlDeHoy(),
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

/**
 * Gmail agrupa por asunto y esconde el texto repetido de un hilo detras de un
 * "...". Si alguien pide la guia dos veces, el segundo correo le llega en
 * blanco. La fecha rompe esa coincidencia, y de paso le dice al que la recibe
 * cuando la pidio.
 */
function cuerpoDeHoy() {
  var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
               'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  // Con la hora, no solo la fecha: lo normal es que quien la repida lo haga el
  // mismo dia, y entonces dos cuerpos con la misma fecha volverian a ser iguales.
  var p = Utilities.formatDate(new Date(), 'Europe/Madrid', "d|M|yyyy|HH:mm").split('|');
  var fecha = p[0] + ' de ' + MESES[Number(p[1]) - 1] + ' de ' + p[2] + ' a las ' + p[3];
  return CUERPO.replace('__FECHA__', fecha);
}

/**
 * El mismo texto en HTML. Gmail parte el cuerpo de texto plano a 78 columnas
 * al enviarlo, asi que por ancha que sea la ventana el correo se lee en una
 * columna estrecha y desigual. En HTML los parrafos los reflua el cliente.
 * Se deriva de CUERPO para que las dos versiones no puedan separarse.
 */
function htmlDeHoy() {
  var partes = cuerpoDeHoy().split('\n---\n');
  var html = parrafos(partes[0], '');
  if (partes.length > 1) {
    html += '<hr style="border:0;border-top:1px solid #dddddd;margin:28px 0 18px">'
          + parrafos(partes[1], 'color:#767676;font-size:12px;');
  }
  return '<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;'
       + 'line-height:1.55;color:#222222">' + html + '</div>';
}

/** Un <p> por bloque separado por linea en blanco; los saltos sueltos, <br>. */
function parrafos(texto, estilo) {
  var bloques = texto.split('\n\n');
  var salida = [];
  for (var i = 0; i < bloques.length; i++) {
    var b = bloques[i].replace(/^\n+|\n+$/g, '');
    if (!b) continue;
    salida.push('<p style="margin:0 0 16px;' + estilo + '">'
                + enlaza(escapa(b)).replace(/\n/g, '<br>') + '</p>');
  }
  return salida.join('');
}

function escapa(t) {
  return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Primero las URL completas y luego el dominio suelto. El orden importa: el
 * segundo patron exige espacio o principio de linea delante, para no morder
 * el dominio que acaba de quedar dentro de un href.
 */
function enlaza(t) {
  return t
      .replace(/https:\/\/[^\s<]+/g, function (u) {
        return '<a href="' + u + '">' + u + '</a>';
      })
      .replace(/(^|[\s(])hogarterapeutico\.com/g,
               '$1<a href="https://hogarterapeutico.com">hogarterapeutico.com</a>');
}

function responde(ok, mensaje) {
  return ContentService
      .createTextOutput(JSON.stringify({ ok: ok, mensaje: mensaje }))
      .setMimeType(ContentService.MimeType.JSON);
}

/** Registro de consentimientos: sin el no hay forma de probar que se dio. */
function registrar(correo) {
  var hoja = hojaRegistro();
  hoja.appendRow([new Date(), correo, 'S\u00ed', 'Gu\u00eda del sistema nervioso']);
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
  var libro = SpreadsheetApp.create('Peticiones de la gu\u00eda \u00b7 Hogar Terap\u00e9utico');
  var hoja = libro.getSheets()[0];
  hoja.setName(HOJA);
  hoja.getRange('A1:D1')
      .setValues([['Fecha', 'Correo', 'Consentimiento', 'Gu\u00eda']])
      .setFontWeight('bold').setBackground('#F4E3DF').setFontColor('#6B4340');
  hoja.setFrozenRows(1);
  hoja.setColumnWidth(1, 160); hoja.setColumnWidth(2, 240); hoja.setColumnWidth(4, 220);
  PropertiesService.getScriptProperties().setProperty('HOJA_ID', libro.getId());
  Logger.log('HOJA DE REGISTRO: ' + libro.getUrl());
  Logger.log('Ahora: Implementar > Nueva implementacion > Aplicacion web.');
}

/** Comprobacion sin pasar por la web. envioDePrueba('tu@correo.com') */
function envioDePrueba(correo) {
  MailApp.sendEmail({ to: correo, subject: ASUNTO,
                      body: cuerpoDeHoy(), htmlBody: htmlDeHoy(),
                      name: REMITENTE, replyTo: 'info@hogarterapeutico.com' });
  Logger.log('Enviado a ' + correo + '. Comprueba desde que direccion llega.');
  Logger.log('Cuota de envio restante hoy: ' + MailApp.getRemainingDailyQuota());
}
