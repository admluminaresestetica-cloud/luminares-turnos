"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { ShoppingBag } from "lucide-react";
import CarritoDrawer from "@/components/CarritoDrawer";
import BannerCarousel from "./components/BannerCarousel";
import FooterTienda from "@/components/FooterTienda";
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
      const { data, error } = await supabase
        .from("productos")
        .select("*")
        .eq("activo", true);
        
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

  const resetearFiltros = () => {
    setBusqueda("");
    setCategoriaFiltro("Todos");
  };

  return (
    <div className="min-h-screen bg-[#F7F7F5] text-[#12151B] flex flex-col justify-between">
      <div>
        {/* Navbar */}
        <nav className="sticky top-0 z-50 flex items-center justify-between gap-3 border-b border-[#E7E5E0] bg-white/90 px-4 py-3 backdrop-blur-md sm:px-10 sm:py-4">
          {/* Logo y Título con enlace al inicio */}
          <Link
            href="https://www.mireservalumin.com.ar/tienda"
            onClick={resetearFiltros}
            className="flex min-w-0 items-center gap-2 sm:gap-3 cursor-pointer transition-opacity hover:opacity-80 active:scale-[0.98]"
          >
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center sm:h-12 sm:w-12">
              <Image
                src="/logotiendanegro.svg"
                alt="Logo Luminares"
                width={48}
                height={48}
                className="h-full w-full object-contain"
                priority
              />
            </div>

            <div className="flex min-w-0 flex-col leading-tight">
              <h2 className="m-0 truncate text-base font-bold tracking-tight text-[#12151B] sm:text-lg">
                Luminares
              </h2>
              <span className="hidden truncate text-[11px] font-medium text-[#6B675F] sm:block sm:text-sm">
                Tienda Oficial
              </span>
            </div>
          </Link>

          {/* Botón del Carrito */}
          <button
            onClick={() => setModalAbierto(true)}
            className="relative flex shrink-0 items-center justify-center gap-2 rounded-full border border-[#E7E5E0] bg-white p-2.5 text-sm font-semibold text-[#12151B] transition-all duration-200 hover:border-[#12151B]/40 hover:shadow-sm active:scale-95 sm:px-4 sm:py-2.5"
          >
            <ShoppingBag className="h-[18px] w-[18px] shrink-0 sm:h-4 sm:w-4" strokeWidth={2} />
            <span className="hidden sm:inline">Mi Carrito</span>

            {totalItems > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full border-2 border-white bg-[#0E6E55] px-1 text-[10px] font-extrabold leading-none text-white shadow-sm sm:static sm:ml-1 sm:h-5 sm:min-w-[20px] sm:border-0 sm:text-[11px]">
                {totalItems}
              </span>
            )}
          </button>
        </nav>

        {/* Contenido Principal */}
        <div className="mx-auto max-w-[1150px] px-4 pb-16 pt-4 sm:px-10">
          {/* Carrusel exclusivo de la Tienda */}
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

      {/* Footer exclusivo de la Tienda */}
      <FooterTienda />
    </div>
  );
}