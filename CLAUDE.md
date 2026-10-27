# Emiliaregalos Web — Claude Code Context
## Actualizado: 26 abril 2026

## Qué es este proyecto
Sitio web de **Emilia Regalos** (cliente Synxia, regalos curados, Puebla MX). Next.js 14 con catálogo dinámico desde Supabase. Páginas: home (`/`), `/catalogo` (con filtros), `/nosotros`, `/contacto`. WhatsApp button persistente al número del negocio. Footer linkea a Synxia (atribución).

Comparte fuente de datos con `synxia-brain` Emilia tenant (mismas tablas `emilia_*` Supabase), pero este repo es solo el sitio público de cara al cliente final — la lógica de pedidos / cotizaciones vive en synxia-brain via Emilia bot WhatsApp.

## Arquitectura
- `src/app/page.tsx` + `src/app/layout.tsx` + `src/app/globals.css` — root del App Router.
- `src/app/{nosotros,contacto,catalogo}/page.tsx` — páginas. `/catalogo` tiene `CatalogFilters.tsx` (client component).
- `src/app/fonts/{GeistMonoVF.woff, GeistVF.woff}` — fonts locales.
- `src/components/{Navbar, Footer, ProductCard, WhatsAppButton}.tsx` — UI compartido.
- `src/lib/supabase.ts` — client Supabase server-side (lee con SERVICE_ROLE_KEY).
- `src/lib/types.ts` — tipos TS para productos.
- `next.config.mjs`, `tailwind.config.ts`, `tsconfig.json`, `.eslintrc.json` — config estándar.
- `.env.local` — vars locales (NO commiteado).

Estructura `src/` es deliberada (a diferencia de `singo-landing` que tiene `app/` en raíz) — convención del bootstrap original.

## Secrets vs públicos
- **Secrets** (en `.env.local` server-side, NO en client bundle):
  - `SUPABASE_SERVICE_ROLE_KEY` — JWT que **bypassa RLS**. Se usa en `src/lib/supabase.ts` SOLO en server components / API routes. Si filtra al bundle del cliente, exposición total de la DB.
- **Públicos** (`NEXT_PUBLIC_*` — Next.js los inyecta al cliente):
  - `NEXT_PUBLIC_SUPABASE_URL` — URL del proyecto Supabase (público per Supabase docs).
  - `NEXT_PUBLIC_GADS_ID` — ID de la etiqueta de Google Ads (gtag.js, `AW-XXXXXXXXXX`). Agregada en el PR "Medición para Ads" (oct-2026). **Todas opcionales y FAIL-CLOSED**: sin la variable no se carga ningún script ni sale ninguna petición a `googletagmanager.com`. Ver `src/lib/gtag.ts`.
  - `NEXT_PUBLIC_GADS_CONV_WHATSAPP` / `NEXT_PUBLIC_GADS_CONV_LLAMADA` — etiquetas de conversión (`AW-XXXX/YYYY`) para clics en WhatsApp y `tel:` respectivamente. Ver `src/lib/conversions.ts`. Sin ellas, el clic funciona igual pero no se manda ningún evento — nunca hay una etiqueta inventada de fallback.
  - `NEXT_PUBLIC_LEADS_API_URL` — base del brain para el código de referencia en WhatsApp (encargo "Leads con origen", PR 2 pieza A; ver `docs/leads-origen/DISENO.md` en `synxia-brain`), ej. `https://axe.synxia.com.mx` (**sin barra final**). FAIL-CLOSED: sin ella, `ClickTracker.tsx` no intercepta nada — el clic en WhatsApp navega exactamente igual que hoy. Ver `src/lib/leadsRef.ts`.

Si Code futuro intenta "rotar" `NEXT_PUBLIC_SUPABASE_URL` pensando que es secret — NO. Es público por diseño del prefix `NEXT_PUBLIC_`. La URL no es credencial.

## Cómo se corre / testea / deploya
```bash
# Local
npm install
npm run dev                          # localhost:3000
npm run build && npm run start       # build local (requiere .env.local)
npm run lint

# Deploy
git add -A && git commit -m "msg" && git push
# Vercel auto-deploys desde main. NO build manual en VPS.
```

`.env.local` debe existir antes de `npm run build` o el build rompe (Supabase client falla en SSR sin URL/key).

## Reglas técnicas inviolables
1. **`SUPABASE_SERVICE_ROLE_KEY` SOLO server-side, NUNCA en client components.** Commit `258f745` "fix: use service_role key server-side — anon key blocked by RLS" sentó el patrón: cuando un componente necesita leer productos saltando RLS, debe ser server component (default) o API route — JAMÁS un componente con `"use client"`. Si un Code futuro mete la key en un client component, el bundle público de Vercel la sirve a cualquier visitante.
2. **`src/lib/supabase.ts` es server-only.** No importarlo desde archivos con `"use client"`. Si hace falta lectura del catálogo client-side, exponé un API route (`src/app/api/...`) que use el client server-side internamente.
3. **NO usar `next build` o `rm -rf .next` en VPS.** Vercel se ocupa. Misma regla que synxia-dashboard / singo-landing.
4. **Tablas `emilia_*` en Supabase** son compartidas con synxia-brain (tenant `emilia`). NO escribir desde este sitio (ALTER, INSERT, UPDATE, DELETE) — solo lectura. Las mutaciones van por el bot via WhatsApp (handle-emilia.js + tools de synxia-brain).
5. **WhatsApp button** apunta al número productivo de Emilia (`5212225011994`, ver synxia-brain CLAUDE.md → tenant emilia → `alert_notify_phone`). Cambiarlo desvía leads.
6. **Fotos** en `public/` son productivas (commit `e6385b3` "feat: add 25 curated photos — hero, categories, Instagram sections"). Sustitución requiere criterio editorial alineado con la dueña.
7. **Mensajes de WhatsApp centralizados** en `src/lib/whatsapp.ts` (`enlaceWhatsApp(contexto)`), agregado en el PR "Medición para Ads" (oct-2026). EXCEPCIÓN: la ficha de producto (`src/app/catalogo/[slug]/page.tsx`) sigue usando `waProductUrl()` de `src/lib/types.ts` — NO pasa por el módulo nuevo, a propósito, porque ya tenía mensaje dinámico con nombre/precio del producto.
8. **Conversiones de Ads = SOLO clics reales en WhatsApp/`tel:`.** El listener vive ÚNICO en `src/components/ClickTracker.tsx` (montado en `layout.tsx`). NADA de `page_view` como conversión, y ningún botón debe tener su propio `onClick` de tracking copiado — eso rompería el "una sola implementación" que un test de `test/conversions.test.ts` guarda.
9. **Código de referencia en WhatsApp (leads con origen).** El mismo listener de `ClickTracker.tsx` también pide un código al brain (`src/lib/leadsRef.ts`, `NEXT_PUBLIC_LEADS_API_URL`) y lo agrega al texto prellenado — SOLO para enlaces de WhatsApp, y SOLO si la variable está configurada (fail-closed). `preventDefault()` únicamente ocurre en ese caso; sin la variable, el enlace navega exactamente igual que antes de esto. Ver `test/leadsRef.test.ts`.

## Deps externas
- Vercel (deploy + hosting).
- Supabase (mismo proyecto que synxia-brain — tablas `emilia_*`).
- GitHub `AxeStation/emiliaregalos-web` (source).

## NO tocar sin discusión Julu
- **Copy / fotos / categorías** del catálogo — pasaron por iteración con la dueña. Commits `48edc92` "7 website tweaks", `8cc7a00` "WA number across all files", `f21af8f` "show all 8 categories" reflejan acuerdos específicos.
- **Tablas `emilia_*`** — están gestionadas desde synxia-brain. Esquema y datos son fuente de verdad allá. Cambiar la lógica de lectura acá puede divergir de lo que el bot escribe.
- **Atribución a Synxia en footer** (commits `3a996db`, `6949193`, `94b1e3` polish) — es contractual, marca la relación cliente. NO remover.
- **Service role key rotation** — si se rota en Supabase, hay que actualizar `.env.local` local + Vercel env vars + `synxia-brain/.env` + `synxia-dashboard` env (y otros consumidores), todo en el mismo deploy. Coordinar con Julu para no romper nada silenciosamente.
- **`NEXT_PUBLIC_SUPABASE_URL`** parece "var de entorno" pero es pública e inyectada al bundle. Si se cambia el proyecto Supabase, hay que actualizarla en TODOS los consumidores (synxia-brain, synxia-dashboard, este sitio, catalog-generator). Migración de proyecto Supabase es decisión de negocio, no técnica.
