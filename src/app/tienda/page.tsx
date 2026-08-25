"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import CarritoDrawer from "@/components/CarritoDrawer";
import BannerCarousel from "./components/BannerCarousel";
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
  const [cargando, setCargando] = useState(true);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<string[]>(["Todos"]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("Todos");

  // Estado para el modal de detalle
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);

  // Cálculo seguro del total de ítems desde el contexto
  const context = useCarrito();
  const items = context?.items || context?.carrito || [];
  const totalItems = Array.isArray(items)
    ? items.reduce((acc: number, item: any) => acc + (item.cantidad || 1), 0)
    : 0;

  useEffect(() => {
    setMounted(true);

    const fetchProductos = async () => {
      setCargando(true);
      const { data, error } = await supabase.from("productos").select("*");
      if (error) {
        console.error("Error al cargar productos:", error);
      } else {
        setProductos(data || []);
      }
      setCargando(false);
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
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#12151B] text-base text-[#FFFFFF]">
            🛍️
          </span>
          <h2 className="m-0 text-lg font-bold tracking-tight text-[#12151B]">
            Tienda Oficial
          </h2>
        </div>

        <button
          onClick={() => setModalAbierto(true)}
          className="relative flex items-center justify-center gap-2 rounded-full border border-[#E7E5E0] bg-white px-4 py-2.5 text-sm font-semibold text-[#12151B] transition-colors hover:border-[#12151B]"
        >
          <span>🛒</span>
          <span>Mi Carrito</span>
          {totalItems > 0 && (
            <span className="ml-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#0E6E55] px-1 text-[11px] font-extrabold text-white">
              {totalItems}
            </span>
          )}
        </button>
      </nav>

      {/* Contenido Principal */}
      <div className="mx-auto max-w-[1150px] px-4 pb-16 pt-4 sm:px-10">
        {/* Carrusel exclusivo de la Tienda (Tabla: banners_tienda) */}
        <BannerCarousel />

        {/* Buscador y Categorías */}
        <BuscadorYCategorias
          busqueda={busqueda}
          onBusquedaChange={setBusqueda}
          categorias={categorias}
          categoriaSeleccionada={categoriaFiltro}
          onCategoriaSelect={setCategoriaFiltro}
        />

        <GridProductos
          productos={productosFiltrados}
          cargando={cargando}
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
