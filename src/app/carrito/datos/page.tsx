'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'

export default function DatosPage() {
  var router = useRouter()
  var cart = useCart()

  useEffect(function () {
    if (cart.ready && (cart.draft.items.length === 0 || !cart.draft.card.message.trim())) {
      router.replace(cart.draft.items.length === 0 ? '/carrito' : '/carrito/tarjeta')
    }
  }, [cart.ready, cart.draft.items.length, cart.draft.card.message, router])

  if (!cart.ready || cart.draft.items.length === 0 || !cart.draft.card.message.trim()) {
    return <div className="pt-24 pb-20 px-5 bg-cream min-h-screen" />
  }

  var canContinue = cart.draft.buyerName.trim() && cart.draft.buyerPhone.trim() && cart.draft.recipientName.trim()

  return (
    <div className="pt-24 pb-20 px-5 bg-cream min-h-screen">
      <div className="max-w-lg mx-auto">
        <p className="text-center text-[10px] tracking-[0.2em] uppercase text-beige mb-2">Paso 2 de 3</p>
        <h1 className="font-display text-4xl md:text-5xl text-center mb-3">¿Quién compra y quién recibe?</h1>
        <p className="text-center text-sm text-charcoal mb-12 max-w-md mx-auto">
          Son dos personas distintas: te contactamos a ti para coordinar el pago, y el regalo
          llega a nombre de quien elijas.
        </p>

        <div className="space-y-8">
          <div>
            <h2 className="text-xs tracking-[0.2em] uppercase text-gold-strong mb-4">Quien compra (tú)</h2>
            <div className="space-y-4">
              <input
                type="text"
                value={cart.draft.buyerName}
                onChange={function (e) { cart.setBuyer({ buyerName: e.target.value }) }}
                placeholder="Tu nombre"
                className="w-full bg-white border border-gold/20 rounded-sm px-4 py-3 text-sm text-black outline-none focus:border-gold-strong transition-colors"
              />
              <input
                type="tel"
                value={cart.draft.buyerPhone}
                onChange={function (e) { cart.setBuyer({ buyerPhone: e.target.value }) }}
                placeholder="Tu WhatsApp (10 dígitos)"
                className="w-full bg-white border border-gold/20 rounded-sm px-4 py-3 text-sm text-black outline-none focus:border-gold-strong transition-colors"
              />
              <input
                type="email"
                value={cart.draft.buyerEmail}
                onChange={function (e) { cart.setBuyer({ buyerEmail: e.target.value }) }}
                placeholder="Correo (opcional)"
                className="w-full bg-white border border-gold/20 rounded-sm px-4 py-3 text-sm text-black outline-none focus:border-gold-strong transition-colors"
              />
            </div>
          </div>

          <div>
            <h2 className="text-xs tracking-[0.2em] uppercase text-gold-strong mb-4">Quien recibe</h2>
            <input
              type="text"
              value={cart.draft.recipientName}
              onChange={function (e) { cart.setRecipientName(e.target.value) }}
              placeholder="Nombre de quien recibe el regalo"
              className="w-full bg-white border border-gold/20 rounded-sm px-4 py-3 text-sm text-black outline-none focus:border-gold-strong transition-colors"
            />
            <p className="text-[11px] text-beige mt-2">
              Su nombre va en la tarjeta. La dirección se pide después, cuando acordemos el pago
              contigo — y nunca le mostramos el precio a quien recibe.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-12">
          <Link href="/carrito/tarjeta" className="text-xs tracking-wider uppercase text-charcoal hover:text-gold-strong transition-colors">
            ← Volver
          </Link>
          <button
            type="button"
            disabled={!canContinue}
            onClick={function () { router.push('/carrito/revisar') }}
            className="bg-gold-strong text-white text-xs tracking-[0.2em] uppercase px-8 py-4 rounded-full hover:bg-gold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Revisar pedido
          </button>
        </div>
      </div>
    </div>
  )
}
