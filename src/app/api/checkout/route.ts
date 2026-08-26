import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { createClient } from "@supabase/supabase-js";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || "",
});

// Inicializamos Supabase con la Service Role Key para operaciones del backend
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const { itemsCarrito, cliente } = await request.json();

    if (!itemsCarrito || itemsCarrito.length === 0) {
      return NextResponse.json(
        { error: "El carrito está vacío" },
        { status: 400 }
      );
    }

    const PORCENTAJE_RECARGO = 0.10;

    // 1. Mapeamos los ítems con recargo para Mercado Pago y calculamos el total del pedido
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

    // 2. Guardamos el pedido inicial en Supabase con estado 'pendiente'
    const { data: pedido, error: errorPedido } = await supabase
      .from("pedidos")
      .insert({
        cliente_nombre: cliente?.nombre || "Cliente Tienda",
        cliente_email: cliente?.email || "",
        cliente_telefono: cliente?.telefono || "",
        total: totalPedido,
        estado: "pendiente",
        items: itemsCarrito, // Mantenemos esto como respaldo
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

    // 2.1 NUEVO: Guardamos los ítems en la tabla relacional 'pedido_items' para el detalle
    const itemsParaInsertar = itemsCarrito.map((item: any) => {
      const precioUnitario = Math.round((Number(item.precio) || 0) * (1 + PORCENTAJE_RECARGO));
      return {
        pedido_id: pedido.id,
        nombre_producto: String(item.nombre || "Producto"),
        cantidad: Number(item.cantidad) || 1,
        precio: precioUnitario,
      };
    });

    const { error: errorItems } = await supabase
      .from("pedido_items")
      .insert(itemsParaInsertar);

    if (errorItems) {
      console.error("Error al registrar los ítems del pedido en pedido_items:", errorItems);
    }

    // 3. Creamos la preferencia en Mercado Pago asociando el ID del pedido
    const preference = new Preference(client);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://luminaresestetica.com.ar";

    const result = await preference.create({
      body: {
        items: itemsMP,
        external_reference: pedido.id, // Enlazamos el ID de Supabase
        back_urls: {
          success: `${baseUrl}/?status=success`,
          failure: `${baseUrl}/?status=failure`,
          pending: `${baseUrl}/?status=pending`,
        },
        auto_return: "approved",
        notification_url: `${baseUrl}/api/webhooks/mercadopago`,
      },
    });

    // 4. Actualizamos el pedido con el preference_id
    await supabase
      .from("pedidos")
      .update({ preference_id: result.id })
      .eq("id", pedido.id);

    return NextResponse.json({ init_point: result.init_point });
  } catch (error: any) {
    console.error("Error al crear preferencia de Mercado Pago:", error);
    return NextResponse.json(
      { error: error?.message || "Error desconocido en el servidor" },
      { status: 500 }
    );
  }
}