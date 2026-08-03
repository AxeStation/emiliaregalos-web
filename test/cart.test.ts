/**
 * El carrito es un array de líneas — sin objeto mágico, sin clase, sin
 * estado oculto. Estas son las funciones puras que la UI llama; se testean
 * solas, sin React ni localStorage.
 *
 * Correr:  node --experimental-strip-types --test test/cart.test.ts
 */

import test from 'node:test'
import assert from 'node:assert/strict'
import {
  type CartItem,
  addOrIncrementItem,
  removeItem,
  updateQuantity,
  cartSubtotal,
  cartCount,
  SHIPPING_LABEL,
} from '../src/lib/cart.ts'

function item(over: Partial<CartItem> = {}): CartItem {
  return {
    product_id: 'p1', name: 'Caja Padrinos', variant_name: null,
    unit_price: 560, quantity: 1, image: null,
    ...over,
  }
}

// ═══════════════════════════════════════════════════════════════════════
// ANCLA — precios conocidos producen un subtotal conocido
// ═══════════════════════════════════════════════════════════════════════

test('ANCLA · dos líneas con precio conocido suman el subtotal exacto', () => {
  var items = [item({ unit_price: 560, quantity: 2 }), item({ product_id: 'p2', unit_price: 890, quantity: 1 })]
  assert.equal(cartSubtotal(items), 560 * 2 + 890, 'si esto da 0, nada de lo demás mide algo')
  assert.equal(cartCount(items), 3)
})

// ═══════════════════════════════════════════════════════════════════════
// addOrIncrementItem
// ═══════════════════════════════════════════════════════════════════════

test('agregar un producto nuevo crea una línea', () => {
  var items = addOrIncrementItem([], item())
  assert.equal(items.length, 1)
  assert.equal(items[0].quantity, 1)
})

test('agregar el mismo producto+variante otra vez suma cantidad, no duplica línea', () => {
  var items = addOrIncrementItem([item({ quantity: 1 })], item({ quantity: 2 }))
  assert.equal(items.length, 1)
  assert.equal(items[0].quantity, 3)
})

test('mismo producto con variante DISTINTA es una línea aparte', () => {
  var items = addOrIncrementItem(
    [item({ variant_name: 'Chico' })],
    item({ variant_name: 'Grande' }),
  )
  assert.equal(items.length, 2)
})

// ═══════════════════════════════════════════════════════════════════════
// removeItem / updateQuantity
// ═══════════════════════════════════════════════════════════════════════

test('quitar una línea la elimina del array', () => {
  var items = removeItem([item({ product_id: 'p1' }), item({ product_id: 'p2' })], 'p1', null)
  assert.equal(items.length, 1)
  assert.equal(items[0].product_id, 'p2')
})

test('bajar la cantidad a 0 o menos quita la línea (no deja un "0" fantasma)', () => {
  var items = updateQuantity([item({ quantity: 1 })], 'p1', null, 0)
  assert.equal(items.length, 0, 'un 0 visible en el carrito es el mismo hueco que C4 prohíbe para envío')
})

test('updateQuantity con un número positivo sólo cambia esa línea', () => {
  var items = updateQuantity([item({ product_id: 'p1', quantity: 1 }), item({ product_id: 'p2', quantity: 1 })], 'p1', null, 5)
  assert.equal(items.find(function (i) { return i.product_id === 'p1' })!.quantity, 5)
  assert.equal(items.find(function (i) { return i.product_id === 'p2' })!.quantity, 1)
})

// ═══════════════════════════════════════════════════════════════════════
// C4 — el envío nunca es un monto inventado
// ═══════════════════════════════════════════════════════════════════════

test('SHIPPING_LABEL es texto, nunca un monto ni un string vacío', () => {
  assert.equal(typeof SHIPPING_LABEL, 'string')
  assert.ok(SHIPPING_LABEL.trim().length > 0)
  assert.ok(!/\$/.test(SHIPPING_LABEL), 'el texto de envío no puede contener un signo de peso')
  assert.ok(!/\b0\b/.test(SHIPPING_LABEL), 'ni sugerir "$0" con un cero suelto')
})
