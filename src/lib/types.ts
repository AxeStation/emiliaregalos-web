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

export var CATEGORIES = [
  'Para Ella', 'Para Él', 'Padrinos', 'Bebés',
  'Aniversarios', 'Eventos Sociales', 'Empresarial', 'Detalles',
] as const

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
