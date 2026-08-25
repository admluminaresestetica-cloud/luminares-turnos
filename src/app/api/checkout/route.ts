import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || "",
});

export async function POST(request: Request) {
  try {
    const { itemsCarrito } = await request.json();

    if (!itemsCarrito || itemsCarrito.length === 0) {
      return NextResponse.json(
        { error: "El carrito está vacío" },
        { status: 400 }
      );
    }

    const PORCENTAJE_RECARGO = 0.10;

    const itemsMP = itemsCarrito.map((item: any) => {
      const precioConRecargo = Math.round((Number(item.precio) || 0) * (1 + PORCENTAJE_RECARGO));
      return {
        id: String(item.id || "prod"),
        title: String(item.nombre || "Producto"),
        unit_price: precioConRecargo,
        quantity: Number(item.cantidad) || 1,
        currency_id: "ARS",
      };
    });

    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: itemsMP,
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_BASE_URL || "https://luminaresestetica.com.ar"}/?status=success`,
          failure: `${process.env.NEXT_PUBLIC_BASE_URL || "https://luminaresestetica.com.ar"}/?status=failure`,
          pending: `${process.env.NEXT_PUBLIC_BASE_URL || "https://luminaresestetica.com.ar"}/?status=pending`,
        },
        auto_return: "approved",
      },
    });

    return NextResponse.json({ init_point: result.init_point });
  } catch (error: any) {
    console.error("Error al crear preferencia de Mercado Pago:", error);
    return NextResponse.json(
      { error: error?.message || "Error desconocido en el servidor" },
      { status: 500 }
    );
  }
}
