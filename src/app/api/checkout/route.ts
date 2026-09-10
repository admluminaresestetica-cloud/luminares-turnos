import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { createClient } from "@supabase/supabase-js";
import { obtenerConfiguracion } from "@/lib/supabase/configuracion-empresa";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    // 1. Obtenemos credenciales dinámicas de la DB o .env como respaldo
    const configEmpresa = await obtenerConfiguracion();
    const accessToken = configEmpresa?.mp_access_token || process.env.MP_ACCESS_TOKEN || "";

    if (!accessToken) {
      return NextResponse.json(
        { error: "No se configuró el Token de Mercado Pago." },
        { status: 500 }
      );
    }

    const client = new MercadoPagoConfig({ accessToken });

    const { itemsCarrito, cliente } = await request.json();

    if (!itemsCarrito || !Array.isArray(itemsCarrito) || itemsCarrito.length === 0) {
      return NextResponse.json(
        { error: "El carrito está vacío" },
        { status: 400 }
      );
    }

    const PORCENTAJE_RECARGO = 0.10;
    let totalPedido = 0;
    const itemsMP = [];
    const itemsValidados = [];

    const tablasASecundar = ["servicios_laser", "promos_laser", "productos", "servicios_generales"];

    for (const item of itemsCarrito) {
      const productoId = item.id;
      const cantidad = Number(item.cantidad) || 1;

      if (!productoId) {
        return NextResponse.json(
          { error: "Hay un producto sin ID válido en el carrito" },
          { status: 400 }
        );
      }

      // Si es el ítem especial de Envío / Cadetería, lo procesamos directo sin consultar a la DB
      if (productoId === "envio-cadeteria") {
        const precioOficial = Number(item.precio) || 0;
        const precioUnitarioConRecargo = Math.round(precioOficial * (1 + PORCENTAJE_RECARGO));

        totalPedido += precioUnitarioConRecargo * cantidad;

        itemsMP.push({
          id: "envio-cadeteria",
          title: String(item.nombre || "Costo de Cadetería / Envío"),
          unit_price: precioUnitarioConRecargo,
          quantity: cantidad,
          currency_id: "ARS",
        });

        itemsValidados.push({
          nombre_producto: String(item.nombre || "Costo de Cadetería / Envío"),
          cantidad: cantidad,
          precio_unitario: precioUnitarioConRecargo,
        });

        continue; // Pasa al siguiente ítem
      }

      let productoDb = null;

      for (const tabla of tablasASecundar) {
        const { data, error } = await supabase
          .from(tabla)
          .select("id, nombre, precio")
          .eq("id", productoId)
          .single();

        if (data && !error) {
          productoDb = data;
          break;
        }
      }

      if (!productoDb) {
        return NextResponse.json(
          { error: `El producto o servicio con ID ${productoId} no es válido.` },
          { status: 400 }
        );
      }

      const precioOficial = Number(productoDb.precio) || 0;
      const precioUnitarioConRecargo = Math.round(precioOficial * (1 + PORCENTAJE_RECARGO));

      totalPedido += precioUnitarioConRecargo * cantidad;

      itemsMP.push({
        id: String(productoDb.id),
        title: String(productoDb.nombre),
        unit_price: precioUnitarioConRecargo,
        quantity: cantidad,
        currency_id: "ARS",
      });

      itemsValidados.push({
        nombre_producto: String(productoDb.nombre),
        cantidad: cantidad,
        precio_unitario: precioUnitarioConRecargo,
      });
    }

    // Registramos el pedido
    const { data: pedido, error: errorPedido } = await supabase
      .from("pedidos")
      .insert({
        nombre_cliente: cliente?.nombre || "Cliente Tienda",
        telefono_cliente: cliente?.telefono || "",
        cliente_email: cliente?.email || "",
        total: totalPedido,
        estado: "pendiente",
        items: itemsValidados,
        metodo_envio: cliente?.metodoEnvio || cliente?.metodoEntrega || "retiro",
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

    const itemsParaInsertarConId = itemsValidados.map((item) => ({
      ...item,
      pedido_id: pedido.id,
    }));

    const { error: errorItems } = await supabase
      .from("pedido_items")
      .insert(itemsParaInsertarConId);

    if (errorItems) {
      console.error("Error al registrar los ítems del pedido:", errorItems);
    }

    // Creamos la preferencia con la instancia dinámica de MP
    const preference = new Preference(client);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://luminaresestetica.com.ar";

    const result = await preference.create({
      body: {
        items: itemsMP,
        external_reference: pedido.id,
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
