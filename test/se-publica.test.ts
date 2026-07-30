/**
 * sePublica() — qué sale en emiliaregalos.mx.
 *
 * EL ACOPLE QUE ESTO ROMPE (30-jul-2026): hasta hoy la única forma de sacar un
 * producto del sitio era desactivarlo, y desactivarlo lo sacaba TAMBIÉN del
 * cotizador de Ana. Por eso CAJA BOTELLA, CAJA TERMO y TABLA TEQUILEROS 2
 * siguieron publicados semanas: quitarlos del sitio costaba dejar de cotizarlos.
 *
 *     is_active     ¿existe para el negocio? Lo cotiza el bot.
 *     is_published  ¿sale en el sitio?
 *
 * ANCLA DE CONTROL, y es la que decide si el cambio sirve: un producto con
 * `is_published:false` desaparece del sitio Y SIGUE con `is_active:true`. Si
 * este archivo llegara a tocar is_active, rompió justo lo que vino a arreglar.
 *
 * Correr:  node --experimental-strip-types --test test/se-publica.test.ts
 */

import test from 'node:test'
import assert from 'node:assert/strict'
import { sePublica, type Product } from '../src/lib/types.ts'

function producto(over: Partial<Product> = {}): Product {
  return {
    id: 'p1', name: 'CAJA BOTELLA', category: 'Para Él', base_price: 890,
    variants: null, images: ['https://x/y.jpg'], is_active: true,
    description: null,
    ...over,
  } as Product
}

// ═══════════════════════════════════════════════════════════════════════════
// ANCLA DE CONTROL — el estado de hoy no puede cambiar
// ═══════════════════════════════════════════════════════════════════════════

test('ANCLA · sin la columna todavía (undefined) el producto se publica igual que hoy', () => {
  assert.equal(sePublica(producto()), true,
    'mientras la migración no esté aplicada, is_published llega undefined y NO puede ocultar nada')
})

test('ANCLA · con is_published en true, todo sigue exactamente igual', () => {
  assert.equal(sePublica(producto({ is_published: true })), true)
})

test('ANCLA · un producto inactivo sigue sin publicarse, como siempre', () => {
  assert.equal(sePublica(producto({ is_active: false })), false)
  assert.equal(sePublica(producto({ is_active: false, is_published: true })), false,
    'publicado no puede resucitar a un producto que el negocio dio de baja')
})

// ═══════════════════════════════════════════════════════════════════════════
// LO NUEVO — quitar del sitio sin dejar de cotizar
// ═══════════════════════════════════════════════════════════════════════════

test('is_published:false saca el producto del sitio', () => {
  assert.equal(sePublica(producto({ is_published: false })), false)
})

test('EL PUNTO DE TODO: fuera del sitio pero SIGUE cotizable por Ana', () => {
  const p = producto({ is_published: false })
  assert.equal(sePublica(p), false, 'no sale en emiliaregalos.mx')
  assert.equal(p.is_active, true,
    'y sigue activo: si esto fuera false, volvimos al acople que vinimos a romper')
})

test('los tres que esperaban: se ocultan sin perder la cotización', () => {
  const tres = ['CAJA BOTELLA', 'CAJA TERMO', 'TABLA TEQUILEROS 2']
  for (const name of tres) {
    const p = producto({ name, is_published: false })
    assert.equal(sePublica(p), false, name + ' debe salir del sitio')
    assert.equal(p.is_active, true, name + ' tiene que seguir cotizable')
  }
})

// ═══════════════════════════════════════════════════════════════════════════
// LO QUE NO SE RE-AGREGA
// ═══════════════════════════════════════════════════════════════════════════

test('la condición de la foto NO volvió: un producto sin fotos se publica', () => {
  // El 28-jul Julu decidió publicar los 8 sin foto con el marcador de marca.
  // Si alguien re-agrega `tieneFoto` a sePublica, esos 8 desaparecen otra vez.
  assert.equal(sePublica(producto({ images: [] })), true)
  assert.equal(sePublica(producto({ images: null })), true)
})
