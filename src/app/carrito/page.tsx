'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/context/CartContext'
import { fmtPrice, optimizeImage } from '@/lib/types'
import { SHIPPING_LABEL } from '@/lib/cart'

export default function CarritoPage() {
  var cart = useCart()

  // Antes de que el efecto de montaje lea localStorage, `ready` es false y
  // el carrito luce vacío en server y cliente por igual — sin esto habría
  // un parpadeo "vacío → con productos" apenas hidrata, o peor, un mismatch
  // de hidratación si el servidor y el cliente difieren.
  if (!cart.ready) {
    return <div className="pt-24 pb-20 px-5 bg-cream min-h-screen" />
  }

  if (cart.draft.items.length === 0) {
    return (
      <div className="pt-24 pb-20 px-5 bg-cream min-h-screen">
        <div className="max-w-xl mx-auto text-center py-20">
          <h1 className="font-display text-4xl mb-4">Tu carrito está vacío</h1>
          <p className="text-sm text-charcoal mb-2 max-w-sm mx-auto">
            Aquí van a aparecer los regalos que elijas mientras decides qué decirle a alguien.
          </p>
          <p className="text-xs text-beige mb-10 max-w-sm mx-auto">
            Nada se compra todavía: agregar un producto no es un pedido. Eso pasa hasta el final,
            cuando escribas la tarjeta y confirmes.
          </p>
          <Link
            href="/catalogo"
            className="inline-block bg-gold-strong text-white text-xs tracking-[0.2em] uppercase px-8 py-4 rounded-full hover:bg-gold transition-colors"
          >
            Ver catálogo
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-24 pb-20 px-5 bg-cream min-h-screen">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display text-4xl md:text-5xl text-center mb-10">Tu carrito</h1>

        <div className="space-y-4 mb-8">
          {cart.draft.items.map(function (item) {
            return (
              <div key={item.product_id + '|' + (item.variant_name || '')} className="flex gap-4 bg-white/60 rounded-sm p-4">
                <div className="relative w-20 h-20 shrink-0 rounded-sm overflow-hidden bg-beige-light">
                  {item.image ? (
                    <Image src={optimizeImage(item.image, 160)} alt={item.name} fill className="object-cover" sizes="80px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-display text-2xl text-gold/40">E</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-black truncate">{item.name}</p>
                  {item.variant_name ? <p className="text-xs text-charcoal">{item.variant_name}</p> : null}
                  <p className="text-xs text-gold-strong mt-1">{fmtPrice(item.unit_price)} c/u</p>
                  <div className="flex items-center gap-3 mt-2">
                    <button
                      type="button"
                      aria-label="Quitar uno"
                      onClick={function () { cart.setQuantity(item.product_id, item.variant_name, item.quantity - 1) }}
                      className="w-6 h-6 flex items-center justify-center border border-gold/30 rounded-full text-charcoal"
                    >
                      −
                    </button>
                    <span className="text-sm w-4 text-center">{item.quantity}</span>
                    <button
                      type="button"
                      aria-label="Agregar uno"
                      onClick={function () { cart.setQuantity(item.product_id, item.variant_name, item.quantity + 1) }}
                      className="w-6 h-6 flex items-center justify-center border border-gold/30 rounded-full text-charcoal"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={function () { cart.removeLine(item.product_id, item.variant_name) }}
                      className="text-[11px] text-beige hover:text-wine transition-colors ml-2"
                    >
                      Quitar
                    </button>
                  </div>
                </div>
                <div className="text-sm font-medium text-black shrink-0">
                  {fmtPrice(item.unit_price * item.quantity)}
                </div>
              </div>
            )
          })}
        </div>

        <div className="border-t border-gold/20 pt-6 space-y-2 mb-10">
          <div className="flex justify-between text-sm">
            <span className="text-charcoal">Subtotal</span>
            <span className="font-medium">{fmtPrice(cart.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-charcoal">Envío</span>
            <span className="text-beige italic">{SHIPPING_LABEL}</span>
          </div>
        </div>

        <Link
          href="/carrito/tarjeta"
          className="block text-center bg-gold-strong text-white text-xs tracking-[0.2em] uppercase px-8 py-4 rounded-full hover:bg-gold transition-colors"
        >
          Escribir la tarjeta
        </Link>
      </div>
    </div>
  )
}
