/**
 * C3 — EL DESTINATARIO JAMÁS VE UN PRECIO.
 *
 * La tarjeta (y cualquier "vista para el destinatario") vive en
 * src/lib/tarjeta.ts + src/components/cart/TarjetaPreview.tsx. Esta suite
 * tiene DOS capas de guardia, a propósito redundantes:
 *
 *   1. Render-based: buildTarjetaLines() con datos reales no produce texto
 *      con $ ni dígitos-precio, salvo lo que el propio comprador haya
 *      escrito en su mensaje (eso es su texto, no un leak del sistema).
 *   2. Source-based: el archivo del componente que renderiza la tarjeta NO
 *      importa el formateador de dinero (`fmtPrice`) ni referencia ningún
 *      campo de precio/total/carrito en su tipo de props. Esto es lo que
 *      hace la garantía estructural, no sólo de comportamiento: un precio
 *      no puede colarse sin que ALGUIEN edite este archivo primero — y ese
 *      cambio es exactamente lo que este test bloquea.
 *
 * El runner del repo no ejecuta JSX (node --experimental-strip-types sólo
 * borra tipos, no transforma sintaxis), así que la capa 2 no puede ser
 * "renderizar el componente" — es leer su código fuente. Es una técnica
 * más floja que un render real, por eso la capa 1 la acompaña: entre las
 * dos, ni el contenido ni la firma del componente pueden esconder un
 * precio sin que un test se ponga rojo.
 *
 * Correr:  node --experimental-strip-types --test test/tarjeta-sin-precio.test.ts
 */

import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { buildTarjetaLines, type TarjetaData } from '../src/lib/tarjeta.ts'

var PRICE_PATTERN = /\$\s?\d/ // "$500", "$ 500" — cómo se ve un precio en este repo (ver fmtPrice en src/lib/types.ts)

function readSource(relPath: string): string {
  var url = new URL('../' + relPath, import.meta.url)
  return readFileSync(fileURLToPath(url), 'utf8')
}

// Los guardias de "capa 2" escanean CÓDIGO, no prosa. Los comentarios de
// este mismo repo EXPLICAN por qué no hay precio usando palabras como
// "precio" o "total" — sin quitarlos, el guardia se dispararía contra su
// propia documentación. Se despoja `//...` y `/*...*/` antes de matchear.
function stripComments(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '')
}

// ═══════════════════════════════════════════════════════════════════════
// ANCLA — con datos reales (destinatario + remitente + mensaje) la tarjeta
// SÍ dice algo. Si esto fallara, las aserciones "no hay precio" de abajo
// pasarían por accidente (nada que mostrar tampoco es "sin precio" válido).
// ═══════════════════════════════════════════════════════════════════════

test('ANCLA · con datos reales la tarjeta muestra destinatario, mensaje y remitente', () => {
  var data: TarjetaData = { to: 'Juan Pérez', message: 'Feliz cumpleaños', from: 'María' }
  var lines = buildTarjetaLines(data)
  assert.equal(lines.length, 3, 'si esto no es 3, la función se comió algún dato y el resto del test no prueba nada')
  assert.match(lines.join(' '), /Juan Pérez/)
  assert.match(lines.join(' '), /Feliz cumpleaños/)
  assert.match(lines.join(' '), /María/)
})

// ═══════════════════════════════════════════════════════════════════════
// Capa 1 — render-based
// ═══════════════════════════════════════════════════════════════════════

test('buildTarjetaLines() con un carrito de precio real NO recibe ni produce precio', () => {
  // A propósito: el "carrito" de esta prueba tiene un total de $4,050 —
  // simula el escenario real de una compra— pero TarjetaData no tiene
  // dónde meterlo. Si algún día alguien agrega `total` al tipo y lo
  // renderiza acá, este test lo detecta.
  var data: TarjetaData = { to: 'Juan Pérez', message: 'Con cariño para ti', from: 'María' }
  var lines = buildTarjetaLines(data)
  var rendered = lines.join('\n')
  assert.ok(!PRICE_PATTERN.test(rendered), 'la tarjeta no debe contener un patrón de precio: ' + rendered)
  assert.ok(!/\btotal\b/i.test(rendered))
  assert.ok(!/\bsubtotal\b/i.test(rendered))
})

test('un mensaje vacío no se disfraza de precio ni de otro dato inventado', () => {
  var lines = buildTarjetaLines({ to: '', message: '', from: '' })
  var rendered = lines.join('\n')
  assert.ok(!PRICE_PATTERN.test(rendered))
  assert.ok(rendered.trim().length > 0, 'estado vacío honesto (C5): un placeholder, no un hueco en blanco')
})

// ═══════════════════════════════════════════════════════════════════════
// Capa 2 — source-based, guardia estructural
// ═══════════════════════════════════════════════════════════════════════

var TARJETA_COMPONENT = 'src/components/cart/TarjetaPreview.tsx'
var TARJETA_LOGIC = 'src/lib/tarjeta.ts'

test('TarjetaPreview.tsx no importa el formateador de dinero', () => {
  var src = stripComments(readSource(TARJETA_COMPONENT))
  assert.ok(!/fmtPrice/.test(src), 'si esto aparece, hay un camino para mostrar dinero en la tarjeta')
  assert.ok(!/fmtMoney/.test(src))
})

test('TarjetaPreview.tsx no referencia ningún campo de precio/carrito en su código', () => {
  var src = stripComments(readSource(TARJETA_COMPONENT))
  var forbidden = /\b(price|total|subtotal|unit_price|monto|shipping)\b/i
  assert.ok(!forbidden.test(src), 'referencia prohibida encontrada en ' + TARJETA_COMPONENT)
})

test('la tarjeta SÍ renderiza el mensaje real (no es un componente vacío que pasa por descarte)', () => {
  var src = readSource(TARJETA_COMPONENT)
  assert.match(src, /buildTarjetaLines/, 'debe usar la lógica real de src/lib/tarjeta.ts, no texto fijo')
})

test('src/lib/tarjeta.ts — TarjetaData no tiene ningún campo de precio en su tipo', () => {
  var src = stripComments(readSource(TARJETA_LOGIC))
  var forbidden = /\b(price|total|subtotal|unit_price|monto)\b/i
  assert.ok(!forbidden.test(src), 'el tipo TarjetaData ganó un campo de dinero — eso es lo que este test existe para bloquear')
})
