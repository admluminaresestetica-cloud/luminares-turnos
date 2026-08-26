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
        const pedidoId = paymentData.external_reference;

        if (pedidoId) {
          // 1. Marcar el pedido como aprobado
          const { data: pedido } = await supabase
            .from("pedidos")
            .update({
              estado: "aprobado",
              payment_id: String(dataId),
            })
            .eq("id", pedidoId)
            .select()
            .single();

          // 2. Descontar stock de los productos comprados
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