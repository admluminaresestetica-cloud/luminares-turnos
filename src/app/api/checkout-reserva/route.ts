import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { createClient } from "@supabase/supabase-js";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || "",
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { 
      clienteNombre, 
      clienteEmail, 
      clienteTelefono, 
      servicioDetalle, 
      fecha, 
      hora, 
      montoAPagar, // Seña o Total
      tipoPago // "sena" | "total"
    } = await request.json();

    if (!montoAPagar || montoAPagar <= 0) {
      return NextResponse.json(
        { error: "Monto inválido para el pago" },
        { status: 400 }
      );
    }

    // 1. Guardar la reserva pendiente en Supabase
    const { data: reserva, error: errorReserva } = await supabase
      .from("turnos")
      .insert({
        cliente_nombre: clienteNombre,
        cliente_email: clienteEmail || "",
        cliente_telefono: clienteTelefono || "",
        servicio_detalle: servicioDetalle,
        fecha,
        hora,
        monto_pagado: montoAPagar,
        tipo_pago: tipoPago,
        estado: "pendiente_pago",
      })
      .select()
      .single();

    if (errorReserva || !reserva) {
      console.error("Error al registrar reserva:", errorReserva);
      return NextResponse.json(
        { error: "No se pudo registrar la reserva" },
        { status: 500 }
      );
    }

    // 2. Crear Preferencia en Mercado Pago
    const preference = new Preference(client);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://luminaresestetica.com.ar";

    const result = await preference.create({
      body: {
        items: [
          {
            id: String(reserva.id),
            title: `Reserva ${tipoPago === 'sena' ? 'Seña' : 'Total'}: ${servicioDetalle}`,
            unit_price: Number(montoAPagar),
            quantity: 1,
            currency_id: "ARS",
          },
        ],
        external_reference: String(reserva.id),
        back_urls: {
          success: `${baseUrl}/reserva-confirmada?reserva_id=${reserva.id}`,
          failure: `${baseUrl}/?status=failure`,
          pending: `${baseUrl}/?status=pending`,
        },
        auto_return: "approved",
        notification_url: `${baseUrl}/api/webhooks/mercadopago`,
      },
    });

    return NextResponse.json({ init_point: result.init_point });
  } catch (error: any) {
    console.error("Error al generar checkout de reserva:", error);
    return NextResponse.json(
      { error: error?.message || "Error al procesar el pago" },
      { status: 500 }
    );
  }
}