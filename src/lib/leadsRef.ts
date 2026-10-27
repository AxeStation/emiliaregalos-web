/**
 * Código de referencia en el texto prellenado de WhatsApp — PR 2, pieza A
 * (encargo "Leads con origen", oct-2026). Ver
 * docs/leads-origen/DISENO.md (secciones 1, 3, 7, 9) para el contrato
 * completo con el brain.
 *
 * Dos mitades:
 *  1. capturarRef()/leerRef() — captura gclid/wbraid/gbraid/utm_* de la URL
 *     al entrar y los guarda en sessionStorage (sobrevive navegación interna
 *     dentro de la misma pestaña, se pierde al cerrarla — igual que el gclid
 *     mismo, que Google Ads deja de reconocer a los 90 días de cualquier forma).
 *  2. pedirCodigo()/agregarRef() — al hacer clic en un enlace de WhatsApp
 *     (src/components/ClickTracker.tsx, único lugar que llama a esto), se le
 *     pide un código corto al brain y se pega al final del texto YA aprobado
 *     por Julu (src/lib/whatsapp.ts): "... (ref. EM-4K7Q)".
 *
 * FAIL-SOFT en TODO este módulo, a propósito: nada de esto debe bloquear
 * nunca un lead real. sessionStorage roto (modo privado), el brain caído,
 * un timeout — todos los caminos de error devuelven null/no hacen nada, y
 * ClickTracker abre WhatsApp exactamente como si este módulo no existiera.
 *
 * Server-safe por el mismo patrón que src/lib/draftStorage.ts: nada toca
 * `window` fuera de las funciones, así que importar este archivo no rompe
 * el render en servidor.
 */

var STORAGE_KEY = 'emilia_leads_ref_v1'

// Límites del DISENO.md sección 2 (columnas de leads_origen): gclid/wbraid/
// gbraid ≤200, utm_* ≤120. landing_path ≤200 por el encargo mismo.
var MAX_CLICK_ID_LEN = 200
var MAX_UTM_LEN = 120
var MAX_PATH_LEN = 200

export type LeadsRefData = {
  gclid?: string
  wbraid?: string
  gbraid?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
  landing_path?: string
}

var CAMPOS_CLIC: Array<Exclude<keyof LeadsRefData, 'landing_path'>> = [
  'gclid', 'wbraid', 'gbraid',
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
]

var MAX_POR_CAMPO: Record<string, number> = {
  gclid: MAX_CLICK_ID_LEN, wbraid: MAX_CLICK_ID_LEN, gbraid: MAX_CLICK_ID_LEN,
  utm_source: MAX_UTM_LEN, utm_medium: MAX_UTM_LEN, utm_campaign: MAX_UTM_LEN,
  utm_term: MAX_UTM_LEN, utm_content: MAX_UTM_LEN,
}

function recortar(v: string | null | undefined, max: number): string | undefined {
  if (!v) return undefined
  var t = v.trim()
  if (!t) return undefined
  return t.length > max ? t.slice(0, max) : t
}

/**
 * Lee gclid/wbraid/gbraid/utm_* de `search` (ej. "?gclid=abc&utm_source=x")
 * y, si trae AL MENOS UNO, reemplaza por completo lo guardado en
 * sessionStorage — junto con `landing_path` (`pathname + search`, recortado
 * a 200). Si la URL nueva no trae NINGUNO de estos campos, no toca lo que ya
 * había: así una navegación interna del sitio (sin querystring de Ads) no le
 * borra al cliente la atribución de su aterrizaje original.
 *
 * Nunca lanza: sin `window` (render de servidor) no hace nada; con
 * sessionStorage roto (pestaña privada, cuota llena) atrapa el error y
 * sigue — esto JAMÁS debe tumbar el render de una página.
 */
export function capturarRef(search: string, pathname: string): void {
  if (typeof window === 'undefined') return
  try {
    var qs = new URLSearchParams(search || '')
    var data: LeadsRefData = {}
    var hayAlgo = false

    for (var campo of CAMPOS_CLIC) {
      var valor = recortar(qs.get(campo), MAX_POR_CAMPO[campo])
      if (valor) {
        data[campo] = valor
        hayAlgo = true
      }
    }

    // Sin ningún parámetro de Ads en la URL nueva: se conserva lo guardado,
    // tal cual estaba (ni se toca, ni se borra).
    if (!hayAlgo) return

    data.landing_path = recortar((pathname || '') + (search || ''), MAX_PATH_LEN)
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // sessionStorage roto o bloqueado — no bloquear la página por esto.
  }
}

/** Lee lo guardado por capturarRef(). null si no hay nada, sin window, o si sessionStorage falla. */
export function leerRef(): LeadsRefData | null {
  if (typeof window === 'undefined') return null
  try {
    var raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    var data = JSON.parse(raw)
    return data && typeof data === 'object' ? (data as LeadsRefData) : null
  } catch {
    return null
  }
}

/**
 * Agrega " (ref. CODE)" al texto prellenado (`?text=`) de un enlace de
 * WhatsApp (wa.me / api.whatsapp.com). Decodifica el texto existente, pega
 * el sufijo, y vuelve a codificar — nunca concatena %20 a mano. Si el
 * enlace no tiene `text=`, agrega uno nuevo con "Hola" como base.
 *
 * Cualquier OTRO enlace (tel:, interno, lo que sea) vuelve SIN TOCAR: esta
 * función sólo tiene sentido para los dos hosts de WhatsApp, y un href roto
 * o vacío nunca debe tronar — en el peor de los casos, el enlace original
 * se abre sin el código.
 */
export function agregarRef(href: string, code: string): string {
  if (!href || !code) return href
  var esWhatsApp = href.indexOf('https://wa.me/') === 0 || href.indexOf('https://api.whatsapp.com/') === 0
  if (!esWhatsApp) return href

  try {
    var match = href.match(/([?&])text=([^&]*)/)
    if (match) {
      var original = decodeURIComponent(match[2])
      var nuevoBloque = match[1] + 'text=' + encodeURIComponent(original + ' (ref. ' + code + ')')
      return href.replace(match[0], nuevoBloque)
    }
    var separador = href.indexOf('?') === -1 ? '?' : '&'
    return href + separador + 'text=' + encodeURIComponent('Hola (ref. ' + code + ')')
  } catch {
    // text= mal codificado (percent-encoding roto) — mejor un enlace sin
    // código que uno que truena al armarlo.
    return href
  }
}

export type PedirCodigoInput = {
  gclid?: string
  wbraid?: string
  gbraid?: string
  utm?: { source?: string; medium?: string; campaign?: string; term?: string; content?: string }
  path?: string
  categoria?: string
}

/**
 * POST {NEXT_PUBLIC_LEADS_API_URL}/leads/ref. 201 con `{code}` → ese code;
 * CUALQUIER otra cosa (400/429/500, timeout, red caída, CORS, JSON roto) →
 * null, SIN LANZAR — el llamador (ClickTracker) abre el enlace original sin
 * código en ese caso.
 *
 * FAIL-CLOSED igual que gadsId()/conversionLabel() (src/lib/gtag.ts,
 * src/lib/conversions.ts): sin la variable de entorno, no sale NINGÚN
 * fetch — ni un intento.
 *
 * `timeoutMs` es un seam de test (default 1500 — DISENO.md sección 3: "si
 * el brain no responde en 1.5s, el sitio abre WhatsApp sin código"). Nadie
 * en producción lo pasa; sólo los tests lo acortan para no esperar 1.5s de
 * verdad por cada caso de timeout.
 */
export async function pedirCodigo(input: PedirCodigoInput, timeoutMs?: number): Promise<string | null> {
  var base = process.env.NEXT_PUBLIC_LEADS_API_URL
  if (!base || !base.trim()) return null

  var controller = new AbortController()
  var timer = setTimeout(function () { controller.abort() }, timeoutMs == null ? 1500 : timeoutMs)

  try {
    var res = await fetch(base.trim().replace(/\/$/, '') + '/leads/ref', {
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.assign({ tenant: 'emilia' }, input)),
      signal: controller.signal,
    })
    if (res.status !== 201) return null
    var data: unknown = await res.json()
    var code = data && typeof (data as { code?: unknown }).code === 'string' ? (data as { code: string }).code : null
    return code
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}
