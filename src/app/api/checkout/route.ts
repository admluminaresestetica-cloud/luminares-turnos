import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
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
    const body = await request.json();

    // =========================================================================
    // CASO 1: CHECKOUT DE RESERVA DE TURNOS (Seña 30% o Total 100%)
    // =========================================================================
    if (body.origen === "reserva" || body.reservaId) {
      const {
        reservaId,
        codigoReserva,
        titulo,
        monto,
        clienteNombre,
        tipoPago, // 'sena' | 'total'
      } = body;

      if (!reservaId || !monto) {
        return NextResponse.json(
          { error: "Faltan datos obligatorios para procesar la reserva." },
          { status: 400 }
        );
      }

      const preference = new Preference(client);
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://luminaresestetica.com.ar";

      const result = await preference.create({
        body: {
          items: [
            {
              id: String(codigoReserva || reservaId),
              title: String(titulo || "Reserva de Turno"),
              unit_price: Number(monto),
              quantity: 1,
              currency_id: "ARS",
            },
          ],
          external_reference: String(reservaId),
          payer: {
            name: String(clienteNombre || "Cliente Turno"),
          },
          metadata: {
            origen: "reserva",
            reserva_id: String(reservaId),
          },
          back_urls: {
            success: `${baseUrl}/?status=success_reserva&codigo=${codigoReserva || ""}`,
            failure: `${baseUrl}/?status=failure_reserva`,
            pending: `${baseUrl}/?status=pending_reserva`,
          },
          auto_return: "approved",
          notification_url: `${baseUrl}/api/webhooks/mercadopago`,
        },
      });

      // Guardar preference_id y la modalidad de pago en la tabla 'reservas'
      await supabase
        .from("reservas")
        .update({
          preference_id: (result as any).id,
          tipo_pago_elegido: tipoPago || "sena",
        })
        .eq("id", reservaId);

      return NextResponse.json({ init_point: (result as any).init_point });
    }

    // =========================================================================
    // CASO 2: CHECKOUT DE TIENDA ONLINE (100% de la compra)
    // =========================================================================
    const { itemsCarrito, cliente } = body;

    if (!itemsCarrito || itemsCarrito.length === 0) {
      return NextResponse.json(
        { error: "El carrito está vacío" },
        { status: 400 }
      );
    }

    const PORCENTAJE_RECARGO = 0.10;
    let totalPedido = 0;

    const itemsMP = itemsCarrito.map((item: any) => {
      const precioUnitario = Math.round((Number(item.precio) || 0) * (1 + PORCENTAJE_RECARGO));
      const cantidad = Number(item.cantidad) || 1;
      
      totalPedido += precioUnitario * cantidad;

      return {
        id: String(item.id || "prod"),
        title: String(item.nombre || "Producto"),
        unit_price: precioUnitario,
        quantity: cantidad,
        currency_id: "ARS",
      };
    });

    const { data: pedido, error: errorPedido } = await supabase
      .from("pedidos")
      .insert({
        cliente_nombre: cliente?.nombre || "Cliente Tienda",
        cliente_email: cliente?.email || "",
        cliente_telefono: cliente?.telefono || "",
        total: totalPedido,
        estado: "pendiente",
        items: itemsCarrito,
      })
      .select()
      .single();

    if (errorPedido || !pedido) {
      console.error("Error al registrar pedido en Supabase:", errorPedido);
      return NextResponse.json(
        { error: "No se pudo registrar el pedido en la base de datos" },
        { status: 500 }
      );
    }

    const itemsParaInsertar = itemsCarrito.map((item: any) => {
      const precioUnitario = Math.round((Number(item.precio) || 0) * (1 + PORCENTAJE_RECARGO));
      return {
        pedido_id: pedido.id,
        nombre_producto: String(item.nombre || "Producto"),
        cantidad: Number(item.cantidad) || 1,
        precio_unitario: precioUnitario,
      };
    });

    const { error: errorItems } = await supabase
      .from("pedido_items")
      .insert(itemsParaInsertar);

    if (errorItems) {
      console.error("Error al registrar los ítems del pedido en pedido_items:", errorItems);
    }

    const preference = new Preference(client);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://luminaresestetica.com.ar";

    const result = await preference.create({
      body: {
        items: itemsMP,
        external_reference: String(pedido.id),
        metadata: {
          origen: "tienda",
          pedido_id: String(pedido.id),
        },
        back_urls: {
          success: `${baseUrl}/?status=success`,
          failure: `${baseUrl}/?status=failure`,
          pending: `${baseUrl}/?status=pending`,
        },
        auto_return: "approved",
        notification_url: `${baseUrl}/api/webhooks/mercadopago`,
      },
    });

    await supabase
      .from("pedidos")
      .update({ preference_id: (result as any).id })
      .eq("id", pedido.id);

    return NextResponse.json({ init_point: (result as any).init_point });
  } catch (error: any) {
    console.error("Error al crear preferencia de Mercado Pago:", error);
    return NextResponse.json(
      { error: error?.message || "Error desconocido en el servidor" },
      { status: 500 }
    );
  }
}