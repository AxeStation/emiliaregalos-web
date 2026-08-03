/**
 * El puente entre el carrito (cliente) y la cotización (servidor).
 *
 * C1: al pagar/enviar, el carrito se persiste creando una cotización vía
 * POST /api/internal/shop/emilia/quotes del dashboard (repo
 * synxia-dashboard). Este archivo arma ese payload — puro, sin fetch, para
 * poder testearlo con el runner del repo. El fetch real vive en
 * src/app/api/checkout/route.ts (server-only: ahí es donde entra el shared
 * secret, nunca acá ni en el cliente).
 *
 * Forma de `items` y nombres de campo tomados de la tabla real
 * (`emilia_quotes.items jsonb`, comentario de columna en
 * synxia-dashboard/supabase/migrations/001_emilia_inventory_orders_quotes.sql):
 *   [{product_id, name, variant_name?, quantity, unit_price}]
 * — NO `product_name` (así seguía el borrador de la tarea; se corrigió acá
 * a `name` para calzar con lo que la columna espera. Anotado en el PR.)
 */

import { type CartItem, cartSubtotal } from './cart.ts'
import { type TarjetaData, buildTarjetaLines } from './tarjeta.ts'

export type BuyerInfo = {
  name: string
  phone: string
  email: string
}

export type CheckoutDraft = {
  items: CartItem[]
  card: TarjetaData
  buyer: BuyerInfo
  recipientName: string
}

export type QuoteItemPayload = {
  product_id: string
  name: string
  variant_name: string | null
  quantity: number
  unit_price: number
}

export type QuotePayload = {
  customer_name: string
  customer_phone?: string
  customer_email?: string
  items: QuoteItemPayload[]
  subtotal: number
  total: number
  notes: string
  source: string
  created_by: string
}

export type BuildQuoteResult =
  | { ok: true; payload: QuotePayload }
  | { ok: false; error: string }

/**
 * Arma las notas de la cotización: la tarjeta completa (para/mensaje/de) +
 * el nombre del destinatario + el recordatorio de que el envío y la
 * dirección quedan pendientes (C4 — nunca se inventa un costo de envío;
 * C3 — la dirección exacta se pide DESPUÉS de acordar el pago, así que acá
 * sólo queda anotado que falta, nunca un domicilio a medias).
 */
function buildNotes(draft: CheckoutDraft): string {
  var tarjetaLines = buildTarjetaLines(draft.card)
  var parts: string[] = []
  parts.push('— Tarjeta —')
  if (draft.recipientName.trim()) parts.push('Destinatario: ' + draft.recipientName.trim())
  parts.push(...tarjetaLines)
  parts.push('')
  parts.push('Envío: por cotizar. Dirección pendiente — se pide después de acordar el pago.')
  parts.push('Origen: emiliaregalos.mx (carrito web).')
  return parts.join('\n')
}

export function buildQuotePayload(draft: CheckoutDraft): BuildQuoteResult {
  if (!draft.items || draft.items.length === 0) {
    return { ok: false, error: 'El carrito está vacío.' }
  }
  var buyerName = (draft.buyer.name || '').trim()
  if (!buyerName) {
    return { ok: false, error: 'Falta el nombre de quien compra.' }
  }
  if (!draft.recipientName || !draft.recipientName.trim()) {
    return { ok: false, error: 'Falta el nombre de quien recibe.' }
  }
  if (!draft.card.message || !draft.card.message.trim()) {
    return { ok: false, error: 'Falta el mensaje de la tarjeta.' }
  }

  var subtotal = cartSubtotal(draft.items)
  var items: QuoteItemPayload[] = draft.items.map(function (i) {
    return {
      product_id: i.product_id,
      name: i.name,
      variant_name: i.variant_name || null,
      quantity: i.quantity,
      unit_price: i.unit_price,
    }
  })

  var payload: QuotePayload = {
    customer_name: buyerName,
    items: items,
    subtotal: subtotal,
    // Sin envío conocido: total == subtotal. Nunca se suma un shipping_cost
    // inventado (C4).
    total: subtotal,
    notes: buildNotes(draft),
    source: 'web',
    created_by: 'web',
  }
  if (draft.buyer.phone && draft.buyer.phone.trim()) payload.customer_phone = draft.buyer.phone.trim()
  if (draft.buyer.email && draft.buyer.email.trim()) payload.customer_email = draft.buyer.email.trim()

  return { ok: true, payload: payload }
}
