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

      // Link corto emiliaregalos.mx/whatsapp → WhatsApp de Emilia con el texto
      // exacto del auto-catálogo ("Hola, quiero el catálogo"). Ruta aprobada por
      // Julu el 9-nov-2026. NO es /catalogo: esa es la página del catálogo del
      // sitio y no se toca. Temporal (302) para poder cambiar el destino sin
      // que navegadores/Google lo memoricen. OJO: `permanent: false` solo da
      // 307 en Next 14; el `statusCode: 302` explícito es el que manda.
      // /whatsapp/ con barra final llega aquí por el 308 de diagonal final que
      // Next aplica a todo el sitio. Guardado por test/link-whatsapp.test.ts.
      {
        source: '/whatsapp',
        destination: 'https://wa.me/522225011994?text=Hola%2C%20quiero%20el%20cat%C3%A1logo',
        permanent: false,
        statusCode: 302,
      },
    ];
  },

  // Página suelta /propuesta-design/ (HTML estático en public/, sin liga desde
  // el sitio). Next no sirve index.html de una carpeta de public/: sin esto,
  // /propuesta-design/ hace 308 a /propuesta-design y ahí da 404. La diagonal
  // final sigue redirigiendo (308) como en todo el sitio; no se apaga eso
  // globalmente por una sola página.
  async rewrites() {
    return {
      beforeFiles: [
        { source: '/propuesta-design', destination: '/propuesta-design/index.html' },
      ],
    };
  },
};

export default nextConfig;
