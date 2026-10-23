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
import { enlaceWhatsApp, enlaceFlotanteCatalogo, textoFlotanteCatalogo, MAPA_CATEGORIA_FLOTANTE } from '../src/lib/whatsapp.ts'
import { WA_NUMBER, CATEGORIES } from '../src/lib/types.ts'

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

// AJUSTE Julu 22-oct-2026 (punto 1): el header/menú móvil pasa de un texto
// corporativo a uno general. Antes de este cambio este test afirmaba el
// texto VIEJO ("...información sobre regalos corporativos"); ahora afirma el
// nuevo y protege que no vuelva a quedar implícitamente corporativo.
test('AJUSTE 22-oct-2026 · header/menú móvil usa el texto GENERAL, no corporativo', () => {
  var texto = decodeURIComponent(enlaceWhatsApp('header').split('?text=')[1])
  assert.equal(texto, 'Hola, vi su página y quiero cotizar un regalo')
  assert.ok(!/corporativ/i.test(texto), 'el header ya no debe ser el texto corporativo — ese caso es "inicioEmpresarial"')
})

// ═══════════════════════════════════════════════════════════════════════
// Burbuja flotante de /catalogo por CATEGORÍA (AJUSTE Julu 22-oct-2026,
// punto 2). ANCLA primero: el mapa produce un texto DISTINTO del general
// para una categoría real — si esto fallara por accidente (p. ej. un typo en
// el nombre de la categoría que no calza con CATEGORIES), TODAS las demás
// aserciones de "no es la cadena vacía" pasarían igual con el fallback, sin
// medir nada. Por eso el ancla compara contra el texto exacto, no sólo
// "no está vacío".
// ═══════════════════════════════════════════════════════════════════════

test('ANCLA · textoFlotanteCatalogo(\'Empresariales\') devuelve el texto de esa categoría, no el general', () => {
  var texto = textoFlotanteCatalogo('Empresariales')
  assert.equal(texto, 'Hola, me interesan sus regalos empresariales')
  assert.notEqual(texto, textoFlotanteCatalogo(null), 'si coincide con el default, el mapa no se está usando')
})

test('sin categoría (catálogo completo) usa el texto general, nunca cadena vacía', () => {
  assert.equal(textoFlotanteCatalogo(null), 'Hola, estoy viendo su catálogo y me interesa cotizar')
  assert.equal(textoFlotanteCatalogo(undefined), 'Hola, estoy viendo su catálogo y me interesa cotizar')
  assert.equal(textoFlotanteCatalogo(''), 'Hola, estoy viendo su catálogo y me interesa cotizar')
})

test('categoría desconocida (default seguro) cae al texto general, NUNCA cadena vacía', () => {
  var texto = textoFlotanteCatalogo('Categoría Que No Existe')
  assert.equal(texto, 'Hola, estoy viendo su catálogo y me interesa cotizar')
  assert.ok(texto.length > 0)
})

test('TODAS las categorías REALES del sitio (CATEGORIES en types.ts) tienen texto propio en el mapa', () => {
  var general = textoFlotanteCatalogo(null)
  for (var cat of CATEGORIES as readonly string[]) {
    assert.ok(MAPA_CATEGORIA_FLOTANTE[cat], 'falta texto para la categoría real "' + cat + '"')
    assert.notEqual(MAPA_CATEGORIA_FLOTANTE[cat], general, 'la categoría "' + cat + '" no debe caer en el texto genérico')
  }
})

test('las 6 "Ocasiones" del footer también tienen texto en el mapa (aunque hoy ningún link real les pasa ?cat=)', () => {
  var ocasiones = ['Bodas', 'Bautizos', 'Baby Shower', 'San Valentín', 'Navidad', 'Día de las Madres']
  for (var o of ocasiones) {
    assert.ok(MAPA_CATEGORIA_FLOTANTE[o], 'falta texto para la ocasión "' + o + '"')
  }
})

test('un ?cat= con el nombre VIEJO de una categoría ("Bebés") encuentra el texto de la categoría NUEVA', () => {
  assert.equal(textoFlotanteCatalogo('Bebés'), textoFlotanteCatalogo('Bebés & Niños'))
  assert.equal(textoFlotanteCatalogo('Bebés'), 'Hola, me interesa un regalo para bebé o niño')
})

test('enlaceFlotanteCatalogo() arma la URL completa con el texto de la categoría, codificado', () => {
  var url = enlaceFlotanteCatalogo('Aniversarios')
  assert.equal(url, 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent('Hola, me interesa un regalo de aniversario'))
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
