import type { Metadata } from 'next'

export var metadata: Metadata = {
  title: 'Contacto — Emilia Regalos',
  description: 'Contáctanos por WhatsApp, Instagram o correo. Regalos personalizados en Puebla.',
}

export default function ContactoPage() {
  return (
    <div className="pt-24 pb-20 bg-cream min-h-screen">
      <div className="max-w-2xl mx-auto px-5">
        <h1 className="font-display text-5xl md:text-6xl text-center mb-6">Contacto</h1>
        <p className="text-center text-charcoal text-sm mb-16 max-w-md mx-auto">
          Escríbenos para cotizar tu regalo perfecto. Respondemos en menos de 2 horas.
        </p>

        <div className="space-y-4">
          {/* WhatsApp — primary */}
          <a
            href="https://wa.me/522225011994?text=Hola!%20Me%20interesa%20cotizar%20un%20regalo%20personalizado."
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 bg-[#25D366]/10 border border-[#25D366]/20 rounded-lg p-5 hover:bg-[#25D366]/20 transition-colors"
          >
            <div className="w-12 h-12 bg-[#25D366] rounded-full flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white"><path d="M12 4a8 8 0 00-6.93 12l-1 3.6 3.7-1A8 8 0 1012 4zm4.6 11.1c-.2.5-1 1-1.4 1-.4 0-.7.1-2.2-.5-1.8-.7-3-2.6-3.1-2.7-.1-.1-.9-1.2-.9-2.3s.6-1.6.8-1.8c.2-.2.4-.3.6-.3h.4c.2 0 .4 0 .5.4l.7 1.7c.1.2 0 .4-.1.5l-.3.4c-.1.1-.2.3-.1.5.2.3.7 1 1.4 1.6.8.7 1.5.9 1.8 1 .2.1.4 0 .5-.1l.5-.6c.1-.2.3-.2.5-.1l1.6.8c.2.1.3.2.3.4 0 .2-.1.6-.3 1.1z"/></svg>
            </div>
            <div>
              <p className="font-medium text-sm">WhatsApp</p>
              <p className="text-xs text-charcoal">222 501 1994 — Respuesta inmediata</p>
            </div>
          </a>

          <a href="https://instagram.com/emilia__mx_" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-4 bg-beige-light rounded-lg p-5 hover:bg-gold/10 transition-colors">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-full flex items-center justify-center shrink-0">
              <span className="text-white text-lg">IG</span>
            </div>
            <div>
              <p className="font-medium text-sm">Instagram</p>
              <p className="text-xs text-charcoal">@emilia__mx_</p>
            </div>
          </a>

          <a href="https://www.facebook.com/profile.php?id=61567623254017" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-4 bg-beige-light rounded-lg p-5 hover:bg-gold/10 transition-colors">
            <div className="w-12 h-12 bg-[#1877F2] rounded-full flex items-center justify-center shrink-0">
              <span className="text-white text-lg font-bold">f</span>
            </div>
            <div>
              <p className="font-medium text-sm">Facebook</p>
              <p className="text-xs text-charcoal">emilia.mx</p>
            </div>
          </a>

          <a href="mailto:emilia.regalos.mx@gmail.com"
            className="flex items-center gap-4 bg-beige-light rounded-lg p-5 hover:bg-gold/10 transition-colors">
            <div className="w-12 h-12 bg-gold-strong rounded-full flex items-center justify-center shrink-0">
              <span className="text-white text-lg">@</span>
            </div>
            <div>
              <p className="font-medium text-sm">Correo electrónico</p>
              <p className="text-xs text-charcoal">emilia.regalos.mx@gmail.com</p>
            </div>
          </a>
        </div>

        <div className="mt-12 text-center">
          <p className="text-xs text-beige tracking-wider uppercase">Puebla, México</p>
        </div>
      </div>
    </div>
  )
}
