/**
 * Link corto emiliaregalos.mx/whatsapp → wa.me de Emilia con el texto exacto
 * del auto-catálogo (302). Ruta aprobada por Julu el 9-nov-2026.
 *
 * ANCLA primero: la config sí trae sus redirecciones de siempre (los desvíos
 * de Caja Padrinos). Si redirects() no corriera o devolviera vacío, las
 * aserciones de "NO existe /catalogo" pasarían comparando contra nada.
 *
 * Correr:  node --experimental-strip-types --test test/link-whatsapp.test.ts
 */

import test from 'node:test'
import assert from 'node:assert/strict'
import nextConfig from '../next.config.mjs'

type Regla = { source: string; destination: string; permanent: boolean; statusCode?: number }

async function reglas(): Promise<Regla[]> {
  return (await nextConfig.redirects()) as Regla[]
}

test('ancla: redirects() devuelve las reglas existentes (Caja Padrinos)', async () => {
  const r = await reglas()
  assert.ok(r.some((x) => x.source === '/catalogo/caja-padrinos-1'))
})

test('existe exactamente una regla /whatsapp y es temporal (302)', async () => {
  const r = (await reglas()).filter((x) => x.source === '/whatsapp')
  assert.equal(r.length, 1)
  assert.equal(r[0].permanent, false)
  // `permanent: false` solo, en Next 14, responde 307 (no 302): medido con
  // `next start` + curl. statusCode explícito gana sobre permanent
  // (getRedirectStatus en next/dist/lib/redirect-status.js).
  assert.equal(r[0].statusCode, 302)
})

test('/whatsapp apunta al wa.me de Emilia con el texto exacto', async () => {
  const [regla] = (await reglas()).filter((x) => x.source === '/whatsapp')
  assert.ok(regla, 'no hay regla /whatsapp')
  assert.ok(regla.destination.startsWith('https://wa.me/522225011994?text='))
  const crudo = regla.destination.slice('https://wa.me/522225011994?text='.length)
  assert.equal(decodeURIComponent(crudo), 'Hola, quiero el catálogo')
})

test('protección: ninguna regla toca /catalogo (la página sigue viva)', async () => {
  const r = await reglas()
  assert.equal(r.filter((x) => x.source === '/catalogo' || x.source === '/catalogo/').length, 0)
})
