/**
 * buildQuotePayload — el puente entre el carrito (cliente) y la cotización
 * real que se crea en synxia-dashboard. Ver src/lib/quote.ts.
 *
 * Correr:  node --experimental-strip-types --test test/quote-payload.test.ts
 */

import test from 'node:test'
import assert from 'node:assert/strict'
import { buildQuotePayload, type CheckoutDraft } from '../src/lib/quote.ts'
import { type CartItem } from '../src/lib/cart.ts'

function draft(over: Partial<CheckoutDraft> = {}): CheckoutDraft {
  var items: CartItem[] = [
    { product_id: 'p1', name: 'Caja Padrinos', variant_name: null, unit_price: 560, quantity: 2, image: null },
  ]
  return {
    items: items,
    card: { message: 'Feliz cumpleaños, te quiero mucho', to: '', from: 'María' },
    buyer: { name: 'María López', phone: '2221234567', email: '' },
    recipientName: 'Juan Pérez',
    ...over,
  }
}

// ═══════════════════════════════════════════════════════════════════════
// ANCLA — con datos completos y un precio conocido, sale un payload real
// ═══════════════════════════════════════════════════════════════════════

test('ANCLA · payload completo trae subtotal/total == precio × cantidad', () => {
  var r = buildQuotePayload(draft())
  assert.equal(r.ok, true, 'con datos completos esto NO puede fallar')
  if (!r.ok) return
  assert.equal(r.payload.subtotal, 1120, 'si esto no es 1120, el resto del test no prueba nada')
  assert.equal(r.payload.total, 1120)
  assert.equal(r.payload.customer_name, 'María López')
  assert.equal(r.payload.source, 'web')
  assert.equal(r.payload.created_by, 'web')
})

test('los items del payload usan la forma real de la columna (name, no product_name)', () => {
  var r = buildQuotePayload(draft())
  assert.equal(r.ok, true)
  if (!r.ok) return
  assert.deepEqual(r.payload.items[0], {
    product_id: 'p1',
    name: 'Caja Padrinos',
    variant_name: null,
    quantity: 2,
    unit_price: 560,
  })
})

test('el teléfono y el correo del comprador sólo se mandan si vienen', () => {
  var r1 = buildQuotePayload(draft({ buyer: { name: 'María', phone: '', email: '' } }))
  assert.equal(r1.ok, true)
  if (r1.ok) assert.equal('customer_phone' in r1.payload, false)

  var r2 = buildQuotePayload(draft({ buyer: { name: 'María', phone: '2221234567', email: 'a@b.com' } }))
  assert.equal(r2.ok, true)
  if (r2.ok) {
    assert.equal(r2.payload.customer_phone, '2221234567')
    assert.equal(r2.payload.customer_email, 'a@b.com')
  }
})

// ═══════════════════════════════════════════════════════════════════════
// Validación — sin comprador, sin destinatario o sin mensaje, no se manda
// ═══════════════════════════════════════════════════════════════════════

test('carrito vacío no genera payload', () => {
  var r = buildQuotePayload(draft({ items: [] }))
  assert.equal(r.ok, false)
})

test('sin nombre de comprador no genera payload', () => {
  var r = buildQuotePayload(draft({ buyer: { name: '  ', phone: '', email: '' } }))
  assert.equal(r.ok, false)
})

test('sin nombre de destinatario no genera payload (C3: comprador y destinatario son datos distintos y ambos obligatorios)', () => {
  var r = buildQuotePayload(draft({ recipientName: '' }))
  assert.equal(r.ok, false)
})

test('sin mensaje de tarjeta no genera payload (C2: la tarjeta no es opcional)', () => {
  var r = buildQuotePayload(draft({ card: { message: '', to: '', from: '' } }))
  assert.equal(r.ok, false)
})

// ═══════════════════════════════════════════════════════════════════════
// C4 — nunca se inventa un costo de envío
// ═══════════════════════════════════════════════════════════════════════

test('el payload nunca agrega un shipping_cost: el envío no se calcula acá', () => {
  var r = buildQuotePayload(draft())
  assert.equal(r.ok, true)
  if (!r.ok) return
  assert.equal('shipping_cost' in r.payload, false, 'si esto existiera, sería un monto inventado')
})

test('las notas dejan constancia explícita de que el envío está por cotizar', () => {
  var r = buildQuotePayload(draft())
  assert.equal(r.ok, true)
  if (!r.ok) return
  assert.match(r.payload.notes, /por cotizar/i)
  assert.match(r.payload.notes, /Juan Pérez/, 'las notas deben nombrar al destinatario real, no un placeholder')
})
