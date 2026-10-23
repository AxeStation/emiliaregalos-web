/**
 * Etiqueta de Google (gtag.js) para Google Ads — FAIL-CLOSED a propósito.
 *
 * Encargo oct-2026 (Julu arranca Ads; la cuenta de Ads TODAVÍA NO EXISTE):
 * sin `NEXT_PUBLIC_GADS_ID` no debe salir NINGUNA petición a
 * googletagmanager.com. No es una preferencia de performance — es que un ID
 * inventado o un fallback silencioso mandaría datos a una cuenta de Ads que
 * no existe, o peor, a una que no es la de Emilia.
 *
 * Por eso toda esta lógica vive ACÁ, en funciones puras testeables, y no
 * inline en layout.tsx: layout.tsx (src/app/layout.tsx) sólo pregunta
 * `gadsId()` y, si es undefined, no renderiza absolutamente nada — ni el
 * <script src> ni el snippet inline de config.
 */

// undefined cuando la variable no existe O cuando es '' / sólo espacios.
// Next.js siempre define process.env.NEXT_PUBLIC_GADS_ID como string vacío
// cuando falta en Vercel con un valor en blanco, así que ambos casos tienen
// que caer al mismo lado del fail-closed.
export function gadsId(): string | undefined {
  var id = process.env.NEXT_PUBLIC_GADS_ID
  return id && id.trim() ? id.trim() : undefined
}

export function gtagScriptSrc(id: string): string {
  return 'https://www.googletagmanager.com/gtag/js?id=' + id
}

/**
 * Snippet inline que inicializa window.dataLayer/gtag y llama gtag('config', id).
 *
 * El llamado a 'config' NO es un evento de conversión ni "page_view como
 * conversión" (eso está prohibido por el encargo) — es la inicialización
 * estándar del global site tag que Google Ads exige para que después
 * gtag('event','conversion', ...) (ver src/lib/conversions.ts) tenga a dónde
 * mandar el evento. Sin este 'config' previo, el evento de conversión no
 * tiene destino configurado.
 */
export function gtagInitScript(id: string): string {
  return [
    'window.dataLayer = window.dataLayer || [];',
    'function gtag(){window.dataLayer.push(arguments);}',
    "gtag('js', new Date());",
    "gtag('config', '" + id + "');",
  ].join('\n')
}
