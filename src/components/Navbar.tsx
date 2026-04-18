'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

var LOGO = 'https://llpejrdkipyysmxydsnm.supabase.co/storage/v1/object/public/products/emilia/emilia_logo_optimized.png'

var LINKS = [
  { href: '/catalogo', label: 'Catálogo' },
  { href: '/#categorias', label: 'Ocasiones' },
  { href: '/#personaliza', label: 'Personaliza' },
  { href: '/#empresarial', label: 'Empresarial' },
  { href: '/nosotros', label: 'Nosotros' },
]

export default function Navbar() {
  var [open, setOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-cream/90 border-b border-gold/20">
      <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
        <Link href="/" className="shrink-0" onClick={function () { setOpen(false) }}>
          <Image src={LOGO} alt="Emilia" width={160} height={64} className="h-11 md:h-12 w-auto" priority />
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {LINKS.map(function (l) {
            return (
              <Link key={l.href} href={l.href} className="text-xs tracking-widest uppercase text-charcoal hover:text-gold-strong transition-colors">
                {l.label}
              </Link>
            )
          })}
          <a
            href="https://wa.me/522225011994"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-gold-strong text-white text-xs tracking-wider uppercase px-5 py-2.5 rounded-full hover:bg-gold transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M12 4a8 8 0 00-6.93 12l-1 3.6 3.7-1A8 8 0 1012 4zm4.6 11.1c-.2.5-1 1-1.4 1-.4 0-.7.1-2.2-.5-1.8-.7-3-2.6-3.1-2.7-.1-.1-.9-1.2-.9-2.3s.6-1.6.8-1.8c.2-.2.4-.3.6-.3h.4c.2 0 .4 0 .5.4l.7 1.7c.1.2 0 .4-.1.5l-.3.4c-.1.1-.2.3-.1.5.2.3.7 1 1.4 1.6.8.7 1.5.9 1.8 1 .2.1.4 0 .5-.1l.5-.6c.1-.2.3-.2.5-.1l1.6.8c.2.1.3.2.3.4 0 .2-.1.6-.3 1.1z"/></svg>
            WhatsApp
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={function () { setOpen(!open) }}
          className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5"
          aria-label="Menú"
        >
          <span className={'block w-6 h-0.5 bg-charcoal transition-all ' + (open ? 'rotate-45 translate-y-2' : '')} />
          <span className={'block w-6 h-0.5 bg-charcoal transition-all ' + (open ? 'opacity-0' : '')} />
          <span className={'block w-6 h-0.5 bg-charcoal transition-all ' + (open ? '-rotate-45 -translate-y-2' : '')} />
        </button>
      </div>

      {/* Mobile menu */}
      {open ? (
        <div className="md:hidden bg-cream border-t border-gold/10 px-5 pb-6 pt-4 space-y-4 animate-in slide-in-from-top">
          {LINKS.map(function (l) {
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={function () { setOpen(false) }}
                className="block text-sm tracking-wider uppercase text-charcoal hover:text-gold-strong transition-colors"
              >
                {l.label}
              </Link>
            )
          })}
          <a
            href="https://wa.me/522225011994"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center bg-gold-strong text-white text-sm tracking-wider uppercase px-5 py-3 rounded-full"
          >
            WhatsApp
          </a>
        </div>
      ) : null}
    </nav>
  )
}
