/**
 * El carrito NO es un objeto nuevo: es el borrador de una cotización.
 * Ver src/lib/quote.ts (arma el payload que se manda al dashboard) y
 * src/context/CartContext.tsx (dónde vive mientras el cliente compra).
 *
 * Este archivo es deliberadamente libre de React y de `window`/localStorage:
 * son funciones puras sobre arrays, así que se corren con el runner del
 * repo (`node --experimental-strip-types --test`) sin montar nada.
 */

export type CartItem = {
  product_id: string
  name: string
  variant_name: string | null
  unit_price: number
  quantity: number
  image: string | null
}

function sameLine(a: CartItem, b: { product_id: string; variant_name: string | null }): boolean {
  return a.product_id === b.product_id && (a.variant_name || '') === (b.variant_name || '')
}

export function addOrIncrementItem(items: CartItem[], item: CartItem): CartItem[] {
  var idx = items.findIndex(function (i) { return sameLine(i, item) })
  if (idx >= 0) {
    var next = items.slice()
    next[idx] = Object.assign({}, next[idx], { quantity: next[idx].quantity + item.quantity })
    return next
  }
  return items.concat([item])
}

export function removeItem(items: CartItem[], product_id: string, variant_name: string | null): CartItem[] {
  return items.filter(function (i) { return !sameLine(i, { product_id: product_id, variant_name: variant_name }) })
}

export function updateQuantity(
  items: CartItem[],
  product_id: string,
  variant_name: string | null,
  quantity: number,
): CartItem[] {
  // cantidad <= 0 quita la línea — no dejamos "0" visible en el carrito,
  // que es exactamente el hueco que C4 prohíbe (un dato faltante disfrazado
  // de cero en vez de ausente).
  if (quantity <= 0) return removeItem(items, product_id, variant_name)
  return items.map(function (i) {
    return sameLine(i, { product_id: product_id, variant_name: variant_name })
      ? Object.assign({}, i, { quantity: quantity })
      : i
  })
}

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce(function (sum, i) { return sum + i.unit_price * i.quantity }, 0)
}

export function cartCount(items: CartItem[]): number {
  return items.reduce(function (sum, i) { return sum + i.quantity }, 0)
}

/**
 * El envío no existe todavía (C4): no hay peso, dimensiones ni tarifa.
 * Esta es la ÚNICA cadena que cualquier pantalla puede mostrar para el
 * costo de envío — nunca un "$0" calculado ni un espacio en blanco.
 * `test/envio-por-cotizar.test.ts` vigila que los componentes del carrito
 * importen esta constante en vez de inventar el texto o un monto.
 */
export var SHIPPING_LABEL = 'Envío por cotizar'
