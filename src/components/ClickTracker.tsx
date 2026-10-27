'use client'

import { useEffect } from 'react'
import { contactKindFromHref, conversionLabel } from '@/lib/conversions'
import { capturarRef, leerRef, pedirCodigo, agregarRef } from '@/lib/leadsRef'

/**
 * Listener delegado ÚNICO para conversiones de Google Ads (encargo "Medición
 * para Ads", oct-2026) Y para el código de referencia de leads (encargo
 * "Leads con origen", PR 2 pieza A — docs/leads-origen/DISENO.md). Se monta
 * UNA vez en el layout raíz (src/app/layout.tsx) y escucha todos los clics
 * del documento — nada de onClick copiado en cada botón de WhatsApp/llamada
 * del sitio.
 *
 * Detección (contactKindFromHref, src/lib/conversions.ts): cualquier
 * `a[href^="https://wa.me/"]`, `a[href^="https://api.whatsapp.com/"]` o
 * `a[href^="tel:"]`.
 *
 * La conversión de gtag NUNCA bloquea la navegación (no llama
 * preventDefault). Si gtag no existe (sin NEXT_PUBLIC_GADS_ID, ver
 * src/lib/gtag.ts) o no hay etiqueta para ese tipo (conversionLabel(),
 * fail-closed), simplemente no manda nada.
 *
 * transport_type: 'beacon' — el evento se manda de forma asíncrona sin
 * esperar respuesta, así el clic en un link que abre en la misma pestaña
 * (ej. tel:, que no tiene target="_blank") no se demora ni se pierde por la
 * navegación. Es la recomendación de Google para "outbound click tracking".
 *
 * EL CÓDIGO DE REFERENCIA (pieza A) sólo aplica a enlaces de WhatsApp, y
 * SÓLO intercepta la navegación (preventDefault) cuando hay
 * NEXT_PUBLIC_LEADS_API_URL configurada — fail-closed: sin la variable, un
 * clic en WhatsApp se comporta exactamente igual que antes de este PR.
 */
export default function ClickTracker() {
  // Captura al entrar (pieza A, punto 1): se corre UNA vez al montar este
  // componente en el layout raíz, es decir, en la primera carga completa de
  // cualquier página (que es cuando llega un gclid real de un anuncio). Las
  // navegaciones client-side posteriores dentro del sitio no traen
  // querystring de Ads nuevo, así que no hay necesidad de releer en cada una.
  useEffect(function () {
    capturarRef(window.location.search, window.location.pathname)
  }, [])

  useEffect(function () {
    function onClick(e: MouseEvent) {
      var target = e.target as Element | null
      var anchor = target ? (target.closest('a') as HTMLAnchorElement | null) : null
      if (!anchor) return

      var href = anchor.getAttribute('href')
      var kind = contactKindFromHref(href)
      if (!kind) return

      var label = conversionLabel(kind)
      if (label) {
        var gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag
        if (typeof gtag === 'function') {
          gtag('event', 'conversion', {
            send_to: label,
            transport_type: 'beacon',
          })
        }
      }

      if (kind === 'whatsapp' && href) {
        manejarClicWhatsApp(e, anchor, href)
      }
    }

    document.addEventListener('click', onClick)
    return function () {
      document.removeEventListener('click', onClick)
    }
  }, [])

  return null
}

/**
 * Pide el código de referencia al brain y re-abre el enlace con el texto
 * actualizado. `e.preventDefault()` SOLO si hay NEXT_PUBLIC_LEADS_API_URL —
 * sin la variable, esta función no hace nada y el <a> navega normal (fail-
 * closed, sin tocar el comportamiento de hoy).
 */
function manejarClicWhatsApp(e: MouseEvent, anchor: HTMLAnchorElement, href: string) {
  if (!process.env.NEXT_PUBLIC_LEADS_API_URL || !process.env.NEXT_PUBLIC_LEADS_API_URL.trim()) return

  e.preventDefault()

  var ref = leerRef() || {}
  // Categoría activa: sólo tiene sentido en /catalogo (ver src/lib/whatsapp.ts,
  // textoFlotanteCatalogo — el mismo mecanismo que ya usa la burbuja).
  var categoria: string | undefined
  if (window.location.pathname === '/catalogo') {
    categoria = new URLSearchParams(window.location.search).get('cat') || undefined
  }

  var targetAttr = anchor.target
  var abrirNuevaPestana = targetAttr === '_blank' || e.ctrlKey || e.metaKey || e.shiftKey

  pedirCodigo({
    gclid: ref.gclid,
    wbraid: ref.wbraid,
    gbraid: ref.gbraid,
    utm: {
      source: ref.utm_source,
      medium: ref.utm_medium,
      campaign: ref.utm_campaign,
      term: ref.utm_term,
      content: ref.utm_content,
    },
    path: ref.landing_path,
    categoria: categoria,
  }).then(function (code) {
    var destino = code ? agregarRef(href, code) : href
    // Respeta target y modificadores (cmd/ctrl/shift-clic abre en pestaña
    // nueva igual que antes de interceptar el clic).
    if (abrirNuevaPestana) {
      window.open(destino, '_blank', 'noopener,noreferrer')
    } else {
      window.location.href = destino
    }
  })
}
