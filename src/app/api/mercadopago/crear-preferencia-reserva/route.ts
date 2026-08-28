import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || "",
});

export async function POST(req: Request) {
  try {
    const { reservaId, concepto, monto, clienteNombre, clienteEmail } = await req.json();

    if (!reservaId || !monto) {
      return NextResponse.json(
        { error: "Faltan datos requeridos (reservaId, monto)" },
        { status: 400 }
      );
    }

    const preference = new Preference(client);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://tu-dominio.com";

    const result = await preference.create({
      body: {
        items: [
          {
            id: reservaId,
            title: concepto || "Seña de Reserva - Estética",
            quantity: 1,
            unit_price: Number(monto),
            currency_id: "ARS",
          },
        ],
        payer: {
          name: clienteNombre || "Cliente",
          email: clienteEmail || "cliente@reserva.com",
        },
        external_reference: reservaId, // Se envía el UUID de Supabase para vincular el pago
        back_urls: {
          success: `${baseUrl}/reservas/exito?reserva_id=${reservaId}`,
          failure: `${baseUrl}/reservas?error=pago_fallido`,
          pending: `${baseUrl}/reservas/pendiente?reserva_id=${reservaId}`,
        },
        auto_return: "approved",
        notification_url: `${baseUrl}/api/mercadopago/webhook`,
      },
    });

    return NextResponse.json({ init_point: result.init_point });
  } catch (error: any) {
    console.error("Error al crear la preferencia de Mercado Pago:", error);
    return NextResponse.json(
      { error: "Error al generar la preferencia de pago" },
      { status: 500 }
    );
  }
}
