export type Product = {
  id: string
  name: string
  category: string | null
  base_price: number | null
  variants: { name?: string; label?: string; price: number }[] | null
  images: string[] | null
  is_active: boolean
  description: string | null
}

/**
 * ¿Este producto se muestra en el sitio público?
 *
 * ════════════════════════════════════════════════════════════════
 * LA REGLA: sin foto no se publica. Y vive ACÁ, no en una bandera.
 * ════════════════════════════════════════════════════════════════
 * Hasta el 27-jul-2026 el sitio filtraba sólo por `is_active`, y esa columna
 * había quedado significando dos cosas a la vez: "se muestra en el catálogo
 * público" y "Ana puede cotizarlo". Los productos nuevos entraban con
 * is_active=false hasta tener foto — eso protegía al sitio pero le impedía a
 * Ana cotizarlos por WhatsApp, y la foto no le importa a un PDF que ella manda:
 * le importa a la clienta que entra a la web.
 *
 * Se resolvió moviendo la regla al FILTRO en vez de crear otra bandera:
 * `is_active` vuelve a significar UNA sola cosa ("existe y se puede usar") y la
 * publicación se decide acá, donde no hay que acordarse de nada. Una regla en
 * el filtro no se olvida; una bandera sí.
 *
 * De paso arregla que Orquídea y Tabla Tequileros 2 llevaban desde abril
 * publicados SIN foto, mostrándole un cuadro vacío a clientas reales.
 *
 * ⚠️ EL HUECO CONOCIDO, con nombre y apellido
 * La regla es simétrica: tener foto AHORA OBLIGA a publicar. Hoy no hay forma
 * de sacar del sitio un producto con foto sin desactivarlo — y desactivarlo
 * vuelve a bloquear la cotización, que es justo lo que esto vino a arreglar.
 *
 * Ya hay TRES productos esperando esa decisión de Ana (hoja "QUE FALTA" del
 * catálogo oficial): CAJA BOTELLA, CAJA TERMO y TABLA TEQUILEROS 2. Los tres
 * salieron del catálogo PDF pero siguen publicados en el sitio.
 *
 * Si Ana confirma que quiere sacarlos, la salida NO es tirar esto: se agrega
 * una columna `is_published` y la regla pasa a ser `is_published && tieneFoto`.
 * Las dos condiciones sobreviven — por eso esta versión barata no es un parche
 * que haya que deshacer después.
 */
/*
 * ⚠️ LA CONDICIÓN DE LA FOTO SE QUITÓ EL 28-jul-2026. Decisión de Julu.
 *
 * Todo lo de arriba explica por qué se agregó en abril: Orquídea y Tabla
 * Tequileros 2 llevaban meses mostrándole un cuadro vacío a clientas reales.
 * Eso NO se olvidó — cambió el motivo.
 *
 * Entonces el hueco era un accidente que nadie eligió, y la ficha del producto
 * ni siquiera lo manejaba: renderizaba `null` y la columna de la imagen
 * desaparecía, dejando media página en blanco.
 *
 * Ahora es deliberado y temporal: 8 productos activos esperan foto, Ana las va a
 * subir desde su dashboard, y mientras tanto vale más que se vean a que no
 * existan para una clienta que entra a la web. Y el hueco está resuelto en los
 * DOS lugares — ProductCard ya tenía el marcador de marca y la ficha lo tiene
 * desde este mismo cambio.
 *
 * En cuanto Ana suba las fotos esto deja de notarse solo. Si alguna vez vuelve a
 * haber productos sin foto de forma permanente, la discusión se reabre — pero la
 * salida NO es volver a esta condición a ciegas, porque volvería a bloquear la
 * publicación de productos nuevos que Ana sí quiere mostrar.
 */
export function sePublica(p: Product): boolean {
  return p.is_active === true
}

export var CATEGORIES = [
  'Para Ella', 'Para Él', 'Padrinos', 'Bebés',
  'Aniversarios', 'Recuerdos', 'Empresariales', 'Detalles',
] as const

/**
 * Nombres que Ana pidió el 28-jul-2026. La base todavía tiene los viejos, y se
 * renombra por separado — este mapa hace que el orden no importe.
 *
 * PASO DE CONTRAER, para cuando la base ya esté renombrada: borrar este mapa y
 * la llamada a normalizaCategoria() en los dos getProducts(). Mientras el mapa
 * exista, los dos nombres funcionan; cuando ya no queden filas con los viejos,
 * sobra.
 */
var CATEGORIA_RENOMBRADA: Record<string, string> = {
  'Empresarial': 'Empresariales',
  'Eventos Sociales': 'Recuerdos',
}

export function normalizaCategoria<T extends { category: string | null }>(p: T): T {
  var c = p.category
  if (c && CATEGORIA_RENOMBRADA[c]) {
    return Object.assign({}, p, { category: CATEGORIA_RENOMBRADA[c] })
  }
  return p
}

export function fmtPrice(n: number | null | undefined): string {
  if (n == null) return ''
  return '$' + Math.round(n).toLocaleString('es-MX')
}

export function productSlug(name: string): string {
  return name
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function optimizeImage(url: string, width: number): string {
  var marker = '/storage/v1/object/public/'
  var idx = url.indexOf(marker)
  if (idx < 0) return url
  var base = url.slice(0, idx)
  var path = url.slice(idx + marker.length)
  return base + '/storage/v1/render/image/public/' + path + '?width=' + width + '&resize=contain&quality=80'
}

export var WA_NUMBER = '522225011994'
export var WA_URL = 'https://wa.me/' + WA_NUMBER

export function waProductUrl(product: Product): string {
  var price = product.base_price ? fmtPrice(product.base_price) : ''
  var msg = 'Hola! Me interesa ' + product.name + (price ? ' (' + price + ')' : '') + '. ¿Está disponible?'
  return WA_URL + '?text=' + encodeURIComponent(msg)
}
