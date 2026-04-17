import Image from 'next/image'
import Link from 'next/link'

var LOGO = 'https://llpejrdkipyysmxydsnm.supabase.co/storage/v1/object/public/products/emilia/emilia_logo_optimized.png'

export default function Footer() {
  return (
    <footer className="bg-black text-cream/80">
      <div className="max-w-7xl mx-auto px-5 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Image src={LOGO} alt="Emilia" width={140} height={56} className="h-12 w-auto brightness-200 invert opacity-80 mb-4" />
            <p className="text-xs text-cream/50 leading-relaxed">
              Regalos personalizados hechos a mano con amor en Puebla, México.
            </p>
          </div>

          {/* Catálogo */}
          <div>
            <h4 className="font-display text-lg text-cream mb-4">Catálogo</h4>
            <div className="space-y-2">
              {['Para Ella', 'Para Él', 'Padrinos', 'Bebés', 'Empresarial'].map(function (c) {
                return (
                  <Link key={c} href={'/catalogo?cat=' + encodeURIComponent(c)} className="block text-xs text-cream/50 hover:text-gold transition-colors">
                    {c}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Ocasiones */}
          <div>
            <h4 className="font-display text-lg text-cream mb-4">Ocasiones</h4>
            <div className="space-y-2">
              {['Bodas', 'Bautizos', 'Baby Shower', 'San Valentín', 'Navidad', 'Día de las Madres'].map(function (o) {
                return (
                  <Link key={o} href="/catalogo" className="block text-xs text-cream/50 hover:text-gold transition-colors">
                    {o}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="font-display text-lg text-cream mb-4">Contacto</h4>
            <div className="space-y-3 text-xs text-cream/50">
              <a href="https://wa.me/522222395667" className="flex items-center gap-2 hover:text-gold transition-colors">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M12 4a8 8 0 00-6.93 12l-1 3.6 3.7-1A8 8 0 1012 4z"/></svg>
                222 239 5667
              </a>
              <a href="https://instagram.com/emilia__mx_" className="flex items-center gap-2 hover:text-gold transition-colors">
                @emilia__mx_
              </a>
              <a href="https://facebook.com/emilia.mx" className="flex items-center gap-2 hover:text-gold transition-colors">
                emilia.mx
              </a>
              <a href="mailto:emilia.regalos.mx@gmail.com" className="flex items-center gap-2 hover:text-gold transition-colors">
                emilia.regalos.mx@gmail.com
              </a>
              <p className="text-cream/30 pt-2">Puebla, México</p>
            </div>
          </div>
        </div>

        <div className="border-t border-cream/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-cream/30">&copy; 2026 Emilia — detalles memorables</p>
          <p className="text-xs text-cream/20">Potenciado por Synxia</p>
        </div>
      </div>
    </footer>
  )
}
