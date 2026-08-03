'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { type Product, fmtPrice } from '@/lib/types'
import { useCart } from '@/context/CartContext'

export default function AddToCart({ product }: { product: Product }) {
  var router = useRouter()
  var variants = Array.isArray(product.variants) ? product.variants : []
  var [variantIdx, setVariantIdx] = useState(0)
  var [added, setAdded] = useState(false)

  var unitPrice = variants.length > 0
    ? Number(variants[variantIdx].price)
    : Number(product.base_price || 0)
  var variantName = variants.length > 0 ? (variants[variantIdx].name || variants[variantIdx].label || null) : null
  var image = product.images && product.images.length > 0 ? product.images[0] : null

  var cart = useCart()

  function handleAdd() {
    cart.addItem({
      product_id: product.id,
      name: product.name,
      variant_name: variantName,
      unit_price: unitPrice,
      quantity: 1,
      image: image,
    })
    setAdded(true)
    setTimeout(function () { setAdded(false) }, 2000)
  }

  return (
    <div className="space-y-3">
      {variants.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {variants.map(function (v, i) {
            var active = i === variantIdx
            return (
              <button
                key={i}
                type="button"
                onClick={function () { setVariantIdx(i) }}
                className={'text-xs px-4 py-2 rounded-full border transition-colors '
                  + (active ? 'bg-gold-strong text-white border-gold-strong' : 'bg-transparent text-charcoal border-gold/30 hover:border-gold-strong')}
              >
                {(v.name || v.label || 'Variante') + ' · ' + fmtPrice(v.price)}
              </button>
            )
          })}
        </div>
      ) : null}

      <button
        type="button"
        onClick={handleAdd}
        className="w-full text-center bg-black text-white text-xs tracking-[0.2em] uppercase px-8 py-4 rounded-full hover:bg-charcoal transition-colors"
      >
        {added ? 'Agregado' : 'Agregar al carrito'}
      </button>

      {added ? (
        <button
          type="button"
          onClick={function () { router.push('/carrito') }}
          className="w-full text-center text-xs tracking-[0.15em] uppercase text-gold-strong hover:text-gold transition-colors"
        >
          Ver carrito →
        </button>
      ) : null}
    </div>
  )
}
