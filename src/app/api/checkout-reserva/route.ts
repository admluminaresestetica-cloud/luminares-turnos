import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { createClient } from "@supabase/supabase-js";
import { obtenerConfiguracion } from "@/lib/supabase/configuracion-empresa";

export const dynamic = "force-dynamic";

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

    // 1. Leemos el token de Mercado Pago desde la base de datos o el .env
    const configEmpresa = await obtenerConfiguracion();
    const accessToken = configEmpresa?.mp_access_token || process.env.MP_ACCESS_TOKEN || "";

    if (!accessToken) {
      return NextResponse.json(
        { error: "No se configuró el Token de Mercado Pago." },
        { status: 500 }
      );
    }

    const client = new MercadoPagoConfig({ accessToken });

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
          success: `${baseUrl}/reserva-exitosa?reserva_id=${reservaId}`,
          failure: `${baseUrl}/?status=failure`,
          pending: `${baseUrl}/?status=pending`,
        },
        auto_return: "approved",
        notification_url: `${baseUrl}/api/webhooks/mercadopago`,
      },
    });

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