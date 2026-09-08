import { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import RedireccionarTienda from "./RedireccionarTienda";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Props {
  params: { id: string };
}

// 1. Metadatos dinámicos que lee el bot de WhatsApp (Servidor)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = params;

  const { data: producto } = await supabase
    .from("productos")
    .select("nombre, descripcion, precio, imagen_url")
    .eq("id", id)
    .single();

  if (!producto) {
    return {
      title: "Luminares Tienda Oficial",
      description: "Encontrá los mejores productos en Luminares.",
    };
  }

  const titulo = `${producto.nombre} - $${producto.precio.toLocaleString("es-AR")}`;
  const descripcion = producto.descripcion || "¡Mirá este producto en Luminares Tienda Oficial!";
  const imagen = producto.imagen_url || "https://www.mireservalumin.com.ar/og-image.jpg";
  const urlFinal = `https://www.mireservalumin.com.ar/tienda/producto/${id}`;

  return {
    title: titulo,
    description: descripcion,
    openGraph: {
      title: titulo,
      description: descripcion,
      url: urlFinal,
      siteName: "Luminares Tienda",
      images: [
        {
          url: imagen,
          width: 800,
          height: 800,
          alt: producto.nombre,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: titulo,
      description: descripcion,
      images: [imagen],
    },
  };
}

// 2. Componente de servidor que renderiza las etiquetas y delega la redirección al cliente
export default function ProductoPage({ params }: Props) {
  return <RedireccionarTienda productoId={params.id} />;
}
