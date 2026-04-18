import type { Metadata } from 'next'

export var metadata: Metadata = {
  title: 'Nosotros — Emilia Regalos',
  description: 'Conoce la historia detrás de Emilia, regalos personalizados hechos a mano en Puebla.',
}

export default function NosotrosPage() {
  return (
    <div className="pt-24 pb-20 bg-cream min-h-screen">
      <div className="max-w-3xl mx-auto px-5">
        <h1 className="font-display text-5xl md:text-6xl text-center mb-6">Nuestra historia</h1>
        <p className="text-center text-charcoal text-sm mb-16 max-w-lg mx-auto">
          Detrás de cada caja hay una persona que cuida cada detalle.
        </p>

        <div className="space-y-8 text-sm text-charcoal leading-relaxed">
          <p>
            Emilia nació de la convicción de que un regalo puede ser mucho más que un objeto.
            Puede ser un momento, una sorpresa, una declaración de cariño que se recuerda para siempre.
          </p>
          <p>
            Desde Puebla, Ana Ventura selecciona a mano cada material — maderas de parota, vinos,
            velas aromáticas, textiles suaves — y los combina en cajas y tablas que cuentan historias.
          </p>
          <p>
            Lo que empezó como regalos para amigas y familia creció hasta convertirse en un proyecto
            que ha entregado más de 200 cajas para bodas, bautizos, eventos corporativos, Navidad,
            San Valentín y todas las ocasiones donde un detalle memorable hace la diferencia.
          </p>

          <div className="bg-beige-light rounded-sm p-8 text-center my-12">
            <span className="text-3xl text-gold-strong block mb-4">✦</span>
            <p className="font-display text-2xl mb-2">Cada regalo es único</p>
            <p className="text-xs text-beige">
              Cada caja se arma según la ocasión,
              el presupuesto y los gustos de quien la recibe.
            </p>
          </div>

          <h2 className="font-display text-3xl pt-4">Nuestros valores</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { title: 'Calidad en cada detalle', desc: 'Seleccionamos los mejores materiales para que cada regalo se vea y se sienta premium.' },
              { title: 'Materiales reales', desc: 'Maderas, telas y productos que se ven y se sienten premium.' },
              { title: 'Atención dedicada', desc: 'Cada pedido recibe la atención que merece. Tu regalo es nuestra prioridad.' },
              { title: 'Puebla, siempre', desc: 'Apoyamos productores y artesanos locales siempre que es posible.' },
            ].map(function (v) {
              return (
                <div key={v.title} className="border-l-2 border-gold-strong pl-4">
                  <h3 className="font-display text-lg mb-1">{v.title}</h3>
                  <p className="text-xs text-charcoal">{v.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
