/**
 * C4 — HUECOS VISIBLES, NUNCA RELLENADOS.
 *
 * "La regla ya se rompió 3 veces en este proyecto": envío cotizado en $0
 * en vez de declarado explícitamente como pendiente. Acá no hay peso,
 * dimensiones ni tiempo de entrega — así que ninguna pantalla puede
 * mostrar un monto de envío calculado. El guardia es doble, igual que en
 * C3: una prueba sobre el texto (capa 1) y una sobre el código fuente de
 * las pantallas que muestran envío (capa 2), para que ni el contenido ni
 * un futuro cambio de código puedan reintroducir un "$0" silencioso.
 *
 * Correr:  node --experimental-strip-types --test test/envio-por-cotizar.test.ts
 */

import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { SHIPPING_LABEL } from '../src/lib/cart.ts'

function readSource(relPath: string): string {
  var url = new URL('../' + relPath, import.meta.url)
  return readFileSync(fileURLToPath(url), 'utf8')
}

var SCREENS_WITH_SHIPPING = [
  'src/app/carrito/page.tsx',
  'src/app/carrito/revisar/page.tsx',
]

// ═══════════════════════════════════════════════════════════════════════
// ANCLA — el texto que se muestra existe y dice lo que tiene que decir
// ═══════════════════════════════════════════════════════════════════════

test('ANCLA · SHIPPING_LABEL es exactamente el texto que se espera mostrar', () => {
  assert.equal(SHIPPING_LABEL, 'Envío por cotizar', 'si esto cambió, hay que revisar las pantallas que lo citan')
})

// ═══════════════════════════════════════════════════════════════════════
// Capa 2 — cada pantalla que muestra envío usa la constante, no un monto
// ═══════════════════════════════════════════════════════════════════════

for (var screen of SCREENS_WITH_SHIPPING) {
  test(screen + ' importa SHIPPING_LABEL en vez de inventar el texto o calcular un monto', () => {
    var src = readSource(screen)
    assert.match(src, /SHIPPING_LABEL/, screen + ' debe usar la constante compartida')
    assert.match(src, /import\s*\{[^}]*SHIPPING_LABEL[^}]*\}\s*from\s*['"]@\/lib\/cart['"]/, screen + ' debe importarla de src/lib/cart.ts, no redeclararla')
  })

  test(screen + ' no calcula el envío con fmtPrice ni muestra un monto fijo', () => {
    var src = readSource(screen)
    assert.ok(!/fmtPrice\(\s*(0|shipping|envio)/i.test(src), screen + ' no debe formatear un shipping_cost como dinero')
    assert.ok(!/envío[^<]*\$\s?0/i.test(src), screen + ' no debe mostrar "$0" junto a la palabra envío')
  })
}
