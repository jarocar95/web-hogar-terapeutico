# Cómo se escribe el blog de Hogar Terapéutico

Esta guía describe cómo se escriben los artículos **hoy**, no cómo nos gustaría
que fueran. Casi todo lo que hay aquí sale de leer los once artículos
publicados y anotar lo que ya funciona.

Se actualizó por última vez el 23 de septiembre de 2026.

---

## 1. Para qué existe el blog

Para que alguien que escribe su problema en Google —«no puedo dormir de la
ansiedad», «cómo sé si necesito un psicólogo», «cuánto cuesta la terapia»—
encuentre una respuesta de verdad, escrita por una profesional, y no una
página que le dé vueltas hasta el formulario de contacto.

De ahí salen las tres exigencias, en este orden:

1. **Fiable.** Lo firma una colegiada (M-42569) y trata salud mental. Un dato
   mal citado no es un fallo de estilo, es un problema profesional para Angie.
2. **Útil de verdad.** El lector tiene que irse sabiendo algo que no sabía,
   aunque no reserve nunca. Si el artículo solo sirve para vender, no sirve.
3. **Encontrable.** Sin esto lo anterior da igual, porque no llega nadie.

El orden importa. Cuando el SEO pida una cosa y la honestidad otra, gana la
honestidad: una web de psicología que exagera para posicionar se nota, y lo
que pierde es lo único que vende aquí, que es la confianza.

---

## 2. Quién escribe qué

- **Los artículos los redacto yo (Claude)**, en la voz de Angie, y con toda la
  documentación contrastada.
- **Angie los revisa.** Lleva la revisión al día, así que se da por bueno lo
  entregado salvo que Javier diga lo contrario. Él traslada las correcciones.
- **Javier decide el calendario** y lo publica.

Esto no exime de nada: el listón de veracidad es el mismo que si nadie fuera a
revisarlo.

---

## 3. La voz

Segunda persona, tuteo, frases cortas. El lector está mal o preocupado por
alguien: no está para párrafos de seis líneas.

**Se empieza por el síntoma, no por la definición.** Así abren los artículos
que mejor funcionan:

> Llegas a casa, cierras la puerta y no pasa nada. No hay nadie. No hay
> peligro. Y sin embargo sigues escuchando.

> ¿Te ha pasado alguna vez pensar «no es para tanto, otras personas lo tienen
> peor» justo cuando más necesitabas hablar con alguien?

Primero se describe la experiencia con tanta precisión que el lector se
reconozca. Después se explica qué es. Nunca al revés.

**Validar no es consolar.** «No estás exagerando» sirve. «Todo va a ir bien»
no, porque no lo sabemos.

**Decir lo que no se sabe.** Es el rasgo que distingue a este blog y no se
negocia:

> Y ahora la parte honesta: todo esto ensancha el margen, no borra el origen.

> Sobre la evidencia, prefiero ser precisa en lugar de rotunda.

Cuando un estudio tiene limitaciones, se cuentan. Cuando una técnica no
sustituye a la terapia, se dice. Cuando algo puede estar contraindicado, se
avisa antes de explicarlo, no en una nota al pie.

**Metáforas concretas, del mundo del lector.** «Un fondo de alerta que no se
apaga». «Dormir mal es empezar el día con la batería al 10 %». Nada de
«viaje», «sanar tu niño interior» ni vocabulario de taller de fin de semana.

**Lo que no se hace nunca:** prometer resultados, poner plazos («en dos
semanas estarás mejor»), inventar casos de pacientes, diagnosticar al lector,
ni escribir «como psicóloga siempre digo que…» cuando eso no ha pasado.

---

## 4. Anatomía de un artículo

### Frontmatter

```yaml
---
layout: post.njk
title: "Vivir en alerta constante: qué es la hipervigilancia y cómo bajarla"
description: "Entre 145 y 160 caracteres, con la palabra clave principal."
date: 2026-09-30            # fecha futura = no se publica hasta ese día
updated: 2026-10-15         # opcional, solo si se revisa de verdad
featured_image: "./src/images/blog/nombre-descriptivo.jpg"
image_alt: "Lo que se ve en la foto, escrito mirándola."
tags:
  - post
faq:
  - pregunta: "..."
    respuesta: "..."
  # exactamente cinco
---
```

Sobre algunos campos:

- **`date` en el futuro no publica el artículo.** `blog.11tydata.js` le pone
  `permalink: false`, así que ni se genera el HTML ni sale en el sitemap ni en
  el índice. Publicar es esperar a esa fecha y a que haya un despliegue.
- **`updated`** pinta un «Actualizado el…» y alimenta el `dateModified` del
  schema. Solo si el artículo se ha revisado de verdad, no por tocar una coma.
- **`image_alt`** se escribe mirando la foto y describiendo lo que hay. No es
  el título otra vez. Es lo que oye quien usa un lector de pantalla.
- **Las cinco preguntas frecuentes** alimentan a la vez el acordeón visible y
  el `FAQPage` del schema, así que no pueden separarse ni quedarse en cuatro.
  Van sin enlaces: en el schema no sirven y en el acordeón distraen.

### Cuerpo

| | Pilar | Satélite |
|---|---|---|
| Palabras | 1.500–1.800 | 1.100–1.400 |
| Encabezados `##` | 7–9 | 5–8 |
| Fuentes externas | 2 o más | 1 o más |
| Enlaces internos | 2–3 | 2–3 |

Los once publicados van de 1.029 a 1.644 palabras, con mediana 1.127. Si un
artículo se queda corto, la pregunta es qué le falta, no cómo se rellena.
Engordar un texto para llegar a una cifra siempre lo empeora.

**Un `##` por idea**, y que el encabezado diga algo: «Cuándo esto no es "que
yo soy así"» funciona; «Conclusión» no. **Negrita** para el giro de cada
párrafo, no para palabras sueltas al azar.

### Final

Cerrar con la vuelta al principio, no con un resumen. Y **el CTA lo pone la
plantilla**, no el artículo: `post.njk` ya añade el bloque de la primera
sesión al final de cada pieza. No hace falta escribirlo a mano.

---

## 5. Fuentes

**Una como mínimo, y comprobada en el original.** No vale un resumen, ni otro
blog, ni lo que recuerdes que decía el estudio.

Lo que se usa aquí, por orden de preferencia:

- **Organismos oficiales**: OMS, OPS, Ministerio de Sanidad, NIMH.
- **Legislación**: enlace al BOE consolidado, nunca a una noticia sobre la ley.
- **Estudios revisados por pares**: PubMed, citando año y tipo de estudio.
- **Colegios profesionales**: COP, Colegio de Madrid, para deontología.

**Cómo se cita.** El enlace va colgado de la afirmación, con lo que aporta el
estudio y lo que no:

> Una [revisión sistemática publicada en 2024](…) recogió dieciséis estudios
> con 1.231 participantes y encontró resultados prometedores. Sus propios
> autores señalan las limitaciones del conjunto: muestras pequeñas, pocos
> grupos de control…

**Las cifras caducan.** La OMS actualiza sus fichas. Una cifra vieja con una
cita a la OMS es peor que ninguna cifra, porque parece verificada. Al revisar
un artículo, se vuelven a comprobar.

---

## 6. Enlaces internos

**En las dos direcciones.** El artículo nuevo enlaza a los antiguos —eso se
hace solo al escribir— y hay que volver a los antiguos para que enlacen al
nuevo. Esto último es lo que se abandona primero y es lo que más cuesta
después: en septiembre de 2026 cuatro artículos no recibían ni un enlace, y
tres de ellos eran justo los que Google no acababa de indexar. No es
casualidad: los enlaces internos son por donde Google descubre y reparte
autoridad.

**Colgados de frases que ya están en el texto.** Nunca un bloque de «artículos
relacionados» al final: eso lo ignoran los lectores y vale menos para Google.

```markdown
Es la misma razón por la que [decirte «cálmate» no sirve de nada](/blog/slug/).
```

**Siempre con barra final**, `/blog/slug/`. Sin ella hay un 301 de más.

**Nunca a un artículo con fecha futura.** Sería un 404 hasta que se publique.
El build avisa si pasa: `[enlaces] N enlace(s) interno(s) a páginas que no
existen`. Si el enlace tiene sentido, se anota y se añade el día que salga.

**El CTA de reserva va a `/#booking-calendar`**, no a `/#services-pricing`.
Dos motivos: lleva a donde de verdad se reserva, y es el único ancla que
dispara el evento `cta_reservar`. Ocho artículos apuntaban al sitio
equivocado y sus clics no se estaban midiendo.

---

## 7. La portada

La portada enlaza tres artículos, entre las preguntas frecuentes y el
calendario. Se eligen a mano en `src/index.html`, no por fecha: son los que
responden dudas **previas a reservar** —cuánto cuesta, cómo es la primera
sesión, qué profesional necesito—, con su pregunta encima de cada tarjeta.

Un bucle por fecha pondría ahí el artículo sobre hablar con alguien que
piensa en el suicidio, que habla a quien se preocupa por otra persona y no a
quien está decidiendo empezar terapia.

---

## 8. Convenciones de escritura

No son estilo opinable: son decisiones tomadas que se aplican sin volver a
discutirlas.

### Comillas: angulares « », siempre

La RAE lo dice así: *«en los impresos se recomienda usar primero las
angulares, reservando las inglesas y las simples, en este orden, para
entrecomillar partes de un texto ya entrecomillado»*
([RAE, Español al día](https://www.rae.es/espanol-al-dia/cuando-se-usa-cada-tipo-de-comillas)).

1. **« »** para todo: pensamientos, citas, términos usados con distancia.
2. **" "** (inglesas, curvas) solo dentro de algo ya entrecomillado.
3. **' '** (simples) solo en un tercer nivel, que casi nunca aparece.

La comilla recta `"` no se usa nunca en texto. No es española ni inglesa: es
un apaño de la máquina de escribir.

Se unificó el 23 de septiembre de 2026 convirtiendo 150 comillas rectas en
ocho artículos. **No aplica** a atributos HTML, frontmatter YAML ni código,
donde son sintaxis y no puntuación.

### Otras

- **Rayas** `—` para incisos, no guiones sueltos.
- **Números**: cifras para datos (`359 millones`, `4,4 %`), letra para
  cantidades pequeñas en prosa (`cuatro técnicas`).
- **Espacio antes del `%`** y coma decimal: `4,4 %`.
- **Precios**: `35€` tal cual, que es como aparece en la web.

---

## 9. Portadas

Criterio, por orden:

1. **Foto real.** Ni renders 3D ni ilustraciones generadas. La ficha de
   Unsplash no avisa de cuándo una imagen es un render: hay que mirarla. Una
   ya se coló hasta el último momento.
2. **Licencia comprobada** en la propia ficha, y anotada en
   `src/images/blog/CREDITOS.md`: archivo, autor, origen, licencia,
   modificaciones y fecha. Verificar que **no** es Unsplash+, que es de pago.
3. **Escena cálida y cotidiana.** Nada de personas visiblemente angustiadas,
   escenas oscuras o dramáticas, ni la estética de «sesión de terapia» con
   cuaderno y sofá.
4. **Recortada a 16:10**, como el resto.
5. **Que no repita** el motivo de la portada anterior: en el índice del blog
   se ven una al lado de la otra.

---

## 10. Antes de dar un artículo por terminado

- [ ] Las cinco preguntas frecuentes están y no son cuatro
- [ ] `description` entre 145 y 160 caracteres, con la palabra clave
- [ ] Al menos una fuente, abierta y leída en el original
- [ ] Las cifras citadas coinciden hoy con la fuente
- [ ] Dos o tres enlaces internos, colgados de frases del texto, con barra final
- [ ] Ningún enlace a un artículo que aún no se publica
- [ ] Portada con licencia comprobada y anotada, y `image_alt` escrito mirándola
- [ ] Comillas angulares en todo el texto
- [ ] `npm run build` sin avisos de `[enlaces]`
- [ ] Los artículos antiguos que deberían enlazar a este, actualizados

---

## 11. Al publicar

1. Llega la fecha y un despliegue lo genera. El bot de horarios empuja cada 6
   horas, así que el retraso es de horas, no de días. Si corre prisa, se lanza
   un despliegue a mano desde Netlify.
2. **Pedir la indexación a mano** en Search Console, el mismo día. Está
   comprobado que funciona: el descubrimiento automático tarda entre dos y
   tres semanas, y pidiéndolo han bajado a 24 horas.
3. Añadir los enlaces entrantes que quedaron esperando.
