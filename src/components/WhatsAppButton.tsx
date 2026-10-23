'use client'

import { Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { enlaceWhatsApp, enlaceFlotanteCatalogo, type ContextoWhatsApp } from '@/lib/whatsapp'

// Burbuja flotante global (en TODAS las páginas vía layout.tsx). El mensaje
// cambia según dónde esté el visitante — "distinto según página/botón" (d) —
// sin agregar un botón nuevo: inicio y catálogo ya tenían este enlace, sólo
// que sin ?text=. Fuera de esas dos secciones usa el mensaje genérico.
//
// AJUSTE Julu 22-oct-2026 (punto 2 y 3): en /catalogo el texto depende de la
// categoría activa (`?cat=`), para saber qué campaña de Ads trajo al cliente.
// Cómo se obtiene la categoría: el componente YA era 'use client' (necesita
// usePathname para elegir contexto) — agregar useSearchParams() reutiliza el
// mismo mecanismo cliente, sin tocar layout.tsx ni volverlo client component.
//
// `/catalogo` (raíz): lee `?cat=` de la URL — es la categoría con la que el
// visitante ENTRÓ (el link del anuncio o de "Para cada ocasión" del home).
// Si dentro de la página cambia de categoría con los chips de
// CatalogFilters.tsx, la URL NO se actualiza (CatalogFilters guarda la
// categoría en useState, no en la URL) — medido en el código al escribir
// esto. Esta burbuja, por lo tanto, refleja la categoría de ENTRADA, no la
// que esté viendo en ese instante si cambió de chip. Eso es justo lo que
// Julu pidió medir (qué campaña trajo a cada cliente), así que no hace falta
// sincronizar los chips con la URL para este encargo.
//
// `/catalogo/<slug>` (ficha de producto): NO hay forma fácil de obtener la
// categoría del producto desde este componente — se monta una sola vez en el
// layout raíz, sin props, y el producto se resuelve en un server component
// (`src/app/catalogo/[slug]/page.tsx`) que no expone esa categoría a un
// cliente global. Cablear eso requeriría un contexto/provider nuevo sólo para
// esta burbuja — fuera de alcance de este ajuste. Por eso la ficha de
// producto cae al texto general del catálogo (mismo que /catalogo sin
// categoría reconocida).
//
// POR QUÉ EL <Suspense>: Next.js exige que todo componente que llame
// useSearchParams() esté envuelto en un <Suspense>, o la página entera donde
// se monta pierde el prerender estático. Como este botón se monta en el
// layout RAÍZ, sin el Suspense esa pérdida era TODA página del sitio —
// medido con `npm run build`: sin esto, "/", "/catalogo" y todo "/carrito/*"
// fallaban a prerenderear con "missing-suspense-with-csr-bailout". Por eso
// useSearchParams() vive aislado en `BurbujaCatalogo`, montado sólo cuando
// pathname === '/catalogo', y el resto de las rutas ni siquiera la cargan.
function contextoPorRuta(pathname: string): ContextoWhatsApp {
  if (pathname === '/') return 'flotanteInicio'
  return 'flotante'
}

function Burbuja({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg shadow-[#25D366]/30 hover:scale-110 transition-transform"
      aria-label="WhatsApp"
    >
      <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
        <path d="M12 4a8 8 0 00-6.93 12l-1 3.6 3.7-1A8 8 0 1012 4zm4.6 11.1c-.2.5-1 1-1.4 1-.4 0-.7.1-2.2-.5-1.8-.7-3-2.6-3.1-2.7-.1-.1-.9-1.2-.9-2.3s.6-1.6.8-1.8c.2-.2.4-.3.6-.3h.4c.2 0 .4 0 .5.4l.7 1.7c.1.2 0 .4-.1.5l-.3.4c-.1.1-.2.3-.1.5.2.3.7 1 1.4 1.6.8.7 1.5.9 1.8 1 .2.1.4 0 .5-.1l.5-.6c.1-.2.3-.2.5-.1l1.6.8c.2.1.3.2.3.4 0 .2-.1.6-.3 1.1z"/>
      </svg>
    </a>
  )
}

// Único componente que lee useSearchParams() — ver comentario del Suspense arriba.
function BurbujaCatalogo() {
  var searchParams = useSearchParams()
  var href = enlaceFlotanteCatalogo(searchParams ? searchParams.get('cat') : null)
  return <Burbuja href={href} />
}

export default function WhatsAppButton() {
  var pathname = usePathname() || ''

  if (pathname === '/catalogo') {
    return (
      <Suspense fallback={<Burbuja href={enlaceFlotanteCatalogo(null)} />}>
        <BurbujaCatalogo />
      </Suspense>
    )
  }

  if (pathname.indexOf('/catalogo/') === 0) {
    // Ficha de producto — ver comentario de arriba: cae al general.
    return <Burbuja href={enlaceFlotanteCatalogo(null)} />
  }

  return <Burbuja href={enlaceWhatsApp(contextoPorRuta(pathname))} />
}
