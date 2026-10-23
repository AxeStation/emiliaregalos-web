/**
 * Conversiones de Ads — SOLO contactos reales (WhatsApp o tel:). NADA de
 * page_view. Ver src/lib/conversions.ts para el porqué.
 *
 * Correr:  node --experimental-strip-types --test test/conversions.test.ts
 */

import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { contactKindFromHref, conversionLabel } from '../src/lib/conversions.ts'

function readSource(relPath: string): string {
  var url = new URL('../' + relPath, import.meta.url)
  return readFileSync(fileURLToPath(url), 'utf8')
}

// ═══════════════════════════════════════════════════════════════════════
// ANCLA — los dos casos reales SÍ se detectan
// ═══════════════════════════════════════════════════════════════════════

test('ANCLA · un enlace de wa.me se detecta como whatsapp', () => {
  assert.equal(contactKindFromHref('https://wa.me/522225011994?text=hola'), 'whatsapp')
})

test('ANCLA · un enlace tel: se detecta como llamada', () => {
  assert.equal(contactKindFromHref('tel:+522225011994'), 'llamada')
})

// ═══════════════════════════════════════════════════════════════════════
// Formas adicionales de WhatsApp y de tel:
// ═══════════════════════════════════════════════════════════════════════

test('api.whatsapp.com también cuenta como whatsapp', () => {
  assert.equal(contactKindFromHref('https://api.whatsapp.com/send?phone=522225011994'), 'whatsapp')
})

// ═══════════════════════════════════════════════════════════════════════
// NADA de page_view ni "visitó la página" — todo lo que no es wa/tel es null
// ═══════════════════════════════════════════════════════════════════════

test('un enlace interno de navegación NO es conversión', () => {
  assert.equal(contactKindFromHref('/catalogo'), null)
})

test('mailto: NO es conversión (no lo pidió el encargo)', () => {
  assert.equal(contactKindFromHref('mailto:emilia.regalos.mx@gmail.com'), null)
})

test('un http(s) que no es wa.me/api.whatsapp.com NO es conversión', () => {
  assert.equal(contactKindFromHref('https://instagram.com/emilia__mx_'), null)
})

test('href null/undefined/vacío nunca es conversión', () => {
  assert.equal(contactKindFromHref(null), null)
  assert.equal(contactKindFromHref(undefined), null)
  assert.equal(contactKindFromHref(''), null)
})

test('un wa.me sin el esquema https:// completo NO matchea (evita falsos positivos de texto suelto)', () => {
  assert.equal(contactKindFromHref('wa.me/522225011994'), null)
})

// ═══════════════════════════════════════════════════════════════════════
// conversionLabel() — FAIL-CLOSED, igual que gadsId()
// ═══════════════════════════════════════════════════════════════════════

var ORIGINAL_WA = process.env.NEXT_PUBLIC_GADS_CONV_WHATSAPP
var ORIGINAL_LLAMADA = process.env.NEXT_PUBLIC_GADS_CONV_LLAMADA

test.after(() => {
  if (ORIGINAL_WA === undefined) delete process.env.NEXT_PUBLIC_GADS_CONV_WHATSAPP
  else process.env.NEXT_PUBLIC_GADS_CONV_WHATSAPP = ORIGINAL_WA
  if (ORIGINAL_LLAMADA === undefined) delete process.env.NEXT_PUBLIC_GADS_CONV_LLAMADA
  else process.env.NEXT_PUBLIC_GADS_CONV_LLAMADA = ORIGINAL_LLAMADA
})

test('ANCLA · con la variable puesta, conversionLabel() la devuelve', () => {
  process.env.NEXT_PUBLIC_GADS_CONV_WHATSAPP = 'AW-123456789/AbCdEfGhIj'
  assert.equal(conversionLabel('whatsapp'), 'AW-123456789/AbCdEfGhIj')
})

test('sin NEXT_PUBLIC_GADS_CONV_WHATSAPP, conversionLabel(\'whatsapp\') es undefined', () => {
  delete process.env.NEXT_PUBLIC_GADS_CONV_WHATSAPP
  assert.equal(conversionLabel('whatsapp'), undefined)
})

test('sin NEXT_PUBLIC_GADS_CONV_LLAMADA, conversionLabel(\'llamada\') es undefined', () => {
  delete process.env.NEXT_PUBLIC_GADS_CONV_LLAMADA
  assert.equal(conversionLabel('llamada'), undefined)
})

test('las dos etiquetas son independientes — una puesta no filtra a la otra', () => {
  process.env.NEXT_PUBLIC_GADS_CONV_WHATSAPP = 'AW-111/aaa'
  delete process.env.NEXT_PUBLIC_GADS_CONV_LLAMADA
  assert.equal(conversionLabel('whatsapp'), 'AW-111/aaa')
  assert.equal(conversionLabel('llamada'), undefined)
})

// ═══════════════════════════════════════════════════════════════════════
// Capa 2 — UNA sola implementación del listener, no onClick copiado
// ═══════════════════════════════════════════════════════════════════════

test('ClickTracker.tsx es la ÚNICA implementación que llama gtag(\'event\',\'conversion\'', () => {
  var tracker = readSource('src/components/ClickTracker.tsx')
  assert.match(tracker, /event['"]\s*,\s*['"]conversion['"]/, 'ClickTracker debe disparar el evento de conversión')

  var otrosConSospechoso: string[] = []
  var archivos = [
    'src/components/Navbar.tsx',
    'src/components/Footer.tsx',
    'src/components/WhatsAppButton.tsx',
    'src/app/page.tsx',
    'src/app/contacto/page.tsx',
    'src/app/catalogo/[slug]/page.tsx',
    'src/app/catalogo/page.tsx',
    'src/app/catalogo/CatalogFilters.tsx',
  ]
  for (var f of archivos) {
    var s = readSource(f)
    if (/event['"]\s*,\s*['"]conversion['"]/.test(s)) otrosConSospechoso.push(f)
  }
  assert.deepEqual(otrosConSospechoso, [], 'ningún botón debe tener su propio onClick de conversión copiado — todo pasa por ClickTracker')
})
