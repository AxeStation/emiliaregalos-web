import type { Metadata } from 'next'
import { Cormorant_Garamond, Poppins } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import WhatsAppButton from '@/components/WhatsAppButton'

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
  return (
    <html lang="es" className={display.variable + ' ' + body.variable}>
      <body className="font-body bg-cream text-black antialiased">
        <Navbar />
        <main>{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  )
}
