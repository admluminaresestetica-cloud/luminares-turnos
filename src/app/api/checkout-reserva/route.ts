import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || "",
});

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: "Faltan configurar las credenciales de Supabase" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const {
      reservaId,
      clienteNombre,
      clienteEmail,
      servicioDetalle,
      montoAPagar,
      tipoPago, // 'sena' | 'total'
    } = await request.json();

    if (!reservaId || !montoAPagar || montoAPagar <= 0) {
      return NextResponse.json(
        { error: "Faltan datos requeridos para procesar la reserva (reservaId, montoAPagar)" },
        { status: 400 }
      );
    }

    const preference = new Preference(client);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://luminaresestetica.com.ar";

    // Crear la preferencia en Mercado Pago usando el reservaId como external_reference
    const result = await preference.create({
      body: {
        items: [
          {
            id: String(reservaId),
            title: `Reserva ${tipoPago === "sena" ? "Seña" : "Total"}: ${servicioDetalle || "Servicio Estética"}`,
            unit_price: Number(montoAPagar),
            quantity: 1,
            currency_id: "ARS",
          },
        ],
        external_reference: String(reservaId),
        payer: {
          name: clienteNombre || "Cliente",
          email: clienteEmail || "cliente@reserva.com",
        },
        back_urls: {
          // Cambiado para redirigir a la nueva pantalla /reserva-exitosa
          success: `${baseUrl}/reserva-exitosa?reserva_id=${reservaId}`,
          failure: `${baseUrl}/?status=failure`,
          pending: `${baseUrl}/?status=pending`,
        },
        auto_return: "approved",
        notification_url: `${baseUrl}/api/webhooks/mercadopago`,
      },
    });

    // Opcional: Actualizamos el mp_preference_id en la reserva existente
    if (result.id) {
      await supabase
        .from("reservas")
        .update({
          mp_preference_id: String(result.id),
          tipo_pago_elegido: "mercadopago",
        })
        .eq("id", reservaId);
    }

    return NextResponse.json({ init_point: result.init_point });
  } catch (error: any) {
    console.error("Error al generar checkout de reserva:", error);
    return NextResponse.json(
      { error: error?.message || "Error al procesar el pago" },
      { status: 500 }
    );
  }
}