import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { createClient } from "@supabase/supabase-js";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || "",
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || searchParams.get("topic");
    const dataId = searchParams.get("data.id") || searchParams.get("id");

    if (type === "payment" && dataId) {
      const payment = new Payment(client);
      const paymentData = await payment.get({ id: dataId });

      if (paymentData.status === "approved") {
        const externalRef = paymentData.external_reference;

        if (externalRef) {
          const montoAbonado = paymentData.transaction_amount || 0;

          // -------------------------------------------------------------
          // INTENTO 1: Verificar y actualizar si pertenece a una RESERVA
          // -------------------------------------------------------------
          const { data: reservaActualizada, error: errorReserva } = await supabase
            .from("reservas")
            .update({
              estado: "confirmado",
              estado_pago: "pagado",
              tipo_pago_elegido: "mercadopago",
              medio_pago: "mercadopago", // <--- AGREGADO AQUÍ
              monto_abonado: montoAbonado,
              mp_payment_id: String(dataId),
              updated_at: new Date().toISOString(),
            })
            .eq("id", externalRef)
            .select()
            .maybeSingle();

          if (errorReserva) {
            console.error("Error intentando actualizar reserva en webhook:", errorReserva);
          }

          // Si afectó una fila en 'reservas', cortamos aquí la ejecución exitosa
          if (reservaActualizada) {
            return NextResponse.json({ received: true, type: "reserva" }, { status: 200 });
          }

          // -------------------------------------------------------------
          // INTENTO 2: Si no fue reserva, actualizar en la TIENDA (pedidos)
          // -------------------------------------------------------------
          const { data: pedido, error: errorPedido } = await supabase
            .from("pedidos")
            .update({
              estado: "aprobado",
              payment_id: String(dataId),
            })
            .eq("id", externalRef)
            .select()
            .maybeSingle();

          if (errorPedido) {
            console.error("Error intentando actualizar pedido en webhook:", errorPedido);
          }

          // Descontar stock de los productos comprados si aplica
          if (pedido && pedido.items) {
            for (const item of pedido.items) {
              if (item.id) {
                const { data: prod } = await supabase
                  .from("productos")
                  .select("stock")
                  .eq("id", item.id)
                  .single();

                if (prod) {
                  const nuevoStock = Math.max(0, prod.stock - (item.cantidad || 1));
                  await supabase
                    .from("productos")
                    .update({ stock: nuevoStock })
                    .eq("id", item.id);
                }
              }
            }
          }
        }
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error("Error en webhook de Mercado Pago:", error);
    return NextResponse.json(
      { error: "Error procesando webhook" },
      { status: 500 }
    );
  }
}