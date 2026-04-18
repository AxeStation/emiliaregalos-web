import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { type Product } from '@/lib/types'
import ProductCard from '@/components/ProductCard'

var LOGO_WHITE = 'https://llpejrdkipyysmxydsnm.supabase.co/storage/v1/object/public/products/emilia/emilia-logo-ivory.png'
var WEB = 'https://llpejrdkipyysmxydsnm.supabase.co/storage/v1/object/public/products/emilia/web/'

var HERO_IMG = WEB + 'tabla-amor.jpg'
var PERSONALIZE_IMG = WEB + 'tabla-carnes-frias.jpg'

var CAT_IMGS: Record<string, string> = {
  'Para Ella': WEB + 'caja-recuerdo.jpg',
  'Para Él': WEB + 'tabla-tequila.jpg',
  'Padrinos': WEB + 'caja-vino-mini.jpg',
  'Bebés': WEB + 'caja-beb.jpg',
  'Empresarial': WEB + 'caja-madera-1.jpg',
  'Aniversarios': WEB + 'tabla-vino.jpg',
}

var INSTA_IMGS = [
  WEB + 'canasta-spa.jpg',
  WEB + 'sin-nombre-caja-rosa.jpg',
  WEB + 'caja-caf.jpg',
  WEB + 'tabla-pampas.jpg',
  WEB + 'orquidea.jpg',
]

async function getProducts(): Promise<Product[]> {
  var { data } = await supabase
    .from('emilia_products')
    .select('id, name, category, base_price, variants, images, is_active, description')
    .eq('is_active', true)
    .order('name')
  return (data || []) as Product[]
}

export var revalidate = 3600

export default async function HomePage() {
  var products = await getProducts()
  var withImages = products.filter(function (p) { return p.images && p.images.length > 0 })
  var featured = withImages.slice(0, 6)

  var CATS = ['Para Ella', 'Para Él', 'Padrinos', 'Bebés', 'Empresarial', 'Aniversarios']

  return (
    <>
      {/* ─── Hero ─── */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <Image src={HERO_IMG} alt="Emilia — detalles memorables" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 text-center px-5">
          <Image src={LOGO_WHITE} alt="Emilia" width={320} height={130} className="mx-auto mb-10 h-20 md:h-28 w-auto brightness-[2]" priority />
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/catalogo" className="bg-white/10 backdrop-blur border border-white/30 text-white text-xs tracking-[0.2em] uppercase px-8 py-3.5 rounded-full hover:bg-white/20 transition-colors">
              Ver catálogo
            </Link>
            <a href="https://wa.me/522222395667?text=Hola!%20Me%20interesa%20ver%20sus%20regalos%20personalizados." target="_blank" rel="noopener noreferrer"
              className="bg-gold-strong text-white text-xs tracking-[0.2em] uppercase px-8 py-3.5 rounded-full hover:bg-gold transition-colors">
              Escríbenos
            </a>
          </div>
        </div>
      </section>

      {/* ─── Categorías ─── */}
      <section id="categorias" className="py-20 px-5 bg-cream">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-4xl md:text-5xl text-center mb-3">Para cada ocasión</h2>
          <p className="text-center text-charcoal text-sm mb-12 max-w-lg mx-auto">
            Regalos que cuentan historias. Encuentra el detalle perfecto para quien más quieres.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {CATS.map(function (cat) {
              var img = CAT_IMGS[cat] || ''
              return (
                <Link key={cat} href={'/catalogo?cat=' + encodeURIComponent(cat)} className="group relative aspect-[4/3] overflow-hidden rounded-sm">
                  {img ? <Image src={img} alt={cat} fill sizes="(max-width:640px) 50vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-110" /> : <div className="w-full h-full bg-beige-light" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <h3 className="font-display text-xl md:text-2xl text-white">{cat}</h3>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── Productos destacados ─── */}
      <section className="py-20 px-5 bg-beige-light">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-4xl md:text-5xl text-center mb-3">Los más pedidos</h2>
          <p className="text-center text-charcoal text-sm mb-12">Favoritos de nuestras clientas.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featured.map(function (p) { return <ProductCard key={p.id} product={p} /> })}
          </div>
          <div className="text-center mt-12">
            <Link href="/catalogo" className="inline-block border border-gold-strong text-gold-strong text-xs tracking-[0.2em] uppercase px-8 py-3.5 rounded-full hover:bg-gold-strong hover:text-white transition-colors">
              Ver todo el catálogo
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Propuesta de valor ─── */}
      <section className="py-20 px-5 bg-black text-cream">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
          {[
            { icon: '✦', title: 'Hecho a mano', desc: 'Cada regalo armado con dedicación' },
            { icon: '♡', title: 'Personalizable', desc: 'Tu nombre, tu mensaje, tu diseño' },
            { icon: '◇', title: 'Calidad premium', desc: 'Materiales selectos y duraderos' },
            { icon: '↗', title: 'Envíos a todo México', desc: 'De Puebla para el mundo' },
          ].map(function (v) {
            return (
              <div key={v.title}>
                <span className="text-3xl text-gold-strong block mb-3">{v.icon}</span>
                <h3 className="font-display text-lg mb-1">{v.title}</h3>
                <p className="text-xs text-cream/60">{v.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* ─── Personalización ─── */}
      <section id="personaliza" className="py-20 px-5 bg-cream">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-square rounded-sm overflow-hidden">
            <Image src={PERSONALIZE_IMG} alt="Personalización" fill className="object-cover" />
          </div>
          <div>
            <h2 className="font-display text-4xl md:text-5xl mb-4">Tu toque personal</h2>
            <p className="text-charcoal text-sm mb-6 leading-relaxed">
              Cada regalo puede llevar el sello de quien lo da. Grabamos nombres, fechas, logotipos y mensajes especiales.
            </p>
            <ul className="space-y-3 text-sm text-charcoal mb-8">
              {['Grabado láser en tablas y cajas', 'Etiquetas personalizadas para vinos', 'Tarjetas con mensaje dedicado', 'Packaging con tu logo empresarial'].map(function (item) {
                return <li key={item} className="flex items-center gap-3"><span className="text-gold-strong">✦</span> {item}</li>
              })}
            </ul>
            <a href="https://wa.me/522222395667?text=Hola!%20Me%20interesa%20personalizar%20un%20regalo." target="_blank" rel="noopener noreferrer"
              className="inline-block bg-gold-strong text-white text-xs tracking-[0.2em] uppercase px-8 py-3.5 rounded-full hover:bg-gold transition-colors">
              Personalizar mi regalo
            </a>
          </div>
        </div>
      </section>

      {/* ─── Empresarial ─── */}
      <section id="empresarial" className="py-20 px-5 bg-beige-light">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-4xl md:text-5xl mb-4">Regalos corporativos</h2>
          <p className="text-charcoal text-sm mb-4 max-w-xl mx-auto leading-relaxed">
            Cotizamos pedidos de 10 a 500 piezas con tu logo y diseño personalizado.
          </p>
          <p className="text-xs text-beige mb-8">Cotizaciones de $3,000 a $150,000+</p>
          <a href="https://wa.me/522222395667?text=Hola!%20Me%20interesa%20una%20cotización%20de%20regalos%20corporativos." target="_blank" rel="noopener noreferrer"
            className="inline-block bg-gold-strong text-white text-xs tracking-[0.2em] uppercase px-8 py-3.5 rounded-full hover:bg-gold transition-colors">
            Solicitar cotización
          </a>
        </div>
      </section>

      {/* ─── Instagram ─── */}
      <section className="py-20 px-5 bg-cream">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="font-display text-3xl mb-2">@emilia__mx_</h2>
          <p className="text-charcoal text-sm mb-8">Síguenos para inspirarte</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {INSTA_IMGS.map(function (img, i) {
              return (
                <a key={i} href="https://instagram.com/emilia__mx_" target="_blank" rel="noopener noreferrer" className="relative aspect-square overflow-hidden group">
                  <Image src={img} alt={'Emilia ' + (i + 1)} fill sizes="(max-width:640px) 50vw, 20vw" className="object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                </a>
              )
            })}
          </div>
          <a href="https://instagram.com/emilia__mx_" target="_blank" rel="noopener noreferrer" className="inline-block mt-8 text-sm text-gold-strong hover:text-gold transition-colors tracking-wider uppercase">
            Seguir en Instagram →
          </a>
        </div>
      </section>
    </>
  )
}
