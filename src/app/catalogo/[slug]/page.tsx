import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { type Product, fmtPrice, productSlug, optimizeImage, waProductUrl } from '@/lib/types'
import ProductCard from '@/components/ProductCard'
import type { Metadata } from 'next'

async function getAllProducts(): Promise<Product[]> {
  var { data } = await supabase.from('emilia_products').select('*').eq('is_active', true).order('name')
  return (data || []) as Product[]
}

export var revalidate = 3600

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  var products = await getAllProducts()
  var product = products.find(function (p) { return productSlug(p.name) === params.slug })
  if (!product) return { title: 'Producto no encontrado' }
  return {
    title: product.name + ' — Emilia Regalos',
    description: product.description || 'Regalo personalizado de Emilia — ' + product.name,
  }
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  var products = await getAllProducts()
  var product = products.find(function (p) { return productSlug(p.name) === params.slug })

  if (!product) notFound()

  var images = product.images || []
  var variants = Array.isArray(product.variants) ? product.variants : []
  var related = products
    .filter(function (p) { return p.category === product!.category && p.id !== product!.id && p.images && p.images.length > 0 })
    .slice(0, 3)

  return (
    <div className="pt-24 pb-20 px-5 bg-cream min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <div className="text-xs text-beige tracking-wider uppercase mb-8">
          <Link href="/catalogo" className="hover:text-gold-strong transition-colors">Catálogo</Link>
          <span className="mx-2">/</span>
          <span className="text-charcoal">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            {images[0] ? (
              <div className="relative aspect-[3/4] rounded-sm overflow-hidden mb-3">
                <Image src={optimizeImage(images[0], 900)} alt={product.name} fill className="object-cover object-[center_15%]" priority sizes="(max-width:768px) 100vw, 50vw" />
              </div>
            ) : null}
            {images.length > 1 ? (
              <div className="grid grid-cols-4 gap-2">
                {images.slice(1, 5).map(function (img, i) {
                  return (
                    <div key={i} className="relative aspect-square rounded-sm overflow-hidden">
                      <Image src={optimizeImage(img, 300)} alt={product!.name + ' ' + (i + 2)} fill className="object-cover" sizes="25vw" />
                    </div>
                  )
                })}
              </div>
            ) : null}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            {product.category ? (
              <span className="text-[10px] tracking-[0.2em] uppercase text-beige mb-2">{product.category}</span>
            ) : null}
            <h1 className="font-display text-4xl md:text-5xl mb-4 leading-tight">{product.name}</h1>

            {variants.length > 0 ? (
              <div className="space-y-2 mb-6">
                {variants.map(function (v, i) {
                  return (
                    <div key={i} className="flex justify-between items-center bg-beige-light rounded-sm px-4 py-3">
                      <span className="text-sm">{v.name || v.label || 'Variante'}</span>
                      <span className="text-sm font-medium text-gold-strong">{fmtPrice(v.price)}</span>
                    </div>
                  )
                })}
              </div>
            ) : product.base_price ? (
              <p className="text-2xl text-gold-strong font-display mb-6">{fmtPrice(product.base_price)}</p>
            ) : null}

            {product.description ? (
              <p className="text-sm text-charcoal leading-relaxed mb-8">{product.description}</p>
            ) : null}

            <div className="space-y-3 mt-auto">
              <a
                href={waProductUrl(product)}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center bg-gold-strong text-white text-xs tracking-[0.2em] uppercase px-8 py-4 rounded-full hover:bg-gold transition-colors"
              >
                Pedir por WhatsApp
              </a>
              <a
                href="https://wa.me/522225011994?text=Hola!%20Me%20interesa%20una%20cotización%20corporativa."
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center border border-gold/30 text-charcoal text-xs tracking-[0.2em] uppercase px-8 py-4 rounded-full hover:border-gold-strong hover:text-gold-strong transition-colors"
              >
                Solicitar cotización
              </a>
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 ? (
          <div className="mt-20">
            <h2 className="font-display text-3xl text-center mb-8">También te puede gustar</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {related.map(function (p) { return <ProductCard key={p.id} product={p} /> })}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
