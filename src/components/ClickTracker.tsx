'use client'

import { useEffect } from 'react'
import { contactKindFromHref, conversionLabel } from '@/lib/conversions'

/**
 * Listener delegado ÚNICO para conversiones de Google Ads (encargo "Medición
 * para Ads", oct-2026). Se monta UNA vez en el layout raíz (src/app/layout.tsx)
 * y escucha todos los clics del documento — nada de onClick copiado en cada
 * botón de WhatsApp/llamada del sitio.
 *
 * Detección (contactKindFromHref, src/lib/conversions.ts): cualquier
 * `a[href^="https://wa.me/"]`, `a[href^="https://api.whatsapp.com/"]` o
 * `a[href^="tel:"]`.
 *
 * NO bloquea la navegación: nunca llama preventDefault(). Si gtag no existe
 * (sin NEXT_PUBLIC_GADS_ID, ver src/lib/gtag.ts) o no hay etiqueta de
 * conversión para ese tipo (conversionLabel(), fail-closed), simplemente no
 * manda nada — el clic sigue abriendo WhatsApp o el dialer exactamente igual.
 *
 * transport_type: 'beacon' — el evento se manda de forma asíncrona sin
 * esperar respuesta, así el clic en un link que abre en la misma pestaña
 * (ej. tel:, que no tiene target="_blank") no se demora ni se pierde por la
 * navegación. Es la recomendación de Google para "outbound click tracking".
 */
export default function ClickTracker() {
  useEffect(function () {
    function onClick(e: MouseEvent) {
      var target = e.target as Element | null
      var anchor = target ? target.closest('a') : null
      if (!anchor) return

      var href = anchor.getAttribute('href')
      var kind = contactKindFromHref(href)
      if (!kind) return

      var label = conversionLabel(kind)
      if (!label) return // fail-closed: sin etiqueta, no se manda nada

      var gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag
      if (typeof gtag !== 'function') return // sin NEXT_PUBLIC_GADS_ID no hay gtag cargado

      gtag('event', 'conversion', {
        send_to: label,
        transport_type: 'beacon',
      })
    }

    document.addEventListener('click', onClick)
    return function () {
      document.removeEventListener('click', onClick)
    }
  }, [])

  return null
}
