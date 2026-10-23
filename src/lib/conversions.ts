/**
 * Conversiones de Google Ads — SOLO contactos reales.
 *
 * Encargo oct-2026: conversión = clic en un enlace de WhatsApp o en un
 * enlace `tel:`. NADA de `page_view` ni "visitó la página" como conversión
 * — eso infla el embudo con gente que nunca contactó a Emilia.
 *
 * Esta detección vive en funciones puras (sin DOM) para que el listener
 * delegado — ÚNICA implementación, en src/components/ClickTracker.tsx,
 * montado una vez en el layout raíz — sea lo único que necesita tocar el
 * DOM. Nada de onClick copiado botón por botón.
 */

export type ConversionKind = 'whatsapp' | 'llamada'

/**
 * ¿El href de un <a> es un contacto real? Mira el href CRUDO (getAttribute,
 * no la propiedad .href ya resuelta) para que 'tel:+52...' y los dos hosts
 * de WhatsApp (wa.me y api.whatsapp.com, que es el link "oficial" largo que
 * WhatsApp genera a veces) se reconozcan igual.
 */
export function contactKindFromHref(href: string | null | undefined): ConversionKind | null {
  if (!href) return null
  if (href.indexOf('https://wa.me/') === 0) return 'whatsapp'
  if (href.indexOf('https://api.whatsapp.com/') === 0) return 'whatsapp'
  if (href.indexOf('tel:') === 0) return 'llamada'
  return null
}

/**
 * Etiqueta de conversión por variable de entorno pública — formato
 * "AW-XXXX/YYYY" que da Google Ads al crear la acción de conversión.
 *
 * FAIL-CLOSED igual que gadsId() (ver src/lib/gtag.ts): sin la variable, el
 * clic funciona exactamente igual (la navegación a WhatsApp/tel: nunca se
 * bloquea) pero no se manda ningún evento — no hay fallback con una etiqueta
 * inventada.
 */
export function conversionLabel(kind: ConversionKind): string | undefined {
  var raw = kind === 'whatsapp'
    ? process.env.NEXT_PUBLIC_GADS_CONV_WHATSAPP
    : process.env.NEXT_PUBLIC_GADS_CONV_LLAMADA
  return raw && raw.trim() ? raw.trim() : undefined
}
