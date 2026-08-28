import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { createClient } from "@supabase/supabase-js";

const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || "",
});

// Usamos Service Role Key para actualizar la BD sin importar políticas RLS de lectura/escritura del cliente
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const topic = url.searchParams.get("topic") || url.searchParams.get("type");
    const paymentId = url.searchParams.get("data.id") || url.searchParams.get("id");

    if (topic === "payment" && paymentId) {
      const payment = new Payment(mpClient);
      const paymentData = await payment.get({ id: paymentId });

      if (paymentData.status === "approved") {
        const reservaId = paymentData.external_reference;

        if (reservaId) {
          const montoAbonado = paymentData.transaction_amount || 0;

          // Actualizamos el registro en la tabla "reservas"
          const { error } = await supabaseAdmin
            .from("reservas")
            .update({
              estado: "confirmado",
              estado_pago: "pagado",
              tipo_pago_elegido: "mercadopago",
              monto_abonado: montoAbonado,
              mp_payment_id: String(paymentId),
              updated_at: new Date().toISOString(),
            })
            .eq("id", reservaId);

          if (error) {
            console.error("Error al actualizar la reserva en Supabase:", error);
          }
        }
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Error en Webhook Mercado Pago:", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
