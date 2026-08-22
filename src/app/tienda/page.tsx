"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import ProductoCard from "@/app/tienda/components/ProductoCard";
import CarritoModal from "@/app/tienda/components/CarritoModal";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function TiendaPage() {
  const [productos, setProductos] = useState<any[]>([]);
  const [carrito, setCarrito] = useState<any[]>([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("Todos");

  useEffect(() => {
    const fetchProductos = async () => {
      const { data, error } = await supabase.from("productos").select("*");
      if (error) {
        console.error("Error al cargar productos:", error);
      } else {
        setProductos(data || []);
      }
    };
    fetchProductos();
  }, []);

  const productosFiltrados = productos.filter((p) => {
    const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCategoria = categoriaFiltro === "Todos" || p.categoria === categoriaFiltro;
    return coincideBusqueda && coincideCategoria;
  });

  const agregarAlCarrito = (producto: any) => {
    setCarrito([...carrito, producto]);
  };

  const eliminarDelCarrito = (index: number) => {
    const nuevoCarrito = carrito.filter((_, i) => i !== index);
    setCarrito(nuevoCarrito);
  };

  const enviarWhatsApp = () => {
    const resumen = carrito.map(p => `• ${p.nombre} ($${p.precio})`).join("%0A");
    const total = carrito.reduce((acc, p) => acc + Number(p.precio), 0);
    const mensaje = `Hola! Quiero encargar los siguientes productos:%0A%0A${resumen}%0A%0A*TOTAL: $${total}*%0A%0A¿Cómo coordinamos el pago y la entrega?`;

    // REEMPLAZÁ AQUÍ TU NÚMERO DE WHATSAPP (Ej: 5493411234567)
    window.open(`https://wa.me/TU_NUMERO_DE_WHATSAPP?text=${mensaje}`, "_blank");
  };

  const categorias = ["Todos", "Cremas", "Pañales", "Perfumes", "Otros"];

  return (
    <div className="min-h-screen bg-[#F7F7F5] text-[#12151B]">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-[#E7E5E0] bg-white/90 px-6 py-4 backdrop-blur-md sm:px-10">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#12151B] text-base text-white">
            🛍️
          </span>
          <h2 className="m-0 text-lg font-bold tracking-tight text-[#12151B]">
            Tienda Oficial
          </h2>
        </div>

        <button
          onClick={() => setModalAbierto(true)}
          className="relative flex items-center gap-2 rounded-full border border-[#E7E5E0] bg-white px-5 py-2.5 text-sm font-semibold text-[#12151B] transition-colors hover:border-[#12151B]"
        >
          🛒 Mi Carrito
          {carrito.length > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0E6E55] text-[11px] font-bold text-white">
              {carrito.length}
            </span>
          )}
        </button>
      </nav>

      {/* Hero */}
      <div
        className="relative overflow-hidden px-6 py-16 text-center text-white sm:py-20"
        style={{
          background: "radial-gradient(circle at 20% 20%, #1B2430 0%, #0B0F14 70%)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />
        <div className="relative mx-auto max-w-2xl">
          <span className="mb-4 inline-block rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs font-semibold tracking-wide text-[#D9B87A]">
            CATÁLOGO 2026
          </span>
          <h1 className="m-0 mb-3 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            Encontrá lo que buscás al mejor precio
          </h1>
          <p className="m-0 text-[15px] leading-relaxed text-white/60">
            Explorá nuestro catálogo, armá tu pedido de forma segura y recibilo directo en la puerta de tu casa.
          </p>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="mx-auto max-w-[1150px] px-6 pb-16 pt-8 sm:px-10">
        {/* Búsqueda */}
        <div className="mb-6">
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#A6A29B]">
              🔍
            </span>
            <input
              type="text"
              placeholder="Buscar productos por nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full rounded-xl border border-[#E7E5E0] bg-white py-4 pl-11 pr-4 text-[15px] text-[#12151B] outline-none transition-shadow placeholder:text-[#A6A29B] focus:border-[#0E6E55] focus:shadow-[0_0_0_3px_rgba(14,110,85,0.15)]"
            />
          </div>
        </div>

        {/* Filtros de categoría */}
        <div className="mb-8 flex flex-wrap gap-2.5">
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoriaFiltro(cat)}
              className={`rounded-full border px-5 py-2 text-sm font-semibold transition-all ${
                categoriaFiltro === cat
                  ? "border-[#12151B] bg-[#12151B] text-white shadow-[0_8px_20px_-8px_rgba(11,15,20,0.5)]"
                  : "border-[#E7E5E0] bg-white text-[#6B675F] hover:border-[#12151B]/30"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grilla de productos */}
        {productosFiltrados.length === 0 ? (
          <div className="rounded-2xl border border-[#E7E5E0] bg-white py-20 text-center">
            <span className="text-4xl">📦</span>
            <p className="mt-4 text-[15px] font-medium text-[#6B675F]">
              No se encontraron productos disponibles con esos filtros.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-6">
            {productosFiltrados.map((p) => (
              <ProductoCard key={p.id} producto={p} onAgregar={agregarAlCarrito} />
            ))}
          </div>
        )}
      </div>

      {/* Modal del carrito */}
      {modalAbierto && (
        <CarritoModal
          carrito={carrito}
          onClose={() => setModalAbierto(false)}
          onEliminar={eliminarDelCarrito}
          onEnviar={enviarWhatsApp}
        />
      )}
    </div>
  );
}