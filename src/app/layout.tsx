import type { Metadata } from 'next'
import { Cormorant_Garamond, Poppins } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import WhatsAppButton from '@/components/WhatsAppButton'
import ClickTracker from '@/components/ClickTracker'
import { CartProvider } from '@/context/CartContext'
import { gadsId, gtagScriptSrc, gtagInitScript } from '@/lib/gtag'

const display = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-display',
  display: 'swap',
})

const body = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
})

export var metadata: Metadata = {
  title: 'Emilia — Regalos Personalizados en Puebla',
  description: 'Cajas, tablas artesanales y regalos únicos para bodas, bautizos, baby showers, San Valentín, Navidad y más. Hechos a mano con amor en Puebla, México.',
  keywords: 'regalos personalizados, regalos Puebla, cajas regalo, tablas de madera, regalos boda, regalos empresariales',
  openGraph: {
    title: 'Emilia — detalles memorables',
    description: 'Regalos personalizados hechos a mano en Puebla',
    url: 'https://emiliaregalos.mx',
    siteName: 'Emilia',
    locale: 'es_MX',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Encargo "Medición para Ads" (oct-2026): la cuenta de Google Ads TODAVÍA
  // NO EXISTE. gadsId() es FAIL-CLOSED (src/lib/gtag.ts) — sin
  // NEXT_PUBLIC_GADS_ID, gid es undefined y NINGUNO de los dos <Script> se
  // renderiza, así que no sale ninguna petición a googletagmanager.com.
  var gid = gadsId()

  return (
    <html lang="es" className={display.variable + ' ' + body.variable}>
      <body className="font-body bg-cream text-black antialiased">
        {gid ? (
          <>
            <Script src={gtagScriptSrc(gid)} strategy="afterInteractive" />
            <Script id="gtag-init" strategy="afterInteractive">
              {gtagInitScript(gid)}
            </Script>
          </>
        ) : null}
        <CartProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
          <WhatsAppButton />
          {/* Listener delegado único de conversiones (WhatsApp/tel:) — ver
              src/components/ClickTracker.tsx. Se monta siempre; si no hay
              gtag cargado o no hay etiqueta de conversión, no manda nada. */}
          <ClickTracker />
        </CartProvider>
      </body>
    </html>
  )
}
