'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { type CartItem, addOrIncrementItem, removeItem, updateQuantity, cartSubtotal, cartCount } from '@/lib/cart'
import { type TarjetaData } from '@/lib/tarjeta'
import { type Draft, EMPTY_DRAFT, loadDraft, saveDraft, clearDraft } from '@/lib/draftStorage'

type CartContextValue = {
  draft: Draft
  ready: boolean
  addItem: (item: CartItem) => void
  removeLine: (product_id: string, variant_name: string | null) => void
  setQuantity: (product_id: string, variant_name: string | null, quantity: number) => void
  setCard: (card: Partial<TarjetaData>) => void
  setBuyer: (fields: Partial<Pick<Draft, 'buyerName' | 'buyerPhone' | 'buyerEmail'>>) => void
  setRecipientName: (name: string) => void
  clear: () => void
  subtotal: number
  count: number
}

var CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  // Arranca en EMPTY_DRAFT (igual en servidor y en el primer render del
  // cliente) y recién después de montar lee localStorage. Es el patrón
  // estándar para no pelearse con la hidratación de Next: si el server
  // renderizara "3 productos" y el cliente trajera "0" del localStorage
  // (o viceversa), React tira mismatch warning.
  var [draft, setDraft] = useState<Draft>(EMPTY_DRAFT)
  var [ready, setReady] = useState(false)

  useEffect(function () {
    setDraft(loadDraft())
    setReady(true)
  }, [])

  useEffect(function () {
    if (ready) saveDraft(draft)
  }, [draft, ready])

  function addItem(item: CartItem) {
    setDraft(function (d) { return Object.assign({}, d, { items: addOrIncrementItem(d.items, item) }) })
  }

  function removeLine(product_id: string, variant_name: string | null) {
    setDraft(function (d) { return Object.assign({}, d, { items: removeItem(d.items, product_id, variant_name) }) })
  }

  function setQuantity(product_id: string, variant_name: string | null, quantity: number) {
    setDraft(function (d) { return Object.assign({}, d, { items: updateQuantity(d.items, product_id, variant_name, quantity) }) })
  }

  function setCard(card: Partial<TarjetaData>) {
    setDraft(function (d) { return Object.assign({}, d, { card: Object.assign({}, d.card, card) }) })
  }

  function setBuyer(fields: Partial<Pick<Draft, 'buyerName' | 'buyerPhone' | 'buyerEmail'>>) {
    setDraft(function (d) { return Object.assign({}, d, fields) })
  }

  function setRecipientName(name: string) {
    setDraft(function (d) { return Object.assign({}, d, { recipientName: name }) })
  }

  function clear() {
    clearDraft()
    setDraft(EMPTY_DRAFT)
  }

  var value: CartContextValue = {
    draft: draft,
    ready: ready,
    addItem: addItem,
    removeLine: removeLine,
    setQuantity: setQuantity,
    setCard: setCard,
    setBuyer: setBuyer,
    setRecipientName: setRecipientName,
    clear: clear,
    subtotal: cartSubtotal(draft.items),
    count: cartCount(draft.items),
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  var ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart() debe usarse dentro de <CartProvider>')
  return ctx
}
