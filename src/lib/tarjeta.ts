/**
 * La tarjeta — C2 del carril: "¿qué le quieres decir?" es el momento de la
 * compra, no un campo opcional.
 *
 * `TarjetaData` es la firma completa de lo que la tarjeta puede mostrar.
 * A propósito NO tiene precio, subtotal, total ni ningún campo del carrito
 * — eso es lo que hace que C3 (comprador ≠ destinatario, el destinatario
 * jamás ve un precio) sea imposible de romper por accidente: no hay forma
 * de que un monto entre acá sin cambiar este tipo primero, y cambiar este
 * tipo es exactamente lo que test/tarjeta-sin-precio.test.ts vigila.
 */

export type TarjetaData = {
  message: string
  to: string
  from: string
}

/**
 * Arma las líneas de texto de la tarjeta / vista del destinatario.
 * Se usa TANTO en la vista previa en vivo (mientras el comprador escribe,
 * antes de que exista un nombre de destinatario) COMO en la revisión final.
 * Placeholders honestos (C5): sin destinatario ni remitente, no se inventa
 * nada — la línea simplemente no aparece.
 */
export function buildTarjetaLines(data: TarjetaData): string[] {
  var lines: string[] = []
  var to = (data.to || '').trim()
  var from = (data.from || '').trim()
  var message = (data.message || '').trim()

  if (to) lines.push('Para ' + to)
  lines.push(message || 'Escribe aquí lo que le quieres decir…')
  if (from) lines.push('— ' + from)

  return lines
}
