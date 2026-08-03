/**
 * Dónde vive el carrito ANTES de convertirse en cotización: localStorage del
 * navegador, nada más (C1). Nada de esto toca `window` fuera de las
 * funciones — así que importar este archivo no rompe el render en servidor
 * (Next ejecuta páginas/componentes en el servidor primero).
 */

import { type CartItem } from './cart.ts'
import { type TarjetaData } from './tarjeta.ts'

export type Draft = {
  items: CartItem[]
  card: TarjetaData
  buyerName: string
  buyerPhone: string
  buyerEmail: string
  recipientName: string
}

export var EMPTY_DRAFT: Draft = {
  items: [],
  card: { message: '', to: '', from: '' },
  buyerName: '',
  buyerPhone: '',
  buyerEmail: '',
  recipientName: '',
}

var STORAGE_KEY = 'emilia_quote_draft_v1'

export function loadDraft(): Draft {
  if (typeof window === 'undefined') return EMPTY_DRAFT
  try {
    var raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY_DRAFT
    var parsed = JSON.parse(raw)
    // Merge sobre EMPTY_DRAFT: un draft viejo guardado antes de agregar un
    // campo nuevo no debe tronar el resto de la app con `undefined`.
    return Object.assign({}, EMPTY_DRAFT, parsed, {
      card: Object.assign({}, EMPTY_DRAFT.card, parsed.card),
    })
  } catch {
    return EMPTY_DRAFT
  }
}

export function saveDraft(draft: Draft): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
  } catch {
    // Storage lleno o bloqueado (modo privado) — el carrito sigue
    // funcionando en memoria durante la sesión, sólo no sobrevive un
    // refresh. No es motivo para tronar la compra.
  }
}

export function clearDraft(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ver saveDraft()
  }
}
