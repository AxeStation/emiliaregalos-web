'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import TarjetaPreview from '@/components/cart/TarjetaPreview'

export default function TarjetaPage() {
  var router = useRouter()
  var cart = useCart()

  useEffect(function () {
    if (cart.ready && cart.draft.items.length === 0) router.replace('/carrito')
  }, [cart.ready, cart.draft.items.length, router])

  if (!cart.ready || cart.draft.items.length === 0) {
    return <div className="pt-24 pb-20 px-5 bg-cream min-h-screen" />
  }

  return (
    <div className="pt-24 pb-20 px-5 bg-cream min-h-screen">
      <div className="max-w-3xl mx-auto">
        <p className="text-center text-[10px] tracking-[0.2em] uppercase text-beige mb-2">Paso 1 de 3</p>
        <h1 className="font-display text-4xl md:text-5xl text-center mb-3">¿Qué le quieres decir?</h1>
        <p className="text-center text-sm text-charcoal mb-12 max-w-md mx-auto">
          Esto es lo que va a leer quien reciba el regalo — el mensaje es el regalo, la caja
          sólo lo acompaña.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          <div className="space-y-4">
            <label className="block">
              <span className="block text-xs tracking-wider uppercase text-charcoal mb-2">Tu mensaje</span>
              <textarea
                value={cart.draft.card.message}
                onChange={function (e) { cart.setCard({ message: e.target.value }) }}
                rows={6}
                maxLength={500}
                placeholder="Escribe aquí lo que le quieres decir…"
                className="w-full bg-white border border-gold/20 rounded-sm px-4 py-3 text-sm text-black outline-none focus:border-gold-strong transition-colors resize-none"
              />
            </label>
            <label className="block">
              <span className="block text-xs tracking-wider uppercase text-charcoal mb-2">De parte de (opcional)</span>
              <input
                type="text"
                value={cart.draft.card.from}
                onChange={function (e) { cart.setCard({ from: e.target.value }) }}
                placeholder="Tu nombre o el de quien envía"
                className="w-full bg-white border border-gold/20 rounded-sm px-4 py-3 text-sm text-black outline-none focus:border-gold-strong transition-colors"
              />
            </label>
          </div>

          <div>
            <TarjetaPreview data={{ message: cart.draft.card.message, to: '', from: cart.draft.card.from }} />
            <p className="text-[11px] text-beige text-center mt-3">
              El nombre de quien recibe se agrega en el siguiente paso.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-12 max-w-3xl mx-auto">
          <Link href="/carrito" className="text-xs tracking-wider uppercase text-charcoal hover:text-gold-strong transition-colors">
            ← Volver al carrito
          </Link>
          <button
            type="button"
            disabled={!cart.draft.card.message.trim()}
            onClick={function () { router.push('/carrito/datos') }}
            className="bg-gold-strong text-white text-xs tracking-[0.2em] uppercase px-8 py-4 rounded-full hover:bg-gold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  )
}
