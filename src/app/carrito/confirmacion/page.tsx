'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function Confirmacion() {
  var params = useSearchParams()
  var folio = params.get('folio')

  return (
    <div className="pt-24 pb-20 px-5 bg-cream min-h-screen">
      <div className="max-w-lg mx-auto text-center py-16">
        <h1 className="font-display text-4xl md:text-5xl mb-4">Cotización creada</h1>
        {/*
          Copy mínimo funcional — B1 (pagos en la web) todavía no existe,
          así que el flujo real termina aquí: no hay forma honesta de decir
          más sin inventar un siguiente paso que el sitio no puede cumplir.
          PENDIENTE aprobación de tono de Julu (ver PR).
        */}
        <p className="text-sm text-charcoal mb-2">
          {folio ? 'Folio ' + folio + '. ' : ''}Te contactamos para coordinar el pago.
        </p>
        <p className="text-xs text-beige mb-10">
          Cuando confirmemos el pago, te pedimos la dirección de entrega.
        </p>
        <Link
          href="/catalogo"
          className="inline-block bg-gold-strong text-white text-xs tracking-[0.2em] uppercase px-8 py-4 rounded-full hover:bg-gold transition-colors"
        >
          Seguir viendo el catálogo
        </Link>
      </div>
    </div>
  )
}

export default function ConfirmacionPage() {
  return (
    <Suspense>
      <Confirmacion />
    </Suspense>
  )
}
