"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import CarritoDrawer from "@/components/CarritoDrawer";
import { useCarrito } from "@/context/CarritoContext";
import { Producto } from "@/types/tienda";

// Componentes modularizados
import BuscadorYCategorias from "./components/BuscadorYCategorias";
import GridProductos from "./components/GridProductos";
import ModalDetalleProducto from "./components/ModalDetalleProducto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function TiendaPage() {
  const [mounted, setMounted] = useState(false);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<string[]>(["Todos"]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("Todos");

  // Estado para el modal de detalle
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);

  const { totalItems } = useCarrito();

  useEffect(() => {
    setMounted(true);

    const fetchProductos = async () => {
      const { data, error } = await supabase.from("productos").select("*");
      if (error) {
        console.error("Error al cargar productos:", error);
      } else {
        setProductos(data || []);
      }
    };

    const fetchCategorias = async () => {
      const { data, error } = await supabase
        .from("categorias")
        .select("nombre")
        .order("nombre", { ascending: true });

      if (error) {
        console.error("Error al cargar categorías:", error);
      } else if (data && data.length > 0) {
        setCategorias(["Todos", ...data.map((c) => c.nombre)]);
      }
    };

    fetchProductos();
    fetchCategorias();
  }, []);

  if (!mounted) return null;

  const productosFiltrados = productos.filter((p) => {
    const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCategoria = categoriaFiltro === "Todos" || p.categoria === categoriaFiltro;
    return coincideBusqueda && coincideCategoria;
  });

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
          {totalItems > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0E6E55] text-[11px] font-bold text-white">
              {totalItems}
            </span>
          )}
        </button>
      </nav>

      {/* Hero / Banner */}
      <div
        className="relative overflow-hidden px-6 py-12 text-center text-white sm:py-16"
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
          <span className="mb-3 inline-block rounded-full border border-white/20 bg-white/5 px-4 py-1 text-xs font-semibold tracking-wide text-[#D9B87A]">
            CATÁLOGO
          </span>
          <h1 className="m-0 mb-2 text-2xl font-bold leading-tight tracking-tight sm:text-4xl">
            Encontrá lo que buscás al mejor precio
          </h1>
          <p className="m-0 text-xs sm:text-sm leading-relaxed text-white/60">
            Explorá nuestro catálogo, armá tu pedido de forma segura y recibilo directo en la puerta de tu casa.
          </p>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="mx-auto max-w-[1150px] px-4 pb-16 pt-6 sm:px-10">
        {/* Módulo de Búsqueda y Categorías */}
        <BuscadorYCategorias
          busqueda={busqueda}
          onBusquedaChange={setBusqueda}
          categorias={categorias}
          categoriaSeleccionada={categoriaFiltro}
          onCategoriaSelect={setCategoriaFiltro}
        />

        {/* Grilla Modular de Productos (2 por fila en móvil) */}
        <GridProductos
          productos={productosFiltrados}
          onVerDetalle={(prod) => setProductoSeleccionado(prod)}
        />
      </div>

      {/* Modal de Detalle de Producto */}
      <ModalDetalleProducto
        producto={productoSeleccionado}
        onClose={() => setProductoSeleccionado(null)}
      />

      {/* Drawer del Carrito */}
      <CarritoDrawer
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
      />
    </div>
  );
}
