/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'llpejrdkipyysmxydsnm.supabase.co',
        pathname: '/storage/v1/**',
      },
    ],
  },

  // ── Enlaces viejos de productos renombrados ──────────────────────────
  //
  // La dirección de una ficha NO está guardada: se CALCULA del nombre en cada
  // request (`productSlug(p.name)` en src/lib/types.ts, y la ficha resuelve
  // con `products.find(p => productSlug(p.name) === params.slug)`). O sea que
  // renombrar un producto le cambia la URL y deja la anterior en 404, sin que
  // nada avise.
  //
  // El 29-jul-2026 se renombraron dos productos del catálogo (decisión de Ana):
  //     Caja Padrinos 1  →  Caja Padrinos
  //     Caja Padrinos 2  →  Caja Mini Padrinos
  // Cualquier enlace que ella hubiera compartido por WhatsApp apuntando a los
  // nombres viejos quedó muerto. Estos desvíos lo reparan.
  //
  // ⚠️ ESTO ES EL PARCHE, NO EL ARREGLO. Mientras la URL salga del nombre,
  // cada renombre futuro rompe enlaces y depende de que alguien se acuerde de
  // agregar acá una línea más. El arreglo es guardar el slug en una columna,
  // generarlo UNA vez al crear el producto y congelarlo — así renombrar deja
  // de tocar la dirección. Estimado ~4 h, anotado en el handoff.
  //
  // `permanent: true` (308) porque el producto no va a volver a llamarse como
  // antes: le dice al navegador y a Google que la mudanza es definitiva.
  async redirects() {
    return [
      {
        source: '/catalogo/caja-padrinos-1',
        destination: '/catalogo/caja-padrinos',
        permanent: true,
      },
      {
        source: '/catalogo/caja-padrinos-2',
        destination: '/catalogo/caja-mini-padrinos',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
