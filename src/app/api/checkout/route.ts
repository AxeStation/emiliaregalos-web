// src/app/api/checkout/route.ts
//
// C1: al confirmar el carrito, esto crea la COTIZACIÓN real en el
// dashboard vía su endpoint interno — NUNCA se inventa un objeto pedido
// propio de este repo. Proxy server-only: el shared secret
// (EMILIA_OPS_INTERNAL_SECRET) vive SOLO acá, nunca en el cliente. El
// cliente manda el borrador (items/tarjeta/comprador/destinatario) por
// POST /api/checkout, y ESTE handler arma el payload real y llama al
// dashboard.
//
// Mismos nombres de env var que ya usa el bot de WhatsApp de synxia-brain
// para pegarle al mismo endpoint (modules/tools/custom/emilia-ops/http-client.js):
// EMILIA_DASHBOARD_INTERNAL_URL + EMILIA_OPS_INTERNAL_SECRET. No se
// inventan nombres nuevos.

import { NextRequest, NextResponse } from 'next/server'
import { buildQuotePayload, type CheckoutDraft } from '@/lib/quote'

function str(v: unknown): string {
  return typeof v === 'string' ? v : ''
}

function obj(v: unknown): Record<string, unknown> {
  return v && typeof v === 'object' ? (v as Record<string, unknown>) : {}
}

export async function POST(req: NextRequest) {
  var baseUrl = (process.env.EMILIA_DASHBOARD_INTERNAL_URL || '').replace(/\/+$/, '')
  var secret = process.env.EMILIA_OPS_INTERNAL_SECRET || ''
  if (!baseUrl || !secret) {
    return NextResponse.json({ ok: false, error: 'checkout no configurado' }, { status: 503 })
  }

  var body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'JSON inválido' }, { status: 400 })
  }
  var b = obj(body)
  var card = obj(b.card)
  var buyer = obj(b.buyer)

  var draft: CheckoutDraft = {
    // Los items del cliente se re-validan tal cual llegan; buildQuotePayload()
    // ya rechaza un carrito vacío o mal formado — no hace falta duplicar esa
    // validación acá.
    items: Array.isArray(b.items) ? (b.items as CheckoutDraft['items']) : [],
    card: {
      message: str(card.message),
      to: str(card.to),
      from: str(card.from),
    },
    buyer: {
      name: str(buyer.name),
      phone: str(buyer.phone),
      email: str(buyer.email),
    },
    recipientName: str(b.recipientName),
  }

  var built = buildQuotePayload(draft)
  if (!built.ok) {
    return NextResponse.json({ ok: false, error: built.error }, { status: 400 })
  }

  try {
    var res = await fetch(baseUrl + '/api/internal/shop/emilia/quotes', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-emilia-internal-secret': secret },
      body: JSON.stringify(built.payload),
    })
    var data: unknown = null
    try { data = await res.json() } catch { /* respuesta sin cuerpo o no-JSON */ }
    var dataObj = obj(data)
    if (!res.ok) {
      return NextResponse.json({ ok: false, error: str(dataObj.error) || 'HTTP ' + res.status }, { status: res.status })
    }
    return NextResponse.json({ ok: true, quote: dataObj.quote })
  } catch {
    return NextResponse.json({ ok: false, error: 'No se pudo contactar al servidor. Intenta de nuevo.' }, { status: 502 })
  }
}
