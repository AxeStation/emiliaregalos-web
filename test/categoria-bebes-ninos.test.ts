/**
 * Categoría "Bebés" → "Bebés & Niños" sin que ningún producto desaparezca.
 *
 * El nombre vivía fijo en 4 lugares del sitio (page.tsx CAT_IMGS y CATS,
 * types.ts CATEGORIES, Footer.tsx) y en emilia_products.category. Renombrar
 * la base antes que el sitio sacaba 6 productos de la navegación; renombrar
 * el sitio antes que la base, lo mismo al revés.
 *
 * El desacople ya existe en este repo: CATEGORIA_RENOMBRADA + normalizaCategoria()
 * traducen el nombre viejo de la base al nuevo al leer. Con 'Bebés' en ese mapa,
 * los dos nombres funcionan hasta que corra el UPDATE — el orden deja de importar.
 *
 * Correr:  node --experimental-strip-types --test test/categoria-bebes-ninos.test.ts
 */

import test from 'node:test'
import assert from 'node:assert/strict'
import { CATEGORIES, normalizaCategoria, type Product } from '../src/lib/types.ts'

function producto(category: string): Product {
  return {
    id: 'p1', name: 'Caja Bebé', category, base_price: 940,
    variants: [], customization_options: [], images: [],
    is_personalizable: true, is_active: true, sort_order: 0,
  } as unknown as Product
}

test('ANCLA: una categoría que no se renombra sale intacta', () => {
  assert.equal(normalizaCategoria(producto('Para Ella')).category, 'Para Ella')
})

test('la lista de categorías del sitio dice "Bebés & Niños" y ya no "Bebés"', () => {
  var cats = CATEGORIES as readonly string[]
  assert.ok(cats.includes('Bebés & Niños'), 'falta la categoría nueva en CATEGORIES')
  assert.ok(!cats.includes('Bebés'), 'sigue el nombre viejo en CATEGORIES')
})

test('un producto que en la base todavía dice "Bebés" cae en "Bebés & Niños" (no desaparece)', () => {
  assert.equal(normalizaCategoria(producto('Bebés')).category, 'Bebés & Niños')
})

import { normalizaNombreCategoria } from '../src/lib/types.ts'

test('un enlace viejo ?cat=Bebés cae en la categoría nueva (y uno vigente no cambia)', () => {
  assert.equal(normalizaNombreCategoria('Bebés'), 'Bebés & Niños')
  assert.equal(normalizaNombreCategoria('Para Ella'), 'Para Ella', 'ANCLA: lo que no se renombra pasa intacto')
  assert.equal(normalizaNombreCategoria(null), null)
})
