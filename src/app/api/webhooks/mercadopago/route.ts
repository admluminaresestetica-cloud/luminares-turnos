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
    
    // Mercado Pago puede enviar la ID del pago en query params o en el body
    const type = searchParams.get("type") || searchParams.get("topic");
    const dataId = searchParams.get("data.id") || searchParams.get("id");

    if (type === "payment" && dataId) {
      const payment = new Payment(client);
      const paymentData = await payment.get({ id: dataId });

      // Verificamos si el pago fue aprobado
      if (paymentData.status === "approved") {
        const pedidoId = paymentData.external_reference;

        if (pedidoId) {
          // 1. Consultar el estado actual del pedido en Supabase
          const { data: pedido, error: errorPedido } = await supabase
            .from("pedidos")
            .select("*")
            .eq("id", pedidoId)
            .single();

          if (errorPedido) {
            console.error("Error al buscar el pedido:", errorPedido);
            return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
          }

          // 2. Si el pedido existía y aún estaba 'pendiente', procesamos la aprobación
          if (pedido && pedido.estado !== "aprobado") {
            // Actualizamos el estado del pedido
            await supabase
              .from("pedidos")
              .update({
                estado: "aprobado",
                payment_id: String(paymentData.id),
              })
              .eq("id", pedidoId);

            // 3. Descontamos el stock de cada producto del pedido
            if (Array.isArray(pedido.items)) {
              for (const item of pedido.items) {
                if (item.id && item.cantidad) {
                  await supabase.rpc("descontar_stock", {
                    producto_id: item.id,
                    cantidad_comprada: Number(item.cantidad),
                  });
                }
              }
            }
          }
        }
      }
    }

    // Mercado Pago requiere siempre una respuesta HTTP 200/204 para saber que se recibió la notificación
    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch (error: any) {
    console.error("Error en webhook de Mercado Pago:", error);
    // Respondemos 200 para evitar reintentos continuos si es un error interno no crítico
    return NextResponse.json({ error: error?.message || "Webhook handler error" }, { status: 200 });
  }
}