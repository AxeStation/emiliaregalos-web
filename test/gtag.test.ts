/**
 * GTAG FAIL-CLOSED — sin NEXT_PUBLIC_GADS_ID no debe armarse NINGÚN script ni
 * petición a Google. La cuenta de Ads todavía no existe (encargo oct-2026).
 *
 * Node permite reasignar process.env en runtime, así que esta suite muta la
 * variable entre tests. ANCLA primero (abajo): con un id real SÍ se
 * construyen el src y el snippet, para que las aserciones "sin id no hay
 * nada" no pasen por accidente de una función rota que nunca devuelve nada.
 *
 * Correr:  node --experimental-strip-types --test test/gtag.test.ts
 */

import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { gadsId, gtagScriptSrc, gtagInitScript } from '../src/lib/gtag.ts'

function readSource(relPath: string): string {
  var url = new URL('../' + relPath, import.meta.url)
  return readFileSync(fileURLToPath(url), 'utf8')
}

var ORIGINAL = process.env.NEXT_PUBLIC_GADS_ID

function setEnv(v: string | undefined) {
  if (v === undefined) delete process.env.NEXT_PUBLIC_GADS_ID
  else process.env.NEXT_PUBLIC_GADS_ID = v
}

test.after(() => setEnv(ORIGINAL))

// ═══════════════════════════════════════════════════════════════════════
// ANCLA — con un id real, la maquinaria SÍ produce algo
// ═══════════════════════════════════════════════════════════════════════

test('ANCLA · con NEXT_PUBLIC_GADS_ID puesto, gadsId() lo devuelve', () => {
  setEnv('AW-123456789')
  assert.equal(gadsId(), 'AW-123456789')
})

test('ANCLA · gtagScriptSrc() apunta a googletagmanager.com con el id', () => {
  var src = gtagScriptSrc('AW-123456789')
  assert.match(src, /^https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=AW-123456789$/)
})

test('ANCLA · gtagInitScript() incluye gtag(\'config\', id)', () => {
  var snippet = gtagInitScript('AW-123456789')
  assert.match(snippet, /gtag\('config', 'AW-123456789'\)/)
  assert.match(snippet, /dataLayer/)
})

// ═══════════════════════════════════════════════════════════════════════
// FAIL-CLOSED — sin id, undefined. Nunca un id por default ni inventado.
// ═══════════════════════════════════════════════════════════════════════

test('sin NEXT_PUBLIC_GADS_ID (no definida) gadsId() es undefined', () => {
  setEnv(undefined)
  assert.equal(gadsId(), undefined)
})

test('NEXT_PUBLIC_GADS_ID vacía ("") es lo mismo que no tenerla', () => {
  setEnv('')
  assert.equal(gadsId(), undefined)
})

test('NEXT_PUBLIC_GADS_ID de sólo espacios tampoco cuenta como id', () => {
  setEnv('   ')
  assert.equal(gadsId(), undefined)
})

test('gadsId() recorta espacios de un id real', () => {
  setEnv('  AW-999  ')
  assert.equal(gadsId(), 'AW-999')
})

// ═══════════════════════════════════════════════════════════════════════
// Capa 2 — layout.tsx sólo renderiza el <Script> SI gadsId() no es undefined
// ═══════════════════════════════════════════════════════════════════════

test('src/app/layout.tsx importa gadsId() de src/lib/gtag y lo usa como guarda condicional', () => {
  var src = readSource('src/app/layout.tsx')
  assert.match(src, /import\s*\{[^}]*gadsId[^}]*\}\s*from\s*['"]@\/lib\/gtag['"]/,
    'layout.tsx debe importar gadsId desde @/lib/gtag, no reinventar la lectura de env')
  assert.match(src, /gadsId\(\)/, 'layout.tsx debe llamar a gadsId()')
})

test('src/app/layout.tsx no renderiza next/script de forma incondicional', () => {
  var src = readSource('src/app/layout.tsx')
  // Si <Script existe en el archivo, tiene que estar detrás de un condicional
  // que dependa del id (gid/gadsId) — nunca suelto fuera de un if/ternario.
  if (/<Script/.test(src)) {
    assert.match(src, /gid\s*\?|gadsId\(\)\s*\?/, 'el <Script> debe estar guardado por el id, no renderizarse siempre')
  }
})
