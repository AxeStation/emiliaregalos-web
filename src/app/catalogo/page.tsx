import { supabase } from '@/lib/supabase'
import { type Product, sePublica } from '@/lib/types'
import { Suspense } from 'react'
import CatalogFilters from './CatalogFilters'
import type { Metadata } from 'next'

export var metadata: Metadata = {
  title: 'Catálogo — Emilia Regalos Personalizados',
  description: 'Explora nuestro catálogo de cajas, tablas artesanales y regalos personalizados para toda ocasión.',
}

export var revalidate = 3600

async function getProducts(): Promise<Product[]> {
  var { data } = await supabase
    .from('emilia_products')
    .select('id, name, category, base_price, variants, images, is_active, description')
    .eq('is_active', true)
    .order('category')
    .order('name')
  // El filtro va ACA y no en el render: `products.length` alimenta el contador
  // "N productos hechos a mano". Si se filtrara mas abajo, el contador diria 63
  // mostrando 58.
  return ((data || []) as Product[]).filter(sePublica)
}

export default async function CatalogoPage() {
  var products = await getProducts()

  return (
    <div className="pt-24 pb-20 px-5 bg-cream min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="font-display text-5xl md:text-6xl text-center mb-3">Catálogo</h1>
        <p className="text-center text-charcoal text-sm mb-12 max-w-lg mx-auto">
          {products.length} productos hechos a mano con amor en Puebla.
        </p>
        <Suspense>
          <CatalogFilters products={products} />
        </Suspense>
      </div>
    </div>
  )
}
