'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import TarjetaPreview from '@/components/cart/TarjetaPreview'
import { fmtPrice } from '@/lib/types'
import { SHIPPING_LABEL } from '@/lib/cart'

export default function RevisarPage() {
  var router = useRouter()
  var cart = useCart()
  var [sending, setSending] = useState(false)
  var [error, setError] = useState<string | null>(null)

  var canSubmit = cart.ready
    && cart.draft.items.length > 0
    && cart.draft.card.message.trim().length > 0
    && cart.draft.buyerName.trim().length > 0
    && cart.draft.buyerPhone.trim().length > 0
    && cart.draft.recipientName.trim().length > 0

  useEffect(function () {
    if (cart.ready && !canSubmit && !sending) router.replace('/carrito')
  }, [cart.ready, canSubmit, sending, router])

  if (!cart.ready || !canSubmit) {
    return <div className="pt-24 pb-20 px-5 bg-cream min-h-screen" />
  }

  async function handleConfirm() {
    setSending(true)
    setError(null)
    try {
      var res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          items: cart.draft.items,
          card: cart.draft.card,
          buyer: { name: cart.draft.buyerName, phone: cart.draft.buyerPhone, email: cart.draft.buyerEmail },
          recipientName: cart.draft.recipientName,
        }),
      })
      var data = await res.json()
      if (!res.ok || !data.ok) {
        setError(data.error || 'No se pudo enviar tu pedido. Intenta de nuevo en un momento.')
        setSending(false)
        return
      }
      var quoteNumber = data.quote && data.quote.quote_number ? String(data.quote.quote_number) : ''
      cart.clear()
      router.push('/carrito/confirmacion' + (quoteNumber ? '?folio=' + encodeURIComponent(quoteNumber) : ''))
    } catch {
      setError('No se pudo conectar. Revisa tu internet e intenta de nuevo.')
      setSending(false)
    }
  }

  return (
    <div className="pt-24 pb-20 px-5 bg-cream min-h-screen">
      <div className="max-w-3xl mx-auto">
        <p className="text-center text-[10px] tracking-[0.2em] uppercase text-beige mb-2">Paso 3 de 3</p>
        <h1 className="font-display text-4xl md:text-5xl text-center mb-12">Revisa tu pedido</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
          <div>
            <h2 className="text-xs tracking-[0.2em] uppercase text-gold-strong mb-4">La tarjeta</h2>
            <TarjetaPreview
              data={{ message: cart.draft.card.message, to: cart.draft.recipientName, from: cart.draft.card.from }}
            />
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-xs tracking-[0.2em] uppercase text-gold-strong mb-3">Productos</h2>
              <div className="space-y-2">
                {cart.draft.items.map(function (item) {
                  return (
                    <div key={item.product_id + '|' + (item.variant_name || '')} className="flex justify-between text-sm">
                      <span className="text-charcoal">
                        {item.quantity} × {item.name}{item.variant_name ? ' (' + item.variant_name + ')' : ''}
                      </span>
                      <span className="font-medium shrink-0 ml-2">{fmtPrice(item.unit_price * item.quantity)}</span>
                    </div>
                  )
                })}
              </div>
              <div className="border-t border-gold/20 mt-3 pt-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-charcoal">Subtotal</span>
                  <span className="font-medium">{fmtPrice(cart.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-charcoal">Envío</span>
                  <span className="text-beige italic">{SHIPPING_LABEL}</span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xs tracking-[0.2em] uppercase text-gold-strong mb-2">Contacto</h2>
              <p className="text-sm text-charcoal">{cart.draft.buyerName} · {cart.draft.buyerPhone}</p>
            </div>
          </div>
        </div>

        {error ? (
          <p className="text-center text-sm text-wine mb-6">{error}</p>
        ) : null}

        <div className="flex items-center justify-between">
          <Link href="/carrito/datos" className="text-xs tracking-wider uppercase text-charcoal hover:text-gold-strong transition-colors">
            ← Volver
          </Link>
          <button
            type="button"
            disabled={sending}
            onClick={handleConfirm}
            className="bg-black text-white text-xs tracking-[0.2em] uppercase px-8 py-4 rounded-full hover:bg-charcoal transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {sending ? 'Enviando…' : 'Confirmar pedido'}
          </button>
        </div>
      </div>
    </div>
  )
}
