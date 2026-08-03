/**
 * draftStorage — dónde vive el carrito ANTES de convertirse en cotización
 * (C1). Server-safe por diseño (Next renderiza en servidor primero, donde
 * no hay `window`) y tolerante a localStorage roto/lleno (modo privado).
 *
 * Correr:  node --experimental-strip-types --test test/draft-storage.test.ts
 */

import test from 'node:test'
import assert from 'node:assert/strict'
import { EMPTY_DRAFT, loadDraft, saveDraft, clearDraft, type Draft } from '../src/lib/draftStorage.ts'

function fakeWindow() {
  var store = new Map<string, string>()
  return {
    localStorage: {
      getItem: function (k: string) { return store.has(k) ? store.get(k)! : null },
      setItem: function (k: string, v: string) { store.set(k, v) },
      removeItem: function (k: string) { store.delete(k) },
    },
  }
}

test('sin window (render de servidor) loadDraft devuelve EMPTY_DRAFT y no truena', () => {
  assert.equal(typeof (globalThis as any).window, 'undefined', 'este test asume que corre sin window — si no, no prueba el caso de servidor')
  var draft = loadDraft()
  assert.deepEqual(draft, EMPTY_DRAFT)
  assert.doesNotThrow(function () { saveDraft(EMPTY_DRAFT) })
  assert.doesNotThrow(function () { clearDraft() })
})

test('ANCLA · con window, guardar y volver a leer devuelve EXACTAMENTE lo guardado', () => {
  ;(globalThis as any).window = fakeWindow()
  try {
    var draft: Draft = {
      items: [{ product_id: 'p1', name: 'Caja Padrinos', variant_name: null, unit_price: 560, quantity: 2, image: null }],
      card: { message: 'Hola', to: '', from: 'María' },
      buyerName: 'María López', buyerPhone: '2221234567', buyerEmail: '',
      recipientName: 'Juan',
    }
    saveDraft(draft)
    var loaded = loadDraft()
    assert.equal(loaded.items.length, 1, 'si esto es 0, guardar/leer no está funcionando y el resto del test es ruido')
    assert.deepEqual(loaded, draft)
  } finally {
    delete (globalThis as any).window
  }
})

test('clearDraft borra lo guardado — vuelve a EMPTY_DRAFT', () => {
  ;(globalThis as any).window = fakeWindow()
  try {
    saveDraft({ ...EMPTY_DRAFT, buyerName: 'Alguien' })
    clearDraft()
    assert.deepEqual(loadDraft(), EMPTY_DRAFT)
  } finally {
    delete (globalThis as any).window
  }
})

test('un draft viejo sin campos nuevos no truena — se completa con EMPTY_DRAFT', () => {
  var w = fakeWindow()
  w.localStorage.setItem('emilia_quote_draft_v1', JSON.stringify({ items: [] }))
  ;(globalThis as any).window = w
  try {
    var loaded = loadDraft()
    assert.deepEqual(loaded.card, EMPTY_DRAFT.card)
    assert.equal(loaded.recipientName, '')
  } finally {
    delete (globalThis as any).window
  }
})
