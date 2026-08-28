import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Preference, MercadoPagoConfig } from "mercadopago";

// 1. Desactiva la evaluación estática previa en tiempo de build
export const dynamic = "force-dynamic";

// Inicializar cliente de Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || "",
});

export async function POST(request: Request) {
  try {
    // 2. Traer credenciales e instanciar Supabase DENTRO del handler POST
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: "Faltan configurar las credenciales de Supabase en el servidor" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { 
      clienteNombre, 
      clienteEmail, 
      clienteTelefono, 
      servicioDetalle, 
      fecha, 
      hora, 
      montoAPagar, 
      tipoPago 
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