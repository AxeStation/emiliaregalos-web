/**
 * Mensajes prellenados de WhatsApp — centralizados.
 *
 * Encargo "Medición para Ads" (oct-2026). Antes de esto, header, menú móvil
 * y el botón flotante global apuntaban a `https://wa.me/522225011994` SIN
 * `?text=` — un enlace "vacío" que abre WhatsApp sin ningún mensaje. Esto
 * les da un mensaje, y centraliza TODOS los textos en un solo lugar para que
 * no queden copiados a mano en cada componente.
 *
 * EXCEPCIÓN DELIBERADA: la ficha de producto (`src/app/catalogo/[slug]/page.tsx`)
 * NO pasa por acá. Ya tenía su propio mensaje dinámico (`waProductUrl()` en
 * `src/lib/types.ts`, con nombre + precio del producto) y un segundo link fijo
 * de cotización corporativa — el encargo pidió explícitamente mantenerlos tal
 * cual. Están documentados en el PR, no en este módulo.
 *
 * Los textos de abajo son PROPUESTA — Julu los aprueba en el PR. Los que ya
 * existían con un mensaje específico (personalización, empresarial, contacto)
 * se mantienen SIN CAMBIO, sólo centralizados acá palabra por palabra.
 */

import { WA_NUMBER } from './types.ts'

export type ContextoWhatsApp =
  | 'header'          // src/components/Navbar.tsx — botón desktop Y enlace del menú móvil (mismo texto, dos sitios de render)
  | 'footer'          // src/components/Footer.tsx — enlace de WhatsApp en "Contacto"
  | 'flotante'         // src/components/WhatsAppButton.tsx — burbuja global, default (páginas que no son inicio ni catálogo)
  | 'flotanteInicio'   // src/components/WhatsAppButton.tsx — burbuja global cuando pathname === '/'
  | 'flotanteCatalogo' // src/components/WhatsAppButton.tsx — burbuja global cuando pathname empieza con '/catalogo'
  | 'inicioHero'       // src/app/page.tsx — botón "Escríbenos" del hero. CAMBIA el texto anterior ("Hola! Me interesa ver sus regalos personalizados.") — propuesta, ver PR
  | 'inicioPersonaliza'// src/app/page.tsx — sección "Tu toque personal". Texto SIN CAMBIO
  | 'inicioEmpresarial'// src/app/page.tsx — sección "Regalos corporativos". Texto SIN CAMBIO
  | 'contacto'         // src/app/contacto/page.tsx — tarjeta de WhatsApp. Texto SIN CAMBIO

var MENSAJES: Record<ContextoWhatsApp, string> = {
  header: 'Hola, vi su página y quiero información sobre regalos corporativos',
  footer: 'Hola, me gustaría cotizar un regalo',
  flotante: 'Hola, me gustaría cotizar un regalo',
  flotanteInicio: 'Hola, quiero cotizar regalos personalizados',
  flotanteCatalogo: 'Hola, estoy viendo su catálogo y me interesa cotizar',
  inicioHero: 'Hola, quiero cotizar regalos personalizados',
  // SIN CAMBIO — ya existía en src/app/page.tsx antes de este PR.
  inicioPersonaliza: 'Hola! Me interesa personalizar un regalo.',
  // SIN CAMBIO — ya existía en src/app/page.tsx antes de este PR.
  inicioEmpresarial: 'Hola! Me interesa una cotización de regalos corporativos.',
  // SIN CAMBIO — ya existía en src/app/contacto/page.tsx antes de este PR.
  contacto: 'Hola! Me interesa cotizar un regalo personalizado.',
}

export function enlaceWhatsApp(contexto: ContextoWhatsApp): string {
  return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(MENSAJES[contexto])
}
