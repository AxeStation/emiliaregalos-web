'use client'

import { useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { type Product, CATEGORIES } from '@/lib/types'
import ProductCard from '@/components/ProductCard'

export default function CatalogFilters({ products }: { products: Product[] }) {
  var params = useSearchParams()
  var initialCat = params.get('cat') || 'Todas'
  var [category, setCategory] = useState(initialCat)
  var [search, setSearch] = useState('')

  var filtered = useMemo(function () {
    var result = products
    if (category !== 'Todas') {
      result = result.filter(function (p) { return p.category === category })
    }
    if (search.trim()) {
      var q = search.trim().toLowerCase()
      result = result.filter(function (p) { return p.name.toLowerCase().includes(q) })
    }
    return result
  }, [products, category, search])

  var cats = ['Todas'].concat(CATEGORIES as unknown as string[])

  return (
    <>
      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={function (e) { setSearch(e.target.value) }}
          placeholder="Buscar por nombre..."
          className="w-full max-w-md mx-auto block bg-white border border-gold/20 rounded-full px-6 py-3 text-sm text-black placeholder:text-beige outline-none focus:border-gold-strong transition-colors"
        />
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap justify-center gap-2 mb-12">
        {cats.map(function (c) {
          var active = c === category
          return (
            <button
              key={c}
              onClick={function () { setCategory(c) }}
              className={'text-xs tracking-[0.15em] uppercase px-5 py-2.5 rounded-full border transition-colors '
                + (active
                  ? 'bg-gold-strong text-white border-gold-strong'
                  : 'bg-transparent text-charcoal border-gold/30 hover:border-gold-strong hover:text-gold-strong')}
            >
              {c}
            </button>
          )
        })}
      </div>

      {/* Count */}
      <p className="text-xs text-beige tracking-widest uppercase text-center mb-8">
        {filtered.length} producto{filtered.length === 1 ? '' : 's'}
        {category !== 'Todas' ? ' · ' + category : ''}
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-display text-2xl text-charcoal mb-2">Sin resultados</p>
          <p className="text-sm text-beige">Intenta con otra categoría o busca por nombre.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map(function (p) {
            return <ProductCard key={p.id} product={p} />
          })}
        </div>
      )}
    </>
  )
}
