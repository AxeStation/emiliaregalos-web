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
 * NO pasa por acá para sus DOS botones de WhatsApp propios. Ya tenía su propio
 * mensaje dinámico (`waProductUrl()` en `src/lib/types.ts`, con nombre + precio
 * del producto) y un segundo link fijo de cotización corporativa — el encargo
 * pidió explícitamente mantenerlos tal cual. Están documentados en el PR, no en
 * este módulo. (La burbuja flotante GLOBAL sí la cubre este módulo incluso en
 * la ficha de producto — ver `textoFlotanteCatalogo` más abajo.)
 *
 * Los textos de abajo son PROPUESTA — Julu los aprueba en el PR. Los que ya
 * existían con un mensaje específico (personalización, empresarial, contacto)
 * se mantienen SIN CAMBIO, sólo centralizados acá palabra por palabra.
 */

import { WA_NUMBER, normalizaNombreCategoria } from './types.ts'

export type ContextoWhatsApp =
  | 'header'          // src/components/Navbar.tsx — botón desktop Y enlace del menú móvil (mismo texto, dos sitios de render)
  | 'footer'          // src/components/Footer.tsx — enlace de WhatsApp en "Contacto"
  | 'flotante'         // src/components/WhatsAppButton.tsx — burbuja global, default (páginas que no son inicio ni catálogo)
  | 'flotanteInicio'   // src/components/WhatsAppButton.tsx — burbuja global cuando pathname === '/'
  | 'flotanteCatalogo' // src/components/WhatsAppButton.tsx — burbuja global en /catalogo SIN categoría reconocida (catálogo completo, o ficha de producto — ver textoFlotanteCatalogo)
  | 'inicioHero'       // src/app/page.tsx — botón "Escríbenos" del hero. CAMBIA el texto anterior ("Hola! Me interesa ver sus regalos personalizados.") — propuesta, ver PR
  | 'inicioPersonaliza'// src/app/page.tsx — sección "Tu toque personal". Texto SIN CAMBIO
  | 'inicioEmpresarial'// src/app/page.tsx — sección "Regalos corporativos". Texto SIN CAMBIO
  | 'contacto'         // src/app/contacto/page.tsx — tarjeta de WhatsApp. Texto SIN CAMBIO

var MENSAJES: Record<ContextoWhatsApp, string> = {
  // AJUSTE Julu 22-oct-2026: texto GENERAL, no corporativo — antes decía
  // "...información sobre regalos corporativos". El header/menú móvil los ve
  // TODOS los visitantes, no sólo leads empresariales (ese caso ya tiene su
  // propio contexto 'inicioEmpresarial').
  header: 'Hola, vi su página y quiero cotizar un regalo',
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

/**
 * Burbuja flotante en /catalogo — texto por CATEGORÍA (AJUSTE Julu 22-oct-2026,
 * punto 2). Objetivo: saber qué campaña de Ads trajo a cada cliente cuando el
 * anuncio enlaza a `/catalogo?cat=<categoría>`.
 *
 * MEDIDO en el código al escribir esto (src/lib/types.ts CATEGORIES,
 * src/app/catalogo/CatalogFilters.tsx, src/app/page.tsx sección "Para cada
 * ocasión"): el ÚNICO query param real que filtra el catálogo es `?cat=`, y
 * los ÚNICOS valores que algún link del sitio produce hoy son las 8 entradas
 * de CATEGORIES ('Para Ella', 'Para Él', 'Padrinos', 'Bebés & Niños',
 * 'Aniversarios', 'Recuerdos', 'Empresariales', 'Detalles'). NO existe un
 * query param `?ocasion=` separado en ningún lugar del código — "categoría" y
 * "ocasión" son la MISMA cosa acá, por eso este mapa cubre un solo mecanismo.
 *
 * Los 6 nombres de la sección "Ocasiones" del footer (Bodas, Bautizos, Baby
 * Shower, San Valentín, Navidad, Día de las Madres) se incluyen TAMBIÉN,
 * aunque hoy esos enlaces del footer NO pasan `?cat=` (van a `/catalogo`
 * plano — ver diagnóstico en el PR, punto 4): si el día de mañana se decide
 * enlazarlos con `?cat=`, el texto ya existe y no hay que volver a tocar este
 * archivo. Mientras tanto, nadie llega a estos valores por un link real.
 *
 * 'Detalles' NO estaba en la lista de textos que dio Julu el 22-oct-2026 —
 * es una categoría real (CATEGORIES, chip del catálogo, sección del home) que
 * se quedó fuera de su propuesta. Texto PROPUESTO acá, pendiente de su
 * aprobación igual que el resto — nunca se deja sin texto propio, cae al
 * default si no se aprueba.
 */
export var MAPA_CATEGORIA_FLOTANTE: Record<string, string> = {
  'Empresariales': 'Hola, me interesan sus regalos empresariales',
  'Recuerdos': 'Hola, me interesan sus recuerdos para evento',
  'Aniversarios': 'Hola, me interesa un regalo de aniversario',
  'Padrinos': 'Hola, me interesa un regalo para padrinos',
  'Para Ella': 'Hola, me interesa un regalo para ella',
  'Para Él': 'Hola, me interesa un regalo para él',
  'Bebés & Niños': 'Hola, me interesa un regalo para bebé o niño',
  // PROPUESTA — ver comentario de arriba. No vino en la lista de Julu.
  'Detalles': 'Hola, me interesan sus detalles personalizados',
  // Ocasiones del footer — ver comentario de arriba (hoy sin link real con ?cat=).
  'Bodas': 'Hola, me interesa un regalo de boda',
  'Bautizos': 'Hola, me interesa un regalo de bautizo',
  'Baby Shower': 'Hola, me interesa un regalo de baby shower',
  'San Valentín': 'Hola, me interesa un regalo de San Valentín',
  'Navidad': 'Hola, me interesan sus regalos de Navidad',
  'Día de las Madres': 'Hola, me interesa un regalo para mamá',
}

/**
 * Texto de la burbuja flotante en /catalogo para una categoría dada.
 *
 * Default SEGURO (nunca cadena vacía): sin categoría, o categoría
 * desconocida/no reconocida, cae al texto general del catálogo completo
 * (MENSAJES.flotanteCatalogo) — el mismo que ya existía antes de este ajuste.
 *
 * Pasa por normalizaNombreCategoria() para que un link viejo con el nombre
 * anterior de una categoría (p. ej. `?cat=Bebés`) también encuentre su texto,
 * igual que ya hace CatalogFilters con el filtro mismo.
 */
export function textoFlotanteCatalogo(categoria: string | null | undefined): string {
  if (!categoria) return MENSAJES.flotanteCatalogo
  var normalizada = normalizaNombreCategoria(categoria) || categoria
  return MAPA_CATEGORIA_FLOTANTE[normalizada] || MENSAJES.flotanteCatalogo
}

export function enlaceFlotanteCatalogo(categoria: string | null | undefined): string {
  return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(textoFlotanteCatalogo(categoria))
}
