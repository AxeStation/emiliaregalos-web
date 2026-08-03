import { type TarjetaData, buildTarjetaLines } from '@/lib/tarjeta'

/**
 * La tarjeta que ve el destinatario. C3 — el destinatario JAMÁS ve un
 * precio: este componente recibe ÚNICAMENTE `TarjetaData` (mensaje,
 * para, de). No tiene prop de precio, total, ni carrito, y no importa
 * `fmtPrice` ni ningún formateador de dinero — no hay forma de que un
 * monto entre a este árbol.
 *
 * `test/tarjeta-sin-precio.test.ts` vigila estructuralmente que esto siga
 * siendo cierto: si algún día alguien agrega un import de precio o una prop
 * de monto acá, el test falla ANTES de que llegue a producción.
 */
export default function TarjetaPreview({ data }: { data: TarjetaData }) {
  var lines = buildTarjetaLines(data)

  return (
    <div className="bg-cream border border-gold/30 rounded-sm p-8 aspect-[4/3] flex flex-col justify-center gap-4 shadow-sm">
      <div className="text-center text-[10px] tracking-[0.3em] uppercase text-gold-strong">
        Emilia · detalles memorables
      </div>
      <div className="text-center space-y-3">
        {lines.map(function (line, i) {
          return (
            <p key={i} className={i === 0 && data.to.trim() ? 'font-display text-lg text-charcoal' : 'font-display text-2xl leading-snug text-black whitespace-pre-wrap'}>
              {line}
            </p>
          )
        })}
      </div>
    </div>
  )
}
