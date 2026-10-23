/**
 * Mensajes de WhatsApp centralizados — ver src/lib/whatsapp.ts.
 *
 * ANCLA primero: cada contexto produce un enlace con ?text= real y
 * encodeURIComponent aplicado (nada de espacios crudos ni %20 a mano).
 * Después, guardas de estructura: los componentes que antes tenían enlaces
 * vacíos/genéricos ahora importan enlaceWhatsApp() en vez de hardcodear
 * 'https://wa.me/...' de nuevo — y la ficha de producto, que el encargo pidió
 * dejar intacta, sigue usando waProductUrl() tal cual.
 *
 * Correr:  node --experimental-strip-types --test test/whatsapp.test.ts
 */

import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { enlaceWhatsApp } from '../src/lib/whatsapp.ts'
import { WA_NUMBER } from '../src/lib/types.ts'

function readSource(relPath: string): string {
  var url = new URL('../' + relPath, import.meta.url)
  return readFileSync(fileURLToPath(url), 'utf8')
}

// ═══════════════════════════════════════════════════════════════════════
// ANCLA
// ═══════════════════════════════════════════════════════════════════════

test('ANCLA · enlaceWhatsApp() arma un wa.me/<numero>?text=<mensaje codificado>', () => {
  var url = enlaceWhatsApp('footer')
  assert.equal(url, 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent('Hola, me gustaría cotizar un regalo'))
})

test('el texto va encodeURIComponent, no %20 a mano ni espacios crudos', () => {
  var url = enlaceWhatsApp('header')
  assert.ok(!/ /.test(url), 'un espacio crudo en la URL es un enlace roto')
  assert.ok(url.includes('%2C') || url.includes('vi%20su'), 'el texto debe venir codificado')
})

test('cada contexto produce un texto distinto (no todos el mismo mensaje genérico)', () => {
  var header = enlaceWhatsApp('header')
  var footer = enlaceWhatsApp('footer')
  var catalogo = enlaceWhatsApp('flotanteCatalogo')
  var hero = enlaceWhatsApp('flotanteInicio')
  var set = new Set([header, footer, catalogo, hero])
  assert.equal(set.size, 4, 'los 4 contextos deben decodificar a mensajes distintos')
})

// Textos que el encargo pidió mantener SIN CAMBIO (ya existían antes del PR).
// Si uno de estos falla, alguien tocó copy que no se pidió tocar.
test('ANCLA · los textos que YA EXISTÍAN se preservan literal', () => {
  assert.equal(decodeURIComponent(enlaceWhatsApp('inicioPersonaliza').split('?text=')[1]), 'Hola! Me interesa personalizar un regalo.')
  assert.equal(decodeURIComponent(enlaceWhatsApp('inicioEmpresarial').split('?text=')[1]), 'Hola! Me interesa una cotización de regalos corporativos.')
  assert.equal(decodeURIComponent(enlaceWhatsApp('contacto').split('?text=')[1]), 'Hola! Me interesa cotizar un regalo personalizado.')
})

// ═══════════════════════════════════════════════════════════════════════
// Capa 2 — los componentes antes-vacíos ahora importan enlaceWhatsApp()
// ═══════════════════════════════════════════════════════════════════════

var USAN_ENLACE_WHATSAPP = [
  'src/components/Navbar.tsx',
  'src/components/Footer.tsx',
  'src/components/WhatsAppButton.tsx',
]

for (var archivo of USAN_ENLACE_WHATSAPP) {
  test(archivo + ' importa enlaceWhatsApp de @/lib/whatsapp (no hardcodea el link vacío)', () => {
    var src = readSource(archivo)
    assert.match(src, /import\s*\{[^}]*enlaceWhatsApp[^}]*\}\s*from\s*['"]@\/lib\/whatsapp['"]/)
    assert.ok(!/href=["']https:\/\/wa\.me\/522225011994["']/.test(src), archivo + ' no debe quedar un wa.me suelto sin ?text=')
  })
}

// ═══════════════════════════════════════════════════════════════════════
// La ficha de producto NO se toca — mutación de control probaría esto si
// alguien centralizara el mensaje dinámico sin querer y rompiera el nombre
// del producto en el texto.
// ═══════════════════════════════════════════════════════════════════════

test('ANCLA DE NO-REGRESIÓN · la ficha de producto sigue usando waProductUrl(), no enlaceWhatsApp()', () => {
  var src = readSource('src/app/catalogo/[slug]/page.tsx')
  assert.match(src, /waProductUrl\(product\)/, 'el encargo pidió MANTENER este comportamiento tal cual')
  assert.ok(!/enlaceWhatsApp/.test(src), 'la ficha de producto está fuera de alcance de la centralización — no debe importar enlaceWhatsApp')
})
