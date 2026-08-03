'use client'

import Link from 'next/link'
import { useCart } from '@/context/CartContext'

export default function CartButton({ className }: { className?: string }) {
  var cart = useCart()

  return (
    <Link
      href="/carrito"
      aria-label="Carrito"
      className={'relative flex items-center justify-center w-10 h-10 ' + (className || '')}
    >
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-charcoal stroke-[1.5]">
        <path d="M6 6h15l-1.5 9h-12z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 6L4.5 3H2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9.5" cy="19.5" r="1.4" fill="currentColor" stroke="none" />
        <circle cx="17.5" cy="19.5" r="1.4" fill="currentColor" stroke="none" />
      </svg>
      {cart.ready && cart.count > 0 ? (
        <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-gold-strong text-white text-[10px] leading-4 text-center">
          {cart.count}
        </span>
      ) : null}
    </Link>
  )
}
