#!/usr/bin/env node
/**
 * Validador de la parrilla semanal de marketing (docs/01-marketing.md).
 *
 *   npm run validar-parrilla -- 2026-11-02        (lunes de la semana)
 *   node scripts/agentes/validar-parrilla.js ruta/a/parrilla.json
 *
 * Es el contrato en forma de código: marketing.sh se lo pasa a Gemini y, si falla, le devuelve los
 * errores para que corrija. Los ERRORES bloquean; los AVISOS se muestran pero no bloquean.
 * Sale con código 0 si no hay errores, 1 si los hay.
 */
const fs = require('fs');
const path = require('path');

const DIA = 864e5;
const TIPOS = ['reel_angie', 'carrusel', 'trend', 'story', 'reel_sin_voz'];
const EXTRAS = ['story', 'reel_sin_voz'];
const OBJETIVOS = ['alcance', 'confianza', 'conversion'];
const CTAS = ['reservar', 'guardar', 'comentar', 'seguir', 'compartir'];
const PLATAFORMAS = ['instagram', 'tiktok'];
const PALANCAS = ['colaboracion', 'directorio', 'seo', 'lead_magnet', 'otro'];
const ESFUERZOS = ['bajo', 'medio', 'alto'];
const MAX_PALABRAS_GANCHO_PANTALLA = 6;
const MAX_PALABRAS_REEL = 225; // ≈ 90 s a ritmo de teleprompter
const MIN_PALABRAS_REEL = 60;

// Líneas rojas: AGENTS.md y docs/01-marketing.md. Cada regla se aplica a todo el texto de una pieza.
const REGLAS = [
    { id: 'promesa_curacion', re: /\b(te cur[oa]|curarte|cura(r|rte)? tu |curaci[oó]n (garantizada|asegurada|total)|sin esfuerzo|milagro)/i, msg: 'promete curación o resultados' },
    { id: 'garantia', re: /(garantiz\w+|asegura\w* (que )?(mejor|curar|resultado)|100 ?%|resultados? (seguros?|asegurados?))/i, msg: 'garantiza resultados o usa "100 %"' },
    { id: 'plazo', re: /\ben (solo |tan solo )?\d+ (d[ií]as|semanas|sesiones)\b/i, msg: 'promete un plazo de mejora' },
    { id: 'diagnostico', re: /\b(tienes|padeces|sufres|eres) (una? )?(depresi[oó]n|ansiedad|trastorno|tept|tdah|bipolar|narcisista|border|toc)\b/i, msg: 'diagnostica al espectador' },
    { id: 'paciente_real', re: /\b(mi|una|un|otra|otro|esa|ese) (paciente|consultante|cliente)s? (me (dijo|cont[oó]|escribi[oó])|vino|lleg[oó]|ven[ií]a)/i, msg: 'cuenta un caso de paciente como real (secreto profesional); un ejemplo es ficticio y debe decirlo' },
    { id: 'presencial', re: /(sesiones? presenciales?|consulta presencial|ven a mi consulta|te espero en (mi )?consulta|terapia presencial en madrid)(?![^.]{0,40}pr[oó]ximamente)/i, msg: 'presenta la terapia presencial como disponible' },
    { id: 'equipo', re: /\b(nuestro equipo|nuestros (psic[oó]logos|terapeutas|profesionales)|nuestra cl[ií]nica|somos un equipo)\b/i, msg: 'sugiere equipo o clínica; es una sola terapeuta' },
    { id: 'horario_tarde', re: /\b(sesiones? (de|por la) (tarde|noche)|por las tardes|de tarde|horario de tarde)\b/i, msg: 'ofrece sesiones de tarde o noche; solo hay mañanas' },
    { id: 'decision_cerrada', re: /(google (my )?business|ficha de google|enlace (desde|en|a) doctoralia|doctoralia.{0,30}enlace)/i, msg: 'propone una vía descartada (Google Business Profile / enlace desde Doctoralia)' },
    { id: 'canal_inactivo', re: /\b(youtube|shorts de youtube|facebook)\b/i, msg: 'planifica un canal que no se trabaja (YouTube parado, Facebook replica Instagram solo)' },
];
const CRISIS = /(suicid|autolesi|quitarse la vida|quitarme la vida|hacerse da[ñn]o)/i;

const palabras = (s) => String(s || '').trim().split(/\s+/).filter(Boolean).length;
const esTexto = (v, min = 1) => typeof v === 'string' && v.trim().length >= min;
const iso = (d) => d.toISOString().slice(0, 10);
const aFecha = (s) => (/^\d{4}-\d{2}-\d{2}$/.test(s) ? new Date(s + 'T00:00:00Z') : null);

/** Junta todos los textos que el público verá (o escuchará) de una pieza. */
function textosDe(pieza) {
    const t = [];
    const add = (v) => { if (typeof v === 'string') t.push(v); };
    (pieza.ganchos || []).forEach(add);
    add(pieza.gancho_pantalla); add(pieza.pie); add(pieza.tema); add(pieza.cta_texto);
    (pieza.hashtags || []).forEach(add);
    (pieza.guion || []).forEach(add);
    (pieza.slides || []).forEach((s) => add(s && s.texto));
    (pieza.afirmaciones_clinicas || []).forEach((a) => add(a && a.texto));
    add(pieza.mecanica_original); add(pieza.encaje_psicologia);
    return t;
}

function validar(p) {
    const errores = [];
    const avisos = [];
    const err = (m) => errores.push(m);
    const avi = (m) => avisos.push(m);

    if (!p || typeof p !== 'object') return { errores: ['La parrilla no es un objeto JSON'], avisos };

    // --- Semana ---
    const desde = aFecha(p.desde);
    const hasta = aFecha(p.hasta);
    if (!desde || desde.getUTCDay() !== 1) err('`desde` debe ser un lunes con formato AAAA-MM-DD');
    if (!hasta || (desde && iso(hasta) !== iso(new Date(desde.getTime() + 6 * DIA)))) err('`hasta` debe ser el domingo de esa semana (desde + 6 días)');
    if (p.semana !== p.desde) err('`semana` debe ser igual a `desde` (el lunes)');
    if (!esTexto(p.estrategia, 40)) err('`estrategia` es obligatoria (mínimo 40 caracteres)');

    // --- Experimento y palanca de crecimiento ---
    const ex = p.experimento;
    if (!ex || !['hipotesis', 'variante_a', 'variante_b', 'metrica', 'asignacion'].every((k) => esTexto(ex[k], 5))) {
        err('`experimento` necesita hipotesis, variante_a, variante_b, metrica y asignacion (qué variante va en qué publicación)');
    }
    const pa = p.palanca_crecimiento;
    if (!pa || !PALANCAS.includes(pa.tipo) || !esTexto(pa.accion, 15) || !ESFUERZOS.includes(pa.esfuerzo)) {
        err('`palanca_crecimiento` necesita tipo (' + PALANCAS.join('|') + '), accion y esfuerzo (' + ESFUERZOS.join('|') + ')');
    }

    // --- Piezas: cuántas de cada tipo ---
    const piezas = Array.isArray(p.piezas) ? p.piezas : [];
    if (!piezas.length) { err('`piezas` está vacío'); return { errores, avisos }; }
    const cuenta = (t) => piezas.filter((x) => x && x.tipo === t).length;
    if (cuenta('reel_angie') !== 1) err('Debe haber exactamente 1 pieza reel_angie (hay ' + cuenta('reel_angie') + '): Angie solo se graba una vez por semana');
    const nCar = cuenta('carrusel');
    if (nCar < 1 || nCar > 2) err('Debe haber entre 1 y 2 carruseles (hay ' + nCar + ')');
    else if (nCar !== 1) avi('Hay ' + nCar + ' carruseles; lo normal es 1');
    const nTrend = cuenta('trend');
    if (nTrend > 2) err('Como mucho 2 trends (hay ' + nTrend + ')');
    if (nTrend === 0 && !esTexto(p.sin_trend_motivo, 20)) err('Sin trend esta semana: explica por qué en `sin_trend_motivo`');
    if (cuenta('story') + cuenta('reel_sin_voz') > 2) err('Como mucho 2 extras (story / reel_sin_voz)');
    if (piezas.length > 5) err('Máximo 5 piezas en total (hay ' + piezas.length + ')');

    const ids = new Set();
    for (const [i, pz] of piezas.entries()) {
        const n = 'piezas[' + i + ']' + (pz && pz.id ? ' (' + pz.id + ')' : '');
        if (!pz || typeof pz !== 'object') { err(n + ': no es un objeto'); continue; }
        if (!esTexto(pz.id)) err(n + ': falta `id`');
        else if (ids.has(pz.id)) err(n + ': `id` repetido');
        else ids.add(pz.id);
        if (!TIPOS.includes(pz.tipo)) { err(n + ': `tipo` debe ser uno de ' + TIPOS.join('|')); continue; }
        if (!esTexto(pz.tema, 5)) err(n + ': falta `tema`');
        if (!OBJETIVOS.includes(pz.objetivo)) err(n + ': `objetivo` debe ser ' + OBJETIVOS.join('|'));
        if (!Array.isArray(pz.ganchos) || pz.ganchos.length !== 3 || !pz.ganchos.every((g) => esTexto(g, 4))) err(n + ': hacen falta exactamente 3 `ganchos`');
        if (!esTexto(pz.gancho_pantalla)) err(n + ': falta `gancho_pantalla`');
        else if (palabras(pz.gancho_pantalla) > MAX_PALABRAS_GANCHO_PANTALLA) err(n + ': `gancho_pantalla` tiene ' + palabras(pz.gancho_pantalla) + ' palabras (máximo ' + MAX_PALABRAS_GANCHO_PANTALLA + ')');
        if (!esTexto(pz.pie, 20)) err(n + ': falta `pie` (mínimo 20 caracteres)');
        if (!Array.isArray(pz.hashtags) || pz.hashtags.length < 3 || pz.hashtags.length > 5 || !pz.hashtags.every((h) => /^#\S+$/.test(h))) err(n + ': `hashtags` debe tener 3–5 elementos que empiecen por #');
        if (!CTAS.includes(pz.cta)) err(n + ': `cta` debe ser ' + CTAS.join('|'));

        // Publicaciones dentro de la semana
        const pubs = Array.isArray(pz.publicaciones) ? pz.publicaciones : [];
        if (!pubs.length) err(n + ': `publicaciones` está vacío');
        let primera = null;
        for (const [j, pb] of pubs.entries()) {
            const m = n + '.publicaciones[' + j + ']';
            const f = pb && aFecha(pb.fecha);
            if (!f) { err(m + ': `fecha` inválida'); continue; }
            if (desde && hasta && (f < desde || f > hasta)) err(m + ': la fecha ' + pb.fecha + ' queda fuera de la semana');
            if (!primera || f < primera) primera = f;
            if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(pb.hora || '')) err(m + ': `hora` debe ser HH:MM');
            if (!PLATAFORMAS.includes(pb.plataforma)) err(m + ': `plataforma` debe ser ' + PLATAFORMAS.join('|'));
            if (!esTexto(pb.formato)) err(m + ': falta `formato`');
        }

        // Campos propios de cada tipo
        if (pz.tipo === 'reel_angie') {
            const g = Array.isArray(pz.guion) ? pz.guion : [];
            const total = g.reduce((s, x) => s + palabras(x), 0);
            if (!g.length || !g.every((x) => esTexto(x))) err(n + ': falta `guion` (lista de frases)');
            else if (total > MAX_PALABRAS_REEL) err(n + ': el guion tiene ' + total + ' palabras (máximo ' + MAX_PALABRAS_REEL + ' ≈ 90 s)');
            else if (total < MIN_PALABRAS_REEL) avi(n + ': el guion solo tiene ' + total + ' palabras (menos de ~25 s); ¿es suficiente?');
            if (!Array.isArray(pz.claves) || pz.claves.length < 3 || pz.claves.length > 4) err(n + ': `claves` debe tener 3–4 palabras clave');
            if (pz.requiere_aprobacion_angie !== true) err(n + ': `requiere_aprobacion_angie` debe ser true (el guion lo aprueba Angie)');
            const fg = aFecha(pz.fecha_grabacion_angie);
            if (!fg) err(n + ': falta `fecha_grabacion_angie` (AAAA-MM-DD)');
            else if (primera && primera.getTime() - fg.getTime() < 2 * DIA) err(n + ': Angie debe grabar al menos 2 días antes de publicar (producción necesita margen)');
        }
        if (pz.tipo === 'carrusel') {
            const s = Array.isArray(pz.slides) ? pz.slides : [];
            if (s.length < 5 || s.length > 10 || !s.every((x) => x && esTexto(x.texto))) err(n + ': `slides` debe tener 5–10 diapositivas con `texto`');
            s.forEach((x, k) => { if (x && palabras(x.texto) > 40) avi(n + ': la diapositiva ' + (k + 1) + ' tiene ' + palabras(x.texto) + ' palabras; ¿demasiado texto?'); });
        }
        if (pz.tipo === 'trend') {
            if (!esTexto(pz.mecanica_original, 15)) err(n + ': falta `mecanica_original`');
            if (!esTexto(pz.encaje_psicologia, 30)) err(n + ': falta `encaje_psicologia` (por qué encaja sin forzarlo)');
            if (!['bajo', 'medio'].includes(pz.riesgo)) err(n + ': `riesgo` debe ser bajo|medio; un trend de riesgo alto no se propone');
            if (pz.requiere_grabacion_angie !== false) err(n + ': `requiere_grabacion_angie` debe ser false: Angie solo se graba una vez por semana (el reel); el trend usa material ya existente o no sale ella');
            if (typeof pz.trend_real !== 'boolean') err(n + ': falta `trend_real` (true solo si Javi aportó un trend concreto; false si es un formato propio)');
            else if (pz.trend_real === false) avi(n + ': no hay un trend real identificado (marketing no ve las tendencias del día); Javi debe aportar uno en las notas o tratarlo como formato propio');
        }

        // Afirmaciones clínicas: con fuente o marcadas para Angie
        const afs = Array.isArray(pz.afirmaciones_clinicas) ? pz.afirmaciones_clinicas : [];
        afs.forEach((a, k) => {
            if (!a || !esTexto(a.texto)) { err(n + '.afirmaciones_clinicas[' + k + ']: falta `texto`'); return; }
            if (!esTexto(a.fuente) && a.revisa_angie !== true) err(n + '.afirmaciones_clinicas[' + k + ']: sin `fuente` ni `revisa_angie: true`');
            if (esTexto(a.fuente) && a.fuente_verificada !== true) avi(n + '.afirmaciones_clinicas[' + k + ']: la fuente «' + a.fuente.slice(0, 50) + '…» la cita el modelo de memoria; hay que verificarla contra el original antes de publicar');
        });

        // Líneas rojas sobre todo el texto
        const textos = textosDe(pz);
        const todo = textos.join('\n');
        const fem = todo.match(/(?<!agua )\b(fr[ií]a|tranquila|cansada|exagerada|agotada|nerviosa|d[eé]bil|rota)\b/i);
        if (fem && !/\b(fr[ií]o|tranquilo|cansado|exagerado|agotado|nervioso|roto)\b/i.test(todo)) {
            avi(n + ': se dirige al público solo en femenino («' + fem[0] + '»); ¿lenguaje inclusivo?');
        }
        for (const r of REGLAS) {
            const m = todo.match(r.re);
            if (m) err(n + ': ' + r.msg + ' («' + m[0].trim() + '»)');
        }
        for (const m of todo.matchAll(/(\d+(?:[.,]\d+)?)\s?€/g)) {
            if (!['35', '50'].includes(m[1])) err(n + ': precio «' + m[0] + '» no publicado (solo 35 € y 50 €)');
        }
        if (CRISIS.test(todo)) {
            if (pz.recursos_crisis !== true) err(n + ': habla de suicidio o autolesión y falta `recursos_crisis: true`');
            if (!/\b024\b/.test(todo)) err(n + ': habla de suicidio o autolesión y no muestra la línea 024');
        }
    }

    // La palanca de crecimiento y el experimento también respetan las decisiones cerradas
    const extra = [pa && pa.accion, ex && ex.hipotesis, p.estrategia, p.sin_trend_motivo].filter((x) => typeof x === 'string').join('\n');
    const cerrada = extra.match(REGLAS.find((r) => r.id === 'decision_cerrada').re);
    if (cerrada) err('La estrategia/palanca propone una vía descartada («' + cerrada[0].trim() + '»)');

    return { errores, avisos };
}

function resolverRuta(arg) {
    if (!arg) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(arg)) {
        return path.join(__dirname, '..', '..', 'docs', 'marketing', 'semanas', arg, 'parrilla.json');
    }
    return path.resolve(arg);
}

function main() {
    const ruta = resolverRuta(process.argv[2]);
    if (!ruta) { console.error('Uso: validar-parrilla.js <lunes AAAA-MM-DD | ruta/parrilla.json>'); process.exit(2); }
    let parrilla;
    try { parrilla = JSON.parse(fs.readFileSync(ruta, 'utf8')); }
    catch (e) { console.error('No se puede leer ' + ruta + ': ' + e.message); process.exit(2); }
    const { errores, avisos } = validar(parrilla);
    avisos.forEach((a) => console.log('AVISO  ' + a));
    errores.forEach((e) => console.log('ERROR  ' + e));
    if (errores.length) { console.log('\n' + errores.length + ' error(es). La parrilla no cumple el contrato (docs/01-marketing.md).'); process.exit(1); }
    console.log('Parrilla válida' + (avisos.length ? ' (con ' + avisos.length + ' aviso/s)' : '') + ': ' + ruta);
}

if (require.main === module) main();
module.exports = { validar, REGLAS };
