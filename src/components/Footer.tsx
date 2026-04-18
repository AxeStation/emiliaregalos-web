import Image from 'next/image'
import Link from 'next/link'

var LOGO_WHITE = 'https://llpejrdkipyysmxydsnm.supabase.co/storage/v1/object/public/products/emilia/emilia-logo-blanco.png'

export default function Footer() {
  return (
    <footer className="bg-black text-cream/80">
      <div className="max-w-7xl mx-auto px-5 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Image src={LOGO_WHITE} alt="Emilia" width={240} height={96} className="w-[180px] h-auto opacity-90 mb-4" />
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
              <a href="https://wa.me/522225011994" className="flex items-center gap-2 hover:text-gold transition-colors">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M12 4a8 8 0 00-6.93 12l-1 3.6 3.7-1A8 8 0 1012 4z"/></svg>
                222 501 1994
              </a>
              <a href="https://instagram.com/emilia__mx_" className="flex items-center gap-2 hover:text-gold transition-colors">
                @emilia__mx_
              </a>
              <a href="https://www.facebook.com/profile.php?id=61567623254017" className="flex items-center gap-2 hover:text-gold transition-colors">
                emilia.mx
              </a>
              <a href="mailto:emilia.regalos.mx@gmail.com" className="flex items-center gap-2 hover:text-gold transition-colors">
                emilia.regalos.mx@gmail.com
              </a>
              <p className="text-cream/30 pt-2">Puebla, México</p>
            </div>
          </div>
        </div>

        <div className="border-t border-cream/10 pt-6 text-center space-y-4">
          <p className="text-xs text-cream/30">&copy; 2026 Emilia — detalles memorables</p>
          <div className="w-12 h-px bg-gold-strong/30 mx-auto" />
          <p className="text-xs">
            <span className="text-cream/30">Potenciado por </span>
            <a href="https://synxia.com.mx" target="_blank" rel="noopener noreferrer" className="text-gold-strong font-semibold hover:brightness-125 hover:underline underline-offset-2 decoration-gold-strong/40 transition-all">Synxia</a>
          </p>
        </div>
      </div>
    </footer>
  )
}
