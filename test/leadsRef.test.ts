/**
 * leadsRef — código de referencia en el texto prellenado de WhatsApp (PR 2,
 * pieza A). Ver docs/leads-origen/DISENO.md (secciones 1, 3, 7, 9) para el
 * contrato con el brain y src/lib/leadsRef.ts para el porqué de cada regla.
 *
 * Correr:  node --experimental-strip-types --test test/leadsRef.test.ts
 */

import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import {
  capturarRef,
  leerRef,
  agregarRef,
  pedirCodigo,
} from '../src/lib/leadsRef.ts'

function readSource(relPath: string): string {
  var url = new URL('../' + relPath, import.meta.url)
  return readFileSync(fileURLToPath(url), 'utf8')
}

function fakeWindow() {
  var store = new Map<string, string>()
  return {
    sessionStorage: {
      getItem: function (k: string) { return store.has(k) ? store.get(k)! : null },
      setItem: function (k: string, v: string) { store.set(k, v) },
      removeItem: function (k: string) { store.delete(k) },
    },
  }
}

// ═══════════════════════════════════════════════════════════════════════
// capturarRef() / leerRef() — ANCLA primero
// ═══════════════════════════════════════════════════════════════════════

test('ANCLA · capturarRef lee gclid/utm de la URL y leerRef los devuelve EXACTAMENTE', () => {
  ;(globalThis as any).window = fakeWindow()
  try {
    capturarRef('?gclid=Cj0KABC123&utm_campaign=empresariales&utm_source=google', '/catalogo')
    var ref = leerRef()
    assert.ok(ref, 'si esto es null, capturarRef no guardó nada y el resto no mide nada')
    assert.equal(ref!.gclid, 'Cj0KABC123')
    assert.equal(ref!.utm_campaign, 'empresariales')
    assert.equal(ref!.utm_source, 'google')
    assert.equal(ref!.landing_path, '/catalogo?gclid=Cj0KABC123&utm_campaign=empresariales&utm_source=google')
  } finally {
    delete (globalThis as any).window
  }
})

test('capturarRef también reconoce wbraid y gbraid por separado', () => {
  ;(globalThis as any).window = fakeWindow()
  try {
    capturarRef('?wbraid=W-1', '/catalogo')
    assert.equal(leerRef()!.wbraid, 'W-1')
    assert.equal(leerRef()!.gclid, undefined)
  } finally {
    delete (globalThis as any).window
  }
})

test('si la URL nueva NO trae ningún parámetro de Ads, se CONSERVA lo ya guardado (gclid Y landing_path)', () => {
  ;(globalThis as any).window = fakeWindow()
  try {
    capturarRef('?cat=Empresariales&gclid=PRIMERO', '/catalogo')
    var landingOriginal = leerRef()!.landing_path
    capturarRef('', '/contacto') // navegación interna, sin querystring de Ads
    var ref = leerRef()
    assert.equal(ref!.gclid, 'PRIMERO', 'una navegación interna sin params no debe borrar el gclid del aterrizaje')
    assert.equal(ref!.landing_path, landingOriginal, 'tampoco debe actualizar landing_path si no hay params de Ads nuevos')
  } finally {
    delete (globalThis as any).window
  }
})

test('si la URL nueva SÍ trae un parámetro de Ads, reemplaza por completo lo guardado (nuevo aterrizaje)', () => {
  ;(globalThis as any).window = fakeWindow()
  try {
    capturarRef('?gclid=VIEJO&utm_campaign=vieja', '/catalogo')
    capturarRef('?gclid=NUEVO', '/catalogo')
    var ref = leerRef()
    assert.equal(ref!.gclid, 'NUEVO')
    assert.equal(ref!.utm_campaign, undefined, 'el segundo aterrizaje no trajo utm_campaign — no debe arrastrar la del primero')
  } finally {
    delete (globalThis as any).window
  }
})

test('campos largos se recortan: gclid/wbraid/gbraid a 200, utm_* a 120, landing_path a 200', () => {
  ;(globalThis as any).window = fakeWindow()
  try {
    var gclidLargo = 'G'.repeat(250)
    var utmLargo = 'U'.repeat(150)
    var pathLargo = '/catalogo?' + 'x'.repeat(300)
    capturarRef('?gclid=' + gclidLargo + '&utm_campaign=' + utmLargo, pathLargo)
    var ref = leerRef()
    assert.equal(ref!.gclid!.length, 200)
    assert.equal(ref!.utm_campaign!.length, 120)
    assert.ok(ref!.landing_path!.length <= 200, 'landing_path debe recortarse a 200')
  } finally {
    delete (globalThis as any).window
  }
})

test('capturarRef tolera sessionStorage roto (modo privado) — no truena', () => {
  var w = fakeWindow()
  w.sessionStorage.setItem = function () { throw new Error('QuotaExceededError') }
  ;(globalThis as any).window = w
  try {
    assert.doesNotThrow(function () { capturarRef('?gclid=X', '/catalogo') })
  } finally {
    delete (globalThis as any).window
  }
})

test('leerRef tolera sessionStorage roto y sin window — null, no truena', () => {
  assert.equal(typeof (globalThis as any).window, 'undefined', 'este test asume que corre sin window')
  assert.doesNotThrow(function () {
    assert.equal(leerRef(), null)
  })
})

test('leerRef sin nada guardado todavía devuelve null', () => {
  ;(globalThis as any).window = fakeWindow()
  try {
    assert.equal(leerRef(), null)
  } finally {
    delete (globalThis as any).window
  }
})

// ═══════════════════════════════════════════════════════════════════════
// agregarRef(href, code) — ANCLA primero
// ═══════════════════════════════════════════════════════════════════════

test('ANCLA · con text= existente, el sufijo queda decodificado/codificado bien', () => {
  var href = 'https://wa.me/522225011994?text=' + encodeURIComponent('Hola, me interesan sus regalos empresariales')
  var resultado = agregarRef(href, 'EM-4K7Q')
  var textoFinal = decodeURIComponent(resultado.split('text=')[1])
  assert.equal(textoFinal, 'Hola, me interesan sus regalos empresariales (ref. EM-4K7Q)')
})

test('sin text=, agrega uno nuevo con "Hola" como base', () => {
  var href = 'https://wa.me/522225011994'
  var resultado = agregarRef(href, 'EM-4K7Q')
  assert.ok(resultado.indexOf('?text=') > -1)
  var textoFinal = decodeURIComponent(resultado.split('?text=')[1])
  assert.equal(textoFinal, 'Hola (ref. EM-4K7Q)')
})

test('un href de tel: queda INTACTO — agregarRef nunca le agrega ?text=', () => {
  var href = 'tel:+522225011994'
  assert.equal(agregarRef(href, 'EM-4K7Q'), href)
})

test('un href que no es wa.me/api.whatsapp.com (ej. interno) queda intacto', () => {
  assert.equal(agregarRef('/catalogo', 'EM-4K7Q'), '/catalogo')
})

test('api.whatsapp.com también recibe el sufijo, igual que wa.me', () => {
  var href = 'https://api.whatsapp.com/send?phone=522225011994&text=' + encodeURIComponent('Hola')
  var resultado = agregarRef(href, 'EM-9999')
  assert.equal(decodeURIComponent(resultado.split('text=')[1]), 'Hola (ref. EM-9999)')
})

test('href vacío o code vacío devuelve el href sin tocar, nunca truena', () => {
  assert.equal(agregarRef('', 'EM-1'), '')
  assert.equal(agregarRef('https://wa.me/522225011994?text=Hola', ''), 'https://wa.me/522225011994?text=Hola')
})

test('un text= con porcentaje mal codificado no truena — devuelve el href sin tocar', () => {
  var href = 'https://wa.me/522225011994?text=Hola%'
  assert.doesNotThrow(function () { agregarRef(href, 'EM-1') })
  assert.equal(agregarRef(href, 'EM-1'), href)
})

// ═══════════════════════════════════════════════════════════════════════
// pedirCodigo() — fail-closed sin la variable, fail-soft en cualquier falla
// ═══════════════════════════════════════════════════════════════════════

var ORIGINAL_API = process.env.NEXT_PUBLIC_LEADS_API_URL
var ORIGINAL_FETCH = globalThis.fetch

test.after(() => {
  if (ORIGINAL_API === undefined) delete process.env.NEXT_PUBLIC_LEADS_API_URL
  else process.env.NEXT_PUBLIC_LEADS_API_URL = ORIGINAL_API
  globalThis.fetch = ORIGINAL_FETCH
})

test('ANCLA · sin NEXT_PUBLIC_LEADS_API_URL, pedirCodigo NO hace fetch y devuelve null', async () => {
  delete process.env.NEXT_PUBLIC_LEADS_API_URL
  var llamadas = 0
  globalThis.fetch = (function () { llamadas++; return Promise.reject(new Error('no debía llamarse')) }) as any
  var code = await pedirCodigo({ gclid: 'X' })
  assert.equal(llamadas, 0, 'no debe haber NINGÚN fetch sin la variable configurada')
  assert.equal(code, null)
})

test('ANCLA · con 201 {code}, pedirCodigo devuelve el code', async () => {
  process.env.NEXT_PUBLIC_LEADS_API_URL = 'http://localhost:3099'
  globalThis.fetch = (function () {
    return Promise.resolve({ status: 201, json: function () { return Promise.resolve({ code: 'EM-TEST' }) } })
  }) as any
  var code = await pedirCodigo({ gclid: 'X' })
  assert.equal(code, 'EM-TEST')
})

test('pedirCodigo manda tenant=emilia + los campos dados, a <base>/leads/ref, cors sin credenciales', async () => {
  process.env.NEXT_PUBLIC_LEADS_API_URL = 'http://localhost:3099'
  var capturado: any = null
  globalThis.fetch = (function (url: string, opts: any) {
    capturado = { url, opts }
    return Promise.resolve({ status: 201, json: function () { return Promise.resolve({ code: 'EM-ABCD' }) } })
  }) as any
  await pedirCodigo({ gclid: 'G1', path: '/catalogo', categoria: 'Empresariales', utm: { campaign: 'c1' } })
  assert.equal(capturado.url, 'http://localhost:3099/leads/ref')
  assert.equal(capturado.opts.mode, 'cors')
  assert.equal(capturado.opts.credentials, 'omit')
  var body = JSON.parse(capturado.opts.body)
  assert.equal(body.tenant, 'emilia')
  assert.equal(body.gclid, 'G1')
  assert.equal(body.path, '/catalogo')
  assert.equal(body.categoria, 'Empresariales')
  assert.equal(body.utm.campaign, 'c1')
})

test('429 → null sin lanzar', async () => {
  process.env.NEXT_PUBLIC_LEADS_API_URL = 'http://localhost:3099'
  globalThis.fetch = (function () { return Promise.resolve({ status: 429, json: function () { return Promise.resolve({}) } }) }) as any
  assert.equal(await pedirCodigo({}), null)
})

test('500 → null sin lanzar', async () => {
  process.env.NEXT_PUBLIC_LEADS_API_URL = 'http://localhost:3099'
  globalThis.fetch = (function () { return Promise.resolve({ status: 500, json: function () { return Promise.resolve({}) } }) }) as any
  assert.equal(await pedirCodigo({}), null)
})

test('red caída (fetch rechaza) → null sin lanzar', async () => {
  process.env.NEXT_PUBLIC_LEADS_API_URL = 'http://localhost:3099'
  globalThis.fetch = (function () { return Promise.reject(new TypeError('Failed to fetch')) }) as any
  assert.equal(await pedirCodigo({}), null)
})

test('timeout (abort) → null sin lanzar — seam de test con timeoutMs chico', async () => {
  process.env.NEXT_PUBLIC_LEADS_API_URL = 'http://localhost:3099'
  globalThis.fetch = (function (url: string, opts: any) {
    return new Promise(function (_resolve, reject) {
      opts.signal.addEventListener('abort', function () {
        var err = new Error('aborted')
        err.name = 'AbortError'
        reject(err)
      })
    })
  }) as any
  var code = await pedirCodigo({}, 20)
  assert.equal(code, null)
})

// ═══════════════════════════════════════════════════════════════════════
// Capa 2 — ClickTracker.tsx es quien llama a leadsRef, fail-closed en preventDefault
// ═══════════════════════════════════════════════════════════════════════

test('ClickTracker.tsx importa leadsRef y sólo hace preventDefault si hay NEXT_PUBLIC_LEADS_API_URL', () => {
  var src = readSource('src/components/ClickTracker.tsx')
  assert.match(src, /from\s*['"]@\/lib\/leadsRef['"]/, 'ClickTracker debe importar desde @/lib/leadsRef, no reinventar la captura/POST')
  assert.match(src, /NEXT_PUBLIC_LEADS_API_URL/, 'el preventDefault debe estar atado a la variable de entorno (fail-closed)')
  assert.match(src, /preventDefault/, 'debe llamar preventDefault en el flujo de WhatsApp cuando corresponda')
})

test('ClickTracker.tsx sigue mandando la conversión de gtag (no se rompió al agregar la pieza A)', () => {
  var src = readSource('src/components/ClickTracker.tsx')
  assert.match(src, /event['"]\s*,\s*['"]conversion['"]/)
})
