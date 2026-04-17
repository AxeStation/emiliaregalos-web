import Image from 'next/image'
import Link from 'next/link'
import { type Product, fmtPrice, productSlug, optimizeImage } from '@/lib/types'

export default function ProductCard({ product }: { product: Product }) {
  var img = product.images && product.images.length > 0 ? product.images[0] : null
  var slug = productSlug(product.name)
  var variants = Array.isArray(product.variants) ? product.variants : []
  var priceText = variants.length > 0
    ? 'Desde ' + fmtPrice(Math.min(...variants.map(function (v) { return v.price })))
    : fmtPrice(product.base_price)

  return (
    <Link href={'/catalogo/' + slug} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-sm bg-beige-light mb-3">
        {img ? (
          <Image
            src={optimizeImage(img, 600)}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-display text-4xl text-gold/40">
            E
          </div>
        )}
        {product.category ? (
          <span className="absolute top-3 left-3 bg-cream/90 backdrop-blur-sm text-[10px] tracking-widest uppercase text-charcoal px-3 py-1">
            {product.category}
          </span>
        ) : null}
      </div>
      <h3 className="font-display text-lg leading-tight text-black mb-1">
        {product.name}
      </h3>
      <p className="text-sm text-gold-strong font-medium">
        {priceText}
      </p>
    </Link>
  )
}
