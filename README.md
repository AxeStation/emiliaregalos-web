This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Medición para Google Ads (variables de entorno públicas)

Todas opcionales — sin ellas el sitio funciona exactamente igual (los
enlaces de WhatsApp/llamada navegan normal) y no se manda nada a Google.
Ver `src/lib/gtag.ts` y `src/lib/conversions.ts` para el porqué fail-closed.

- `NEXT_PUBLIC_GADS_ID` — ID de la etiqueta de Google (gtag.js), formato
  `AW-XXXXXXXXXX`. Sin ella, NINGÚN script se carga (ni petición a
  googletagmanager.com).
- `NEXT_PUBLIC_GADS_CONV_WHATSAPP` — etiqueta de conversión para clics en
  enlaces de WhatsApp, formato `AW-XXXX/YYYY`.
- `NEXT_PUBLIC_GADS_CONV_LLAMADA` — etiqueta de conversión para clics en
  enlaces `tel:`, mismo formato.

## Código de referencia en WhatsApp (leads con origen)

PR 2 pieza A del encargo "Leads con origen" (oct-2026). Ver
`docs/leads-origen/DISENO.md` en el repo `synxia-brain` para el diseño
completo (piezas A/B/D) y el contrato con el endpoint.

- `NEXT_PUBLIC_LEADS_API_URL` — base del brain (**sin barra final**), ej.
  `https://axe.synxia.com.mx`. Opcional y FAIL-CLOSED: **sin esta variable el
  sitio se comporta exactamente como hoy** — ningún `preventDefault`, ningún
  `fetch`, el clic en WhatsApp navega igual que siempre. Con ella puesta,
  `src/components/ClickTracker.tsx` pide un código corto a
  `POST {NEXT_PUBLIC_LEADS_API_URL}/leads/ref` (timeout 1.5s) y lo agrega al
  final del texto prellenado: `"... (ref. EM-4K7Q)"`. Si el brain no
  responde a tiempo o responde distinto de `201`, el enlace se abre sin
  código — el clic nunca se bloquea.
- Captura de atribución (`src/lib/leadsRef.ts`): al cargar cualquier página
  se guardan `gclid`/`wbraid`/`gbraid`/`utm_*` de la URL en `sessionStorage`
  (independiente de `NEXT_PUBLIC_LEADS_API_URL` — esto siempre corre, lo que
  cambia con la variable es si se usa para pedir un código).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
